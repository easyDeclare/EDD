import gzip
import traceback
import uuid
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from .model import discoverModel


def save_compressed_string(content: str, path: Path) -> None:
    """
    Saves the provided string `content` to a gzip-compressed file at the specified `path`.

    The file path must end with '.xes.gz'. The function creates any missing parent directories.

    Args:
        content (str): The string to be saved.
        path (Path): The Path object specifying the location of the output file.

    Raises:
        ValueError: If the provided path does not end with '.xes.gz'.
    """
    # Verify that the file name ends with '.xes.gz'
    if not path.name.endswith(".xes.gz"):
        raise ValueError("The file path must end with '.xes.gz'")

    # Ensure the parent directories exist
    path.parent.mkdir(parents=True, exist_ok=True)

    # Open the file in write-text mode with gzip compression and save the content
    with gzip.open(path, "wt", encoding="utf-8") as gz_file:
        gz_file.write(content)


# Initialize the Flask app
server = Flask("server")

# Enable CORS
CORS(server)


@server.route("/", methods=["GET"])
def index():
    return jsonify({"ok": True, "message": "server is running"})


@server.route("/discover-xes", methods=["POST"])
def discover_xes():
    try:
        # Get the parameters from the request
        request_data = request.get_json()

        if not request_data:
            return jsonify({"ok": False, "error": "Missing or invalid JSON payload"})

        xes_log = request_data.get("xes_log", None)
        case_name = request_data.get("case_name", "case:concept:name")
        consider_vacuity = request_data.get("consider_vacuity", False)
        min_support = request_data.get("min_support", 0.2)
        itemsets_support = request_data.get("itemsets_support", 0.9)
        max_declare_cardinality = request_data.get("max_declare_cardinality", 3)

        if xes_log == "undefined" or xes_log == "" or xes_log is None:
            return jsonify({"ok": False, "error": "No xes_log provided"})

        if case_name == "undefined" or case_name == "" or case_name is None:
            case_name = "case:concept:name"
        if consider_vacuity == "undefined" or consider_vacuity == "" or consider_vacuity is None:
            consider_vacuity = False
        if min_support == "undefined" or min_support == "" or min_support is None:
            min_support = 0.2
        if itemsets_support == "undefined" or itemsets_support == "" or itemsets_support is None:
            itemsets_support = 0.9
        if max_declare_cardinality == "undefined" or max_declare_cardinality == "" or max_declare_cardinality is None:
            max_declare_cardinality = 3

        params = {
            "xes_log": xes_log,
            "case_name": case_name,
            "consider_vacuity": consider_vacuity,
            "min_support": min_support,
            "itemsets_support": itemsets_support,
            "max_declare_cardinality": max_declare_cardinality,
        }

        # Save the file
        filepath = Path.home().joinpath(str(uuid.uuid4()) + ".xes.gz")
        save_compressed_string(xes_log, filepath)

        # Discover the model
        declString = discoverModel(
            log_path=str(filepath.resolve()),
            case_name=case_name,
            consider_vacuity=consider_vacuity,
            min_support=min_support,
            itemsets_support=itemsets_support,
            max_declare_cardinality=max_declare_cardinality,
        )

        # Delete the file
        filepath.unlink()

        return jsonify({"ok": True, "params": params, "model": declString})

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"ok": False, "error": str(e), "traceback": traceback.format_exc(), "request": request})


@server.route("/discover-xes-gz", methods=["POST"])
def discover_xes_gz():
    try:
        # Check if the POST request has the file part.
        if "file" not in request.files:
            return jsonify({"ok": False, "error": "No file part in the request"})

        file = request.files["file"]

        # If no file was selected, return an error.
        if file.filename == "":
            return jsonify({"ok": False, "error": "No selected file"})

        # Get the parameters from the request

        case_name = request.form.get("case_name", "case:concept:name", str)
        consider_vacuity = request.form.get("consider_vacuity", False, bool)
        min_support = request.form.get("min_support", 0.2, float)
        itemsets_support = request.form.get("itemsets_support", 0.9, float)
        max_declare_cardinality = request.form.get("max_declare_cardinality", 3, int)

        if case_name == "undefined" or case_name == "":
            case_name = "case:concept:name"
        if consider_vacuity == "undefined" or consider_vacuity == "":
            consider_vacuity = False
        if min_support == "undefined" or min_support == "":
            min_support = 0.2
        if itemsets_support == "undefined" or itemsets_support == "":
            itemsets_support = 0.9
        if max_declare_cardinality == "undefined" or max_declare_cardinality == "":
            max_declare_cardinality = 3

        params = {
            "case_name": case_name,
            "consider_vacuity": consider_vacuity,
            "min_support": min_support,
            "itemsets_support": itemsets_support,
            "max_declare_cardinality": max_declare_cardinality,
        }

        # Save the file
        filepath = Path.home().joinpath(str(uuid.uuid4()) + ".xes.gz")
        file.save(filepath)

        # Discover the model
        declString = discoverModel(
            log_path=str(filepath.resolve()),
            case_name=case_name,
            consider_vacuity=consider_vacuity,
            min_support=min_support,
            itemsets_support=itemsets_support,
            max_declare_cardinality=max_declare_cardinality,
        )

        # Delete the file
        filepath.unlink()

        return jsonify({"ok": True, "params": params, "model": declString})

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"ok": False, "error": str(e), "traceback": traceback.format_exc(), "request": request.form})
