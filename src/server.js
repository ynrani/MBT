var httpRequest = importPackage('request');
global.crypto = importPackage('./package/api/cipher.js');
global.errorCodes = require("./package/constants/errorCodes.js");
global.errorDescs = require("./package/constants/errorDetails_en.js");
global.validation = require("./package/validation/validation.js");
var cluster = importPackage('cluster');
var log4js = importPackage('log4js');
var HashMap = require('hashmap');

var express = importPackage('express');
var bodyParser = importPackage('body-parser');
var querystring = importPackage('querystring');
var helmet = require('helmet');
var http = importPackage('http');
var app = express();
global.fs= importPackage("fs-extra");

global.appConstants = importPackage("./package/constants/constants.js");

global.fs.ensureDir(global.appConstants.log4js.logDir, function(err){
	if(err) console.log('Error occured while creating log directory');
})

global.fs.ensureDir(global.appConstants.import.importDir, function(err){
	if(err) console.log('Error occured while creating import directory');
})

log4js.configure('./package/log4js.json');
global.accessLog = log4js.getLogger('http');
global.appLog = log4js.getLogger('application');
global.errorLog = log4js.getLogger('error');

app.use(helmet());
/* app.use(helmet.noCache()); */
app.use(bodyParser.json({limit: '50mb', parameterLimit: 1000000}));
app.use(bodyParser.urlencoded({extended:true,limit: '50mb',parameterLimit: 1000000}));

app.use(logResponseBody);
var cookieParser = importPackage('cookie-parser');
app.use(cookieParser("iAuthor_AUTHENTICATION"));


	process.on('uncaughtException', function (exception) {
		global.errorLog.error(exception);
		return;
	});
	
/* process.env.NODE_ENV = "production"; */
app.disable('x-powered-by');
	function log(logs){

		global.fs.appendFile("log.txt","\n"+logs);

	}
var database = importPackage("./package/dal/tables.js");
global.appLog.info("Establishing connection with Database...");
database.table.create(databaseLoaded);

function databaseLoaded(){
global.appLog.info("Successfully established connection with Database");
/* global.IPResolver = importPackage("./package/properties/IPResolver.js"); */
/* global.BrowserLauncher = importPackage("./package/properties/BrowserLauncherCommands.js"); */
 app.use(express.static(global.appConstants.dbConstants.tableObj.publicFolder)); 

//app.set('port',global.appConstants.dbConstants.tableObj.MHPort);
//app.listen(app.get('port'),function(err){
//if(err)log('Error '+err);
//global.appLog.info('Server is running at PORT:'+app.get('port'));
/* callFristTimeSetUpWizard(); */
/* callreadingJSON(); */
//});
}



var serviceAuthenticator = importPackage("./package/services/serviceAuthenticator.js");	
var loginService = importPackage("./package/services/loginService.js");	
var logoutService = importPackage("./package/services/logoutService.js");
var modelService = importPackage("./package/services/modelService.js");
var modelVersionService = importPackage("./package/services/modelVersionService.js");
var projectService = importPackage("./package/services/projectService.js");
var moduleService = importPackage("./package/services/moduleService.js");
var scenarioService = importPackage("./package/services/scenarioService.js");
var adminService = importPackage("./package/services/AdminUserManagement.js");
var testCondition = importPackage("./package/services/testCondition.js");
var testData = importPackage("./package/services/testData.js");		// new line added
var serviceCopyOptions = importPackage("./package/services/serviceCopyOptions.js");
var excelService = importPackage("./package/services/excelimportservcie.js");
var importService = importPackage("./package/services/importService.js");
var auditService = importPackage("./package/services/auditService.js");
var hpAlmService = importPackage("./package/services/HpAlmService.js");
var revEngService = importPackage("./package/services/revEngService.js");
var commentService = importPackage("./package/services/commentService.js");
var exportjiraService = importPackage("./package/services/ExportJiraService.js");
var exportjiraPremiseService = importPackage("./package/services/ExportJiraPremiseService.js");
var requirementService = importPackage("./package/services/RequirementService.js");
var openTestService = importPackage("./package/services/OpenTestService.js");
var exportBpmnService = importPackage("./package/services/exportBpmnService.js")




