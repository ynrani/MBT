var desc = {
DB_IO_ERROR:"Service Error !!! Cannot perform database IO.",
SYNTAX_ERROR:"Server Error.",
ACCESS_DENIED:"Access Denied !!! You are not authorised to use this service.",
SUCCESS:"Success",
REQUEST_SERVICE_REQUIRED:"Service code required",
REQUEST_VM_SERVER_IP_REQUIRED:"VM server IP is required",
REQUEST_MH_SERVER_IP_REQUIRED:"MH server IP is required",
USR_UPDATE_FAILED:"Service Error !!! Cannot update User details.",
SERVICE_UPDATE_FAILED:"Error in update. Please check log for more details.",
USR_ACCESS_FAILED:"Unauthorized user access",
USR_ACCOUNT_LOCKED:"Account locked !!! You have crossed maximum wrong attempts.",
USR_NOT_ACTIVE:"User is not active",
USR_PASS_INCORRECT:["Login Failed - incorrect userid or password. "," attempts left."],
USR_PASS_INVALID:"Error !!! Only alphanumeric and dont(.) characters are allowed in password.",
// USR_USERID_INCORRECT:"Invalid userId",
USR_USERID_INCORRECT:"Login Failed - incorrect userid or password",
USR_USERID_REQUIRED:"UserId required",
USR_PASS_REQUIRED:"Password required",
USR_NAME_REQUIRED:"User name required",
USR_NAME_INCORRECT:"User name incorrect",
USR_EMAIL_REQUIRED:"User Email required",
USR_EMAIL_INCORRECT:"Error !!! Invalid email id.",
USR_ROLE_REQUIRED:"User role required",
USR_STATUS_REQUIRED:"User status required",
USR_ID_ALREADY_EXIST:"User ID already exist",
USR_EMAIL_ALREADY_EXIST:"User email already exist",
USR_APIKEY_REQUIRED:"API key required",
USR_ENDDATE_EXCEEDED_ADMIN:"User access end date should be less than or equal to Admin's access end date",
NO_VM_IN_LIST:"No Virtual Machine found.",
NO_OS_IN_LIST:"No Operating system found.",
NO_BROWSER_IN_LIST:"No such browser found.",
NO_VIR_CAT_IN_LIST:"No Virtualization category found, please configure it first.",
NO_VIR_TYPE_IN_LIST:"No Virtualization type found, please configure it first.",
NO_HOST_SERVER_IN_LIST:"No host server found, please configure it first.",
NO_VM_AUTH_DETAILS:"VMX Auth details not present in DB, please configure it first",
// NO_USR_ID_FOUND:"Invalid User id.",
NO_USR_ID_FOUND:"Login Failed - incorrect userid or password",
VIR_CAT_CATEGORY:"Virtualization category required",
SESSION_EXPIRED:"Your session has expired, please sign-in again.",
OS_NAME_REQUIRED:"Operating system required",
OS_NOT_AVAILABLE:"Unfortunate no Operating system is free right now. Please try after some time.",
OS_ID_REQUIRED:"Operating system ID required.",
OS_TYPE_REQUIRED:"Operating system type required.",
BROWSER_ID_REQUIRED:"Browser Id required",
BROWSER_VERSION_ID_REQUIRED:"Browser version Id required",
BROWSER_VERSION_REQUIRED:"Browser version required",
BROWSER_TYPE_REQUIRED:"Browser type required",
BROWSER_REQUIRED:"Browser required",
TEST_URL_REQUIRED:"Test URL required",
SNAPSHOT_NOT_EXIST:"No such snapshot.",
SNAPSHOT_PATH_REQUIRED:"Snapshot path required.",
SNAPSHOT_REQUIRED:"Snapshot required.",
SERVER_ID_REQUIRED:"Server ID required.",
VM_PATH_REQUIRED:"VM path .vmx required.",
VM_IP_REQUIRED:"VM IP required.",
SCREENSHOT_ID_REQUIRED:"Screenshot ID required.",
SCREENSHOT_NOT_FOUND:"No such screenshot found.",
VMWARE_SERVICE_COMMAND_EXECUTION_FAILED:"VMWare command execution failed.",
BROWSER_LAUNCHER_FAILED:"Error while launching browser.",
BASE64_REQUIRED:"Base64 format is required.",
FILE_IO_ERROR:"FILE IO ERROR.",
FILE_DELETE_ERROR:"Could not delete selected file, please contact administrator.",
NAT_IP_ERROR:"Could not resolve NAT IP. Please configure in IPResolver.",
BROWSER_COMMAND_NOT_FOUND:"Could not find Browser Launch command. Please configure first.",
AWS_SERVICE_COMMAND_EXECUTION_FAILED:"Amazon command execution failed",
NO_INSTANCE_IN_LIST:"No such Instance found.",
NO_INSTANCE_CONNECTIVITY:"Can't connect to instance",
REQUEST_PENDING:"Still processing the previous request, please wait.",
DEMO_TRIAL_EXPIRED:"Trial account expired",
DEMO_TRIAL_CONF_ERROR:"Trial account is not configured properly",
ACCOUNT_EXPIRED:"Account expired. Please contact Adminstrator",
BUS_AC_NAME_REQUIRED:"Business account name required.",
BUS_AC_NAME_INCORRECT:"Incorrect Business account name format.",
BUS_AC_DESC_REQUIRED:"Business account description required.",
BUS_AC_DESC_INCORRECT:"Incorrect Business account description format.",
BUS_AC_LOCATION_REQUIRED:"Business account location required.",
BUS_AC_LOCATION_INCORRECT:"Incorrect Business account location format.",
BUS_AC_STATUS_REQUIRED:"Business account status required.",
BUS_AC_EXISTS:"Business account already exist.",
BUS_AC_NOT_FOUND:"Business account does not exist.",
BUS_AC_ID_REQUIRED:"Business account ID required.",
VIRT_TYPE_NAME_NOT_FOUND:"Name is required for virtualization type.",
VIRT_TYPE_NAME_INCORRECT:"Incorrect Virtualization Type name format.",
VIRT_TYPE_NAME_EXISTS:"Virtualization type with the same name already exist.",
VIRT_TYPE_NOT_FOUND:"Virtualization type not found.",
VIRT_TYPE_ID_REQUIRED:"Virtualization Type ID required",
HOST_SERVER_NAME_NOT_FOUND:"Host server name is required.",
HOST_SERVER_NOT_FOUND:"Host server does not exist.",
HOST_SERVER_ID_REQUIRED:"Host server ID is required.",
HOST_SERVER_IP_EXISTS:"Host server IP already exists.",
HOST_SERVER_NAME_INCORRECT:"Incorrect Host server name format.",
HOST_SERVER_IP_REQUIRED:"Host server IP is required.",


ACCESS_NOT_ALLOWED_FOR_DIFFERENT_PROJECT : "Invalid user access",
NO_MODELS_IN_LIST:"No model found.",
EMPTY_DIAGRAM_DATA:"Can't save empty model.",
MODEL_VERSION_ID_REQUIRED:"Model version ID required.",
MODEL_VERSION_REQUIRED:"Model version required.",
INVALID_MODEL_VERSION_ID:"Invalid model version ID.",
DUPLICATE_MODEL_VERSION:"Duplicate model version name.",
PROJECT_NAME_REQUIRED:"Project name required.",
DUPLICATE_PROJECT:"Project name already exist.",
DUPLICATE_ACCOUNT:"Business Account already exist.",
MODULE_NAME_REQUIRED:"Module name required.",
PROJECT_ID_REQUIRED:"Project ID required.",
INVALID_PROJECT_ID:"Invalid project ID.",
INVALID_MODULE_ID:"Invalid Module ID.",
INVALID_MODEL_ID:"Invalid Model ID.",
DUPLICATE_MODULE:"Module name already exist.",
DUPLICATE_MODEL:"Model name already exist.",
MODEL_NAME_REQUIRED:"Model name is required.",
MODEL_VERSION_ALREADY_PUBLISHED:"Model version is already published.",
CANNOT_MODIFY_PUBLISHED_MODEL_VERSION:"You can't modify published model version.",
CANNOT_GENERATE_SCENARIOS_PUBLISHED_MODEL_VERSION:"You can't generate scenarios on published model version.",
CANNOT_IMPORT_PUBLISHED_MODEL_VERSION:"You can't import on published model version.",
CANNOT_UPDATE_SCENARIO_PUBLISHED_MODEL_VERSION:"You can't update scenario details on published model version.",
CANNOT_UPDATE_TEST_CONDITIONS_PUBLISHED_MODEL_VERSION:"You can't update Test Condition data on published model version.",
MODEL_LOCKED:"ERROR !!! Can't create new version because it is locked by ",
SCENARIO_NAME_REQUIRED:"ERROR !!! Scenario name is required",
SCENARIO_CRITICALITY_REQUIRED:"ERROR !!! Scenario criticality is required",
SCENARIO_DEFECT_REQUIRED:"ERROR !!! Scenario defect is required",
SCENARIO_SEVERITY_REQUIRED:"ERROR !!! Scenario severity is required",
SCENARIO_RISK_EXPOSER_REQUIRED:"ERROR !!! Scenario risk exposer is required",
SCENARIO_TESTING_EFFORT_REQUIRED:"ERROR !!! Scenario testing effort is required",
SCENARIO_PRIMARY_FLOW_REQUIRED:"ERROR !!! Scenario primary effort is required",
SCENARIO_ID_REQUIRED:"ERROR !!! Scenario id is required",
INVALID_SCENARIO_ID:"Invalid Scenario ID.",
SAVE_DIAGRAM_DATA:"Please save Diagram data and then click on Generate Scenarios icon",
DATA_NO_EXIST:"No Component data exist to download component excel sheet",
Test_NO_EXIST:"No test data exist to download component excel sheet"
}

module.exports.errorDesc = {
  desc: desc
};