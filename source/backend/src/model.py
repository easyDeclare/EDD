from Declare4Py.D4PyEventLog import D4PyEventLog
from Declare4Py.ProcessMiningTasks.Discovery.DeclareMiner import DeclareMiner


def modelToDeclString(model):
    """
    Convert a DeclareModel object to a string representation. The output is the same of model.to_file() in .decl format.
    This function has been created to avoid the need of writing the model to a file and reading it back.
    :param model: DeclareModel object
    :return: String representation of the model
    """
    result = ""
    for activity_name in model.activities:
        result += f"activity {activity_name}\n"
    for constraint in model.serialized_constraints:
        result += f"{constraint}\n"
    return result


def discoverModel(
    log_path,
    case_name="case:concept:name",
    consider_vacuity=False,
    min_support=0.2,
    itemsets_support=0.9,
    max_declare_cardinality=3,
):
    event_log = D4PyEventLog(case_name=case_name if case_name is not None else "case:concept:name")
    event_log.parse_xes_log(log_path)
    discovery = DeclareMiner(
        log=event_log,
        consider_vacuity=consider_vacuity if consider_vacuity is not None else False,
        min_support=min_support if min_support is not None else 0.2,
        itemsets_support=itemsets_support if itemsets_support is not None else 0.9,
        max_declare_cardinality=max_declare_cardinality if max_declare_cardinality is not None else 3,
    )
    discovered_model = discovery.run()
    declString = modelToDeclString(discovered_model)
    return declString