app.post('*',function(request,response,next){
	//console.log("coming");
	global.accessLog.info(request.headers['user-agent']+" ip/"+request.connection.remoteAddress);

	response.setHeader("Access-Control-Allow-Origin", "*");
	var msg = '';
	global.appLog.debug("authenticated user id: "+request.body.userId);
	if(!global.validation.validation.test('empty',request.body.userId)) msg = global.errorDescs.errorDesc.desc.USR_USERID_REQUIRED;
	else if(!global.validation.validation.test('empty',request.body.fileAdd)) msg = global.errorDescs.errorDesc.desc.REQUEST_SERVICE_REQUIRED;
	else{
		msg = '';
	}
	if(msg == ''){
		//response.clearCookie('_token');
		if(request.signedCookies._token == undefined){
			beforeLoginServices("POST",request.body,response);
		}else{
			if(request.signedCookies._token.toLowerCase().split(";")[0] != request.body.userId.toLowerCase() || (request.body.fileAdd != undefined && request.body.fileAdd == 'USI')){
				response.clearCookie('_token');
				beforeLoginServices("POST",request.body,response);
			}else{
				serviceAuthenticator.serviceAuthenticator.authenticate(response,request.body,function(userData){
					response.clearCookie('_token');
					response.cookie('_token',request.signedCookies._token, { signed: true ,expires: new Date(Date.now() + 1000*60*30)});
					if((request.connection.remoteAddress).indexOf(":") >= 0){
					//IPV6
					var clientIP = (request.connection.remoteAddress.split(':')).splice(-1)[0];
					serveRequest("POST",request.body,response,userData,clientIP.split(".")[0]);
					}else{
					//IPV4
					serveRequest("POST",request.body,response,userData,request.connection.remoteAddress.split(".")[0]);
					} 
				});
			} 
		}
	}else{
		var resp={
			msg:msg,
			code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
		}
		response.end(JSON.stringify(resp));
	}
});





