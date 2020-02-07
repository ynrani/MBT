var tableObj = {
register : '',
auditLog : '',
roleList : '',
projectList : '',
project : '',
model : '',
modelVersion : '',
AllowedWrongAttempts:5,
ApplicationIP:"10.51.22.104",
NAWServerIP:"52.66.7.30",
MHPort:"9990", //need to change in all NVA,NAW servers and check in IServer
NVWServerPort:"9000", //Server port for VMware workstation node server and fusion
NAWServerPort:"9000", //Server port for AWS node server
IServerPort:"9000", //Server port for Instance node server
ApplicationName:"iAuthor",
AutoDeleteScreenshot:true,
AutoDeleteScreenshotDays:20, // if screenshot is 20 days old then it will be deleted
VNCTimeout:8, // in minutes
publicFolder:'public',
documentFolder:'doc',
screenshotFolder:'screenshots',
screenshotDefaultExtension:'.png',
wordDocumentDefaultName:'Screenshots',
wordDocumentDefaultExtension:'.doc',
}

var serviceObj ={
USI : 'User SignIn',
USO : 'User Signout',
GML : 'Get All Model versions',
SGVD : 'Save Model Version',
CNP : 'Create New Project',
CNM : 'Create New Module',
CND : 'Create New Diagram',
CNDV : 'Create New Diagram version',
USD : 'Update Scenario Data',
CGS : 'Create Generated Scenarios',
GAS : 'Get All Scenarios',
GAPD : 'Get All Project Details',
ASI : 'Admin Service - Update Role',
GUL : 'Get User List',
CU : 'Create User',
EU : 'Edit User',
SMV : 'Select Model Vesion',
VM : 'Get Version Model',
TCO : 'Create Test Condition',
TCR : 'Remove Test Condition',
TCA : 'Get All Test Conditions',
TCU : 'Update Test Condition',
TDO : 'Create Test Data',
TDR : 'Remove Test Data',
TDTCR : 'Remove Test Data For Test Condition',
TDA : 'Get All test Data',
TDU : 'Test Data Update',
SCOM : 'Service Copy - Get All Models',
SCOV : 'Service Copy - Get All Versions',
SCOC : 'Service Copy - Create Model Version',
DMV : 'Delete Model version',
DD : 'Delete Diagram',
DM : 'Delete Module',
DP : 'Delete Project',
EXS : 'Export Excel Service',
TXS : 'TestSuite Export Service',
IWF : 'Import VSDX Work Flow',
TDD : 'Component Test Data Document Export',
MTD : 'Manual Test Case Document Export',
GAR : 'Get All Roles',
GBA : 'Get Business Accounts',
GAP : 'Get Associated Projects',
CBA : 'Create Business Account',
DELU : 'Delete User',
SMD : 'Get Step Master Data',
DL  : 'Daigram Lock'
}

module.exports.dbConstants = {
  tableObj: tableObj
};

module.exports.import ={
    importDir: '.\\doc-upload\\'
};

module.exports.log4js ={
    logDir: '.\\log\\'
};

module.exports.service ={
    dataObj: serviceObj
}
