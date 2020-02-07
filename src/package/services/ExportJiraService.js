var request = require('request');
var jwt = require('atlassian-jwt');
var moment = require('moment');
var syncrequest = require("sync-request");
var thenrequest = require("then-request");

function createBasic64Code(username, password) {
    var username = username;
    var pssword = password;
    var userpassword = username + ":" + pssword;
    var buffer = new Buffer(userpassword);
    var toBase64 = buffer.toString('base64');
    return toBase64;
}

function jwtTokenGeneration(issueId,jira_config_dtl) {
    var jiraconfig= jira_config_dtl;
    var token = '';
    var now = moment().utc();
    var USER = jiraconfig.userName;
    var ACCESS_KEY =jiraconfig.jiraaccesskey;
    var SECRET_KEY = jiraconfig.jirascretkey;
    var BASE_URL = "https://prod-play.zephyr4jiracloud.com";
    var RELATIVE_PATH = "/public/rest/api/1.0/teststep/" + issueId;
    var QUERY_STRING = "";
    var IAT = now.unix(); //1523885189;//now.unix();
    var EXP = now.add(60, 'minutes').unix();//1523888789;//now.add(60, 'minutes').unix();

    var req = {
        method: 'POST',
        originalUrl: RELATIVE_PATH,
        query: { projectId: jiraconfig.jiraprojectid}
    };

    var QSH = jwt.createQueryStringHash(req);
    var payload = {
        "sub": USER,
        "qsh": QSH,
        "iss": ACCESS_KEY,
        "iat": IAT,
        "exp": EXP
    };
    token = jwt.encode(payload, SECRET_KEY, 'HS256');
        
    return token;
}


function getprojectdetails(response, data, userData) {
    var username = data.username;
    var password = data.password;
    var conURL = data.conUrl;
    request.get({
                url: conURL + "/rest/api/2/project",
                method: "GET",
                headers: {
                'Content-Type': 'application/json',
                'Authorization': "Basic " + createBasic64Code(username, password)
                }
          },
         function (error, hpresponse, body) {
          if (hpresponse != undefined) {
            var projectdetails = {};
            if (hpresponse.statusCode == 200) {
                var projectdata = JSON.parse(body);
            
                for (var index = 0; index < projectdata.length; index++) {
                    console.log(projectdata[index].key);
                    projectdetails[projectdata[index].id+"@"+projectdata[index].key] = projectdata[index].name;
                }
                console.log(":"+JSON.stringify(projectdetails));
               
                var resp = {
                    code: "200",
                    data: projectdetails
                }
                response.end(JSON.stringify(resp));
            } else {
                var resp = {
                    code: "401",
                    msg: "Problem occured.Please check UserName,Password & Connection url details"
                }
                response.end(JSON.stringify(resp));
            }

         } else {
            var resp = {
                code: "300",
                msg: "Problem occured.Please check UserName,Password & Connection url details"
            }
            response.end(JSON.stringify(resp));
         }

      }
    );
}

function exportdatatojira(response, data, userData) {
    var versionId = data.versionId;
    var tooltype = data.tooltype;
    var selectedScenriosIndex = data.selectedScenarioIndex;
    var userName = userData[0].userID;
    exportTestCaseTojira(response, versionId, selectedScenriosIndex,tooltype,userName);

}

function exportTestCaseTojira(response, versionId, selectedScenriosIndex,tooltype,userName) {
    global.db.driver.execQuery('select  sc.name,sc.scenario_index,sc.path,mv.jira_issue_ids,td.config_dtl,sc.criticality from scenario_master sc inner join  model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in ?) inner join tool_details td on(mv.project_id = td.project_id) and mv.id=? and td.tool_name=?', [selectedScenriosIndex, versionId, tooltype], function (err, models) {
        if (err) {
            console.log(err);
        } else {
            var issueIds = models[0].jira_issue_ids;
            var config_dtl = models[0].config_dtl;
            var scenario_path_json = {};

            for (var i = 0; i < models.length; i++) {
                var namepatharr = [];
                var scenario_name = models[i].name;
                var scenario_index = models[i].scenario_index;
                var sceanrio_path = models[i].path;
                var priority = models[i].criticality;
                namepatharr.push(scenario_name);
                namepatharr.push(sceanrio_path);
                namepatharr.push(priority);

                scenario_path_json[scenario_index] = namepatharr;
            }
            if (issueIds != null) {
                response.issueExistCount = 0;
                response.issueCount = selectedScenriosIndex.length;
                response.count = 0;
                checkissueexist(versionId, issueIds, selectedScenriosIndex, response, config_dtl, scenario_path_json);
            } else {
                response.count = 0;
                createTestCases(versionId, issueIds, selectedScenriosIndex, response, config_dtl, scenario_path_json);
            }

        }
    });




}