function beforeLoginServices(type,x,response){
		//console.log("before login");
			/* log(type); */			
				var error={
					msg:global.errorDescs.errorDesc.desc.SESSION_EXPIRED,
					code:global.errorCodes.errorCode.codes.SESSION_EXPIRED
				}
				var value = x.fileAdd;
				var site = x.webSite;
				if(value!=undefined && value!='USI'){
					global.appLog.debug("Request: " + JSON.stringify(x));
				}
				response.statusCode = 200;

				switch(value){
				case "USI" : loginService.login.signIn(response,x);
				break;
				case "USO" : logoutService.logoutService.logout(response,x,[{userID:x.userId}]);
				break;
				/* case "USO" : modelService.logoutService.logout(response,x,[{userID:x.userId}]);
				break; */
				default : 
				response.end(JSON.stringify(error));
				break;
				}
				
	
	}
	
	
	function serveRequest(type,x,response,userData,requestIPInitial){
		//console.log("after login");
			/* log(type); */
			
			var error={
						msg:"Service error",
						code:"200"
						}

				global.appLog.debug("Request: " + JSON.stringify(x));
				response.statusCode = 200;
				
				var value = x.fileAdd;
				var site = x.webSite;
				switch(value){
				case "USI" : loginService.login.refresh(response,x);
				break;
				case "USO" : logoutService.logoutService.logout(response,x,[{userID:x.userId}]);
				break;
				case "GML" : modelVersionService.service.getAllModelVersion(response,x,userData);
				break;
				case "SGVD" : modelVersionService.service.update(response,x,userData);
				break;
				case "CNP" : projectService.service.create(response,x,userData);
				break;
				case "CNM" : moduleService.service.create(response,x,userData);
				break;
				case "CND" : modelService.service.create(response,x,userData);
				break;
				case "CNDV" : modelVersionService.service.create(response,x,userData);
				break;
				case "USD" : scenarioService.service.update(response,x,userData);
				break;
				case "CGS" : scenarioService.service.createGenerated(response,x,userData);
				break;
				case "GAS" : scenarioService.service.getAll(response,x,userData);
				break;
				case "GAPD" : projectService.service.getAllProjectDetails(response,x,userData);
				break;
				case "ASI" : adminService.adminUserManagement.updateRole(response,x,userData);
				break;
				case "GUL" : adminService.adminUserManagement.getAllUsers(response,x,userData);
				break;
				case "CU" : adminService.adminUserManagement.createNew(response,x,userData);
				break;
				case "EU" : adminService.adminUserManagement.updateUser(response,x,userData);
				break;
				case "SMV" : modelVersionService.service.getModelVersion(response,x,userData);
				break;
				case "VM" : modelVersionService.service.getversionModel(response,x,userData);
				break;				
				case "TCO" : testCondition.service.create(response,x,userData);
				break;
				case "TCR" : testCondition.service.remove(response,x,userData);
				break;
				case "TCA" : testCondition.service.getAll(response,x,userData);
				break;
				case "TCU" : testCondition.service.update(response,x,userData);
				break;
				case "TDO" : testData.service.create(response,x,userData);
				break;
				case "TDR" : testData.service.remove(response,x,userData);
				break;
				case "TDTCR" : testData.service.removeCallFrmTstStp(response,x,userData);
				break;
				case "TDA" : testData.service.getAll(response,x,userData);
				break;
				case "TDU" : testData.service.update(response,x,userData);
				break;
				case "SCOM" : serviceCopyOptions.service.getAllM(response,x,userData);
				break;
				case "SCOV" : serviceCopyOptions.service.getAllV(response,x,userData);
				break;
				case "SCOC" : serviceCopyOptions.service.create(response,x,userData);
				break;
				case "DMV" : modelVersionService.service.delete(response,x,userData);
					break;
				case "DD" :	modelService.service.delete(response,x,userData);
                    break;
				case "DM" :  moduleService.service.delete(response,x,userData);
					break;
				case "DP" :  projectService.service.delete(response,x,userData);
					break;
                case "EXS" : excelService.service.createExcel(response,x,userData);
                    break;
                case "TXS" : excelService.service.testsuite(response,x,userData);
					break;
				case "IWF" : importService.service.import(response,x,userData);
					break;
				case "TDD" : excelService.service.comptestdata(response,x,userData);
					break;
                 case "MTD" : excelService.service.manualtestcae(response,x,userData);
                   break;
				case "GAR" : adminService.adminUserManagement.getAllRoles(response,x,userData);
					break;
				case "GBA" : adminService.adminUserManagement.getAllAccounts(response,x,userData);
					break;
				case "GAP" : projectService.service.getAccountProjects(response,x,userData);
					break;
				case "CBA" : adminService.adminUserManagement.createAccount(response,x,userData);
					break;
				case "UBA" : adminService.adminUserManagement.updateAccount(response,x,userData);
					break;
				case "DELU" : adminService.adminUserManagement.deleteUser(response,x,userData);
					break;
				case "SMD"	: testCondition.service.getstepmasterdata(response,x,userData);
				    break;
                case "DL"	: serviceCopyOptions.service.checkdaigramstatus(response,x,userData);
                    break;
			   case "VQC"   : hpAlmService.service.validateqc(response,x,userData);
					 break;	 
			   case "HFC"   : hpAlmService.service.createHpAlmfolder(response,x,userData);
					 break;	 	
			   case "QCD"   : hpAlmService.service.getHpALMDetails(response,x,userData);	 
			         break;	 
			   case "CPD"   : hpAlmService.service.checkprojectsize(response,x,userData);	 
			         break;
			   case "AQD"   : hpAlmService.service.getadminprojectdetails(response,x,userData);	 
			         break;
			   case "CUQ"   : hpAlmService.service.createupdatehpalm(response,x,userData);	 
					 break;
			   case "CDP"   : hpAlmService.service.checkdaigrampublish(response,x,userData);	 
					 break;		 
			   case "SDM"   : testCondition.service.getstepdata(response,x,userData);	 
			         break;		 
     		   case "MDS"   : modelVersionService.service.getModelStatusId(response,x,userData);	 
					 break;		 
				case "REITF" : revEngService.service.import(response,x,userData);
				break; 		
				case "REFM" : revEngService.service.fieldMapping(response,x,userData);
				break; 	
				case "RED" : revEngService.service.diagnose(response,x,userData);
				break; 	
				case "RSN" : revEngService.service.getsheetname(response,x,userData);
				break;		
				case "REMP" : revEngService.service.generate(response,x,userData);
				break;	
				case "RESMV" : revEngService.service.saveModelVersion(response,x,userData);
				break;	
				case "GPD" :  projectService.service.getProjectDetails(response,x,userData);
				break;
				case "PTC" :  projectService.service.setTestCaseTemplateStru(response,x,userData);
				break;
				case "CNC" :  commentService.service.create(response,x,userData);
				break;
				case "GAC" :  commentService.service.getAll(response,x,userData);
				break;
				case "TTE" :  modelVersionService.service.getTemplateCols(response,x,userData); 
				break;
				case "TCC" : testCondition.service.copyTestSteps(response,x,userData);
				break;
				case "EDJ" :  exportjiraService.service.exportdatatojira(response,x,userData);
				break;
				case "GJP" :  exportjiraService.service.getprojectdetails(response,x,userData); 
				break;
				case "JCD" :  projectService.service.setJiraConfiguration(response,x,userData); 
				break;
				case "GJC" :  projectService.service.getJiraConfiguration(response,x,userData); 
				break;
				case "EPJ" :  exportjiraPremiseService.service.exportdatatojira(response,x,userData);
				break;
				case "GRD" :  requirementService.service.getRequirementDetials(response,x,userData);
				break;
				case "SRD" :  requirementService.service.setRequirementDetials(response,x,userData);
				break;
				case "GID" :  requirementService.service.getRequirementIssueIds(response,x,userData);
				break;
				case "GRI" :  requirementService.service.getRequirementIssueDetails(response,x,userData);
				break;
				case "SMR" :  requirementService.service.setModelRequirement(response,x,userData);
				break;
				case "GMR" :  requirementService.service.getModelRequirementIds(response,x,userData);
				break;
				case "DR" :  requirementService.service.delete(response,x,userData);
				break;
				case "GCR" :  requirementService.service.getChildRequirements(response,x,userData);
				break;
				case "GVR" :  requirementService.service.getVersionMappedRequirments(response,x,userData);
				break;
				case "GJY" : testCondition.service.generateYaml(response,x,userData);
				break;
				case "GTD" : testCondition.service.getToolData(response,x,userData);
				break;				
				case "OTTCU" : testCondition.service.opentestUpdate(response,x,userData);
				break;
				case "OTTCD" : testCondition.service.opentestDelete(response,x,userData);
				break;
				case "SOK" :  openTestService.service.saveOpenTestKeywords(response,x,userData);
				break; 
				case "GOK" :  openTestService.service.getOpenTestKeywords(response,x,userData);
				break;
				case "DOK" :  openTestService.service.deleteOpenTestKeyword(response,x,userData);
				break;
				case "EOK" :  openTestService.service.editgetOpenTestKeyword(response,x,userData);
				break;
				case "CPVD" : serviceCopyOptions.service.checkPrevVersionData(response,x,userData);
				break;
				case "PRS" :  projectService.service.getProjectReport(response,x,userData);
				break;
				case "EBPF" :  exportBpmnService.service.exportBpmnService(response,x,userData);
				break;

                default :
				response.end(JSON.stringify(error));
				break;
				}
				
				
				
		/* 	}); */
	
	}



	app.get('/home.html',function(request,response,next){
		try{
			global.appLog.debug("Home page accessed; authenticated user cookie: "+request.signedCookies._token.toLowerCase());
			next();
		}catch(e){
			global.appLog.error('Authenticated user cookie not found. Redirecting to Login screen');
			response.redirect("http://"+request.headers.host);
		}		
	});

















