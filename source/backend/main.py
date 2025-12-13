import argparse

from src.server import server


def main():
    # Parse command-line arguments for the port
    parser = argparse.ArgumentParser(description="Run the backend-server")
    parser.add_argument("-p", "--port", type=int, default=15123, help="Port to run the server on (default: 15123)")
    args = parser.parse_args()

    # Run the server on the specified port
    server.run(host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    main()