function  checkissueexist(daigramId,issueids,selectedScenriosIndex,response,jira_config_dtl,scenario_path_json){
    for(var k=0;k<selectedScenriosIndex.length;k++){
        if(issueids[parseInt(selectedScenriosIndex[k])]!=undefined){
            var issueId=issueids[parseInt(selectedScenriosIndex[k])].id;
            checkissue(daigramId,issueId,parseInt(selectedScenriosIndex[k]),response,jira_config_dtl,scenario_path_json);
        }else{
            createTestCases(daigramId,issueId,parseInt(selectedScenriosIndex[k]),response,jira_config_dtl,scenario_path_json);
        }   
    }  
    
}

function  checkissue(daigramId,issueId,selectedScenriosIndex,response,jira_config_dtl,scenario_path_json){
    var jiraconfgdetails= JSON.parse(jira_config_dtl);      
    request.get({
                    url: jiraconfgdetails.url+"/rest/api/2/issue/"+issueId,
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': "Basic " + createBasic64Code(jiraconfgdetails.userName,jiraconfgdetails.password),
                    
                    }
                },
                function (error, hpresponse, body) {   
                    if(hpresponse.statusCode!=200){
                        createTestCases(daigramId,issueId,selectedScenriosIndex,response,jira_config_dtl,scenario_path_json)
                    }else{
                        response.issueExistCount++;
                        if(response.issueCount==response.issueExistCount){
                            var resp={
                                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                                code:"200",
                                data:"Test Data Exported to jira successfully"
                            }
                            response.end(JSON.stringify(resp));       
                        }
                    }  
                
                }
    );

}