app.use(express.static(__dirname + "/apps"));
// Define the port to run on
app.set('port', 8044);
//app.use(express.static());
// Listen for requests

var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Server is listening on port ' + port);
});






















function logResponseBody(req, res, next) {
  var reqBody=req.body;  
  if(reqBody!=undefined && JSON.stringify(reqBody) !== '{}'){
	  var oldWrite = res.write,
		  oldEnd = res.end;
	  var chunks = [];
	  res.write = function (chunk) {
		chunks.push(chunk);
		oldWrite.apply(res, arguments);
	  };
	  res.end = function (chunk) {
		if (chunk)
		  chunks.push(new Buffer(chunk));
		  var jsonResponse=null;
		  try{
			  var body= Buffer.concat(chunks).toString('utf8');
			  jsonResponse=JSON.parse(body);
			  //global.appLog.warn(body);
		  }catch(e){
			console.log(e);
		  }
		  oldEnd.apply(res, arguments);
		  var inputData={};
		  inputData["user_id"]=reqBody.userId;
		  inputData["svc_cd"]=reqBody.fileAdd;
		  if(global.appConstants.service.dataObj[reqBody.fileAdd]!=undefined){
			inputData["svc_desc"]=global.appConstants.service.dataObj[reqBody.fileAdd];
		  }else{
			inputData["svc_desc"]=reqBody.fileAdd;
		  }		  
		  inputData["sts_cd"]=jsonResponse.code;
		  if(jsonResponse.msg!=undefined && jsonResponse.msg.length >255){
		    inputData["sts_desc"]=jsonResponse.msg.substring(0,251)+'...';
		  }else{
			inputData["sts_desc"]=jsonResponse.msg;
		  }		  
		  inputData["time"]=new Date();
		  inputData["client_ip"]='127.0.0.1';		 		  
		  auditService.service.logData(inputData);
	  };
	 
  }
  next();
}