function createTestCases(versionId,issueId,selectedScenriosIndex, response,jira_config_dtl,scenario_path_json) {
    var jiraconfig= JSON.parse(jira_config_dtl);
    var testCaseData = buildtestCaseData(versionId,selectedScenriosIndex,jiraconfig.jiraprojectid,scenario_path_json);
    request.post({
                    url: jiraconfig.url+"/rest/api/2/issue/bulk",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': "Basic " + createBasic64Code(jiraconfig.userName,jiraconfig.password) 
                    },
                    json: testCaseData
               },
            function (error, hpresponse, body) {
               console.log(error);
               console.log(JSON.stringify(body));

                var issuesIds = {};
                var testCasedata = [];
                var selectedarr=[];
                var issuesData = JSON.parse(JSON.stringify(body));
                if(issuesData.errors.length==0){
                    for (var index = 0; index < issuesData.issues.length; index++) {
                        testCasedata.push(issuesData.issues[index])
                    }

                    if(Array.isArray(selectedScenriosIndex)){
                            for (var selIndex = 0; selIndex < selectedScenriosIndex.length;) {
                                for (var k = selIndex; k < testCasedata.length; k++) {
                                    issuesIds[parseInt(selectedScenriosIndex[selIndex])] = testCasedata[k];
                                    selIndex++;
                                }
                                                          
                            }
                    }else{
                            issuesIds[parseInt(selectedScenriosIndex)] = issuesData.issues[0];
                    }
            
                    var selectQuery="select mv.jira_issue_ids from model_version mv where mv.id=?";
                    global.db.driver.execQuery(selectQuery,[versionId],function (err,datamodel){
                        if(err){
                            global.errorLog.error(err);
                            var resp={
                                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                            }
                            response.end(JSON.stringify(resp));
                        }else{
                            var jira_issue_ids=null
                            if(datamodel[0].jira_issue_ids==undefined || datamodel[0].jira_issue_ids == null || datamodel[0].jira_issue_ids == '' ){
                                jira_issue_ids=issuesIds;
                            }else{
                                var jira_issue_data=JSON.parse(datamodel[0].jira_issue_ids);
                                if(Array.isArray(selectedScenriosIndex)){
                                    for (var selIndex = 0; selIndex < selectedScenriosIndex.length;) {
                                        for (var k = selIndex; k < testCasedata.length; k++) {
                                            jira_issue_data[parseInt(selectedScenriosIndex[selIndex])] = testCasedata[k];
                                            selIndex++;
                                        }
                                    }
                                }else{
                                    jira_issue_data[parseInt(selectedScenriosIndex)] = testCasedata;
                                }   
                                jira_issue_ids=jira_issue_data;
                            }     
                
                        var query = "update model_version mv set mv.jira_issue_ids=? where mv.id=?"
                        global.db.driver.execQuery(query, [JSON.stringify(jira_issue_ids), versionId], function (err, models) {
                        if(err){
                                    global.errorLog.error(err);
                                    var resp={
                                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                    }
                                    response.end(JSON.stringify(resp));
                        }else{
                            global.db.driver.execQuery('select ts.test_step_number,ts.description,ts.node_id,ts.target, (select GROUP_CONCAT(step_data SEPARATOR \',\' ) from test_data_master tdm where tdm.test_step_id=ts.id) as add_step_data  from test_step_master ts where ts.version_id=?', [versionId], function (err, testdata) {
                                var node_desc_map = {};
                                if (err) {
                                    global.errorLog.error(err);
                                    var resp={
                                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                    }
                                    response.end(JSON.stringify(resp));
                                } else {
                                    for (var i = 0; i < testdata.length; i++){ 
                                        var tar_data_desc = { "desc": testdata[i].description, "target":  testdata[i].target , "step_data": testdata[i].add_step_data };
                                        var node_id = testdata[i].node_id;
                                        createnodedescmap(node_id, tar_data_desc);
                                    }
        
                                    function createnodedescmap(node_id, desc) {
                                        var nodearr = get(node_id);
                                        nodearr.push(desc);
                                        put(node_id, nodearr);
                                    }
        
                                    function get(node_id) {
                                        if (node_desc_map[node_id] == undefined) {
                                            node_desc_map[node_id] = [];
                                        }
                                        return node_desc_map[node_id];
                                    }
        
                                    function put(nodekey, descArr) {
                                        node_desc_map[nodekey] = descArr;
                                    }
                                }
                                            
                                if(Array.isArray(selectedScenriosIndex)){
                                    namedquery='?';
                                }else{
                                    namedquery='(?)';
                                }
                            global.db.driver.execQuery('select sc.path,sc.criticality,sc.scenario_index,sc.risk_exposer,sc.name,mv.diagram_data,reg.userID,reg.userName from scenario_master sc inner join model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in '+ namedquery +' and sc.model_version_id=? ) left join register reg on (mv.user_id = reg.id)', [selectedScenriosIndex, versionId], function (err, teststepdata) {
                                if(err){
                                        global.errorLog.error(err);
                                        var resp={
                                            msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                            code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                        }
                                        response.end(JSON.stringify(resp));
                                }else{
                                        var stepCount=0;
                                        for (var k = 0; k < teststepdata.length; k++) {
                                            var descsubarr =  [];
                                            var descarr    =  [];
                                            var node_desc_map1 = JSON.parse(JSON.stringify(node_desc_map));
                                            var path_node_id = teststepdata[k].path.split(',');
                                            var sel_scenario_id = teststepdata[k].scenario_index;
                                        
            
                                            for (var i = 0; i < path_node_id.length - 1; i++) {
                                                var scenrio_node_id = path_node_id[i];
                                                if (node_desc_map1[scenrio_node_id] != undefined) {
                                                    var description = node_desc_map[scenrio_node_id];
                                                    descarr.push.apply(descarr,description);
                                                }
                                            }
                                            var issueId = issuesIds[sel_scenario_id].id
                                            postDataStepData(descarr, issueId, response,jiraconfig,stepCount)
                                            stepCount++;
                                        }
                                }                   
                                    
                            
                            });
        
                        });
        
                        }
                        
                        });
        
                    }  
            }); 
        }else{
            var resp={
                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                code:"200",
                data:"Problem occured.Selected project is not supported for testCase creation, Please configure the project in jira to support issue type as 'Test'"
            }
            response.end(JSON.stringify(resp));
        }

        }
    );
         
}

function postDataStepData(stepdescription, issueId, response,jira_config_dtl,stepNum) {
    var jwToken = jwtTokenGeneration(issueId,jira_config_dtl)
   callService(jwToken, stepdescription, issueId, response,jira_config_dtl,stepNum);
    
}

function callService(jwToken, stepdescription, issueId, response,jira_config_dtl,stepNum) {
    var configdetails= jira_config_dtl;
    
    for (var k = 0; k < stepdescription.length; k++) {
        var expecteddata='';
        var finaldesc = convert(stepdescription[k].desc);
        if(finaldesc.includes("Verify")){
            if(finaldesc.includes(" is ")) {
                expecteddata =finaldesc.replace(" is ", " should be ");
            }else{
                expecteddata= finaldesc;
            }
        }else{
            expecteddata= "User should able to " +finaldesc;
        }

        var add_step_data=stepdescription[k].step_data;
        if(add_step_data==undefined || add_step_data==null){
            add_step_data='';
        }
       
        var testarr = { "step": stepdescription[k].desc, "data": add_step_data, "result": expecteddata }

    

        var res = syncrequest('POST', "https://prod-api.zephyr4jiracloud.com/connect/public/rest/api/1.0/teststep/" + issueId + "?projectId="+configdetails.jiraprojectid, {
            headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'JWT ' + jwToken,
                    'zapiAccessKey': configdetails.jiraaccesskey,
            },
                body: JSON.stringify(testarr)
        });
        if(res.statusCode=="401"){
            var resp={
                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                code:"200",
                data:"Problem occured.Please check with Admin if Access Key & Secret Key correct or Selected project is not supported for testCase creation, Please configure the project in jira to support issue type as 'Test'"
            }
            response.end(JSON.stringify(resp));
            break;
        }else{
            if(stepNum==0 && k==0){    
                    var resp={
                        msg:global.errorDescs.errorDesc.desc.SUCCESS,
                        code:"200",
                        data:"Test Data Exported to jira successfully"
                    }
                    response.end(JSON.stringify(resp));                    
            }  
        }
               
    }
 
    
}

function buildtestCaseData(versionId,selectedScenriosIndex,project_id,scenario_path_json) {
        var testCaseData = { issueUpdates: [] };
        if(Array.isArray(selectedScenriosIndex)){
            for (var index = 0; index < selectedScenriosIndex.length; index++) { 
                var scenarioname = scenario_path_json[selectedScenriosIndex[index]];
                var scenario_namedesc = scenarioname[0];
              /*  var scenario_priority = scenarioname[2];
                if (scenario_priority == '5') {
                    name = 'Highest';
                } else if (scenario_priority == '4') {
                    name = 'High';
                } else if (scenario_priority == '3') {
                    name = 'Medium';
                } else if (scenario_priority == '2') {
                    name = 'Low';
                } else {
                    name = 'Lowest';
                }*/
                

                        var testjson = { "fields": { "project": { "id": project_id }, "summary": scenario_namedesc.substring(0,250),"issuetype": { "name": "Test" } } }
                        testCaseData.issueUpdates.push(testjson);
                    }
               
        }else{
                var scenarioname = scenario_path_json[selectedScenriosIndex];
                var scenario_namedesc = scenarioname[0];
                var testjson = { "fields": { "project": { "id": project_id }, "summary": scenario_namedesc.substring(0,250),"issuetype": { "name": "Test" } } }
                testCaseData.issueUpdates.push(testjson);

        }
    
    return testCaseData;

}

function convert(str)
{
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
  return str;
}

module.exports.service = {
    getprojectdetails: getprojectdetails,
    exportdatatojira: exportdatatojira
};