function importPackage(path){
try{
return require(path);
}catch(e){
console.log("Not able to fetch file at path "+path);
//global.errorLog.error(e);
}
}

global.validateApiKey = function (haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
};

global.defaultDate = "";
global.getCurrDate = function(format){
var today = new Date();

if(global.defaultDate == ""){

  }else{
 today = new Date(global.defaultDate);
  }

   var dd = today.getDate(); 
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
	
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
	if(minutes<10){
        minutes='0'+minutes
    }
	var today ='';
	switch(format){
	case 'yyyy-mm' : today = yyyy+'-'+mm;break;
	case 'mm' : today = mm;break;
	case 'days' : today = new Date(yyyy, mm, 0).getDate();break;
	case 'today' : today = dd;break;
	case 'datetime' : today = yyyy+'-'+mm+'-'+dd+' '+hour+':'+minutes+':'+seconds;break;
	case 'datetimeName' : today = yyyy+'_'+mm+'_'+dd+'_'+hour+'_'+minutes+'_'+seconds;break;
	case 'datetimeM' : today = yyyy+'-'+mm+'-'+dd+' '+hour+':'+minutes;break;
	case 'hour' : today = hour;break;
	case 'minute' : today = minutes;break;
	default:today = yyyy+'-'+mm+'-'+dd;
	
	break;
	}
   
return today;

}