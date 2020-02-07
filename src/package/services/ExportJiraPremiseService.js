var request = require('request');
var syncrequest = require("sync-request");

function createBasic64Code(username, password) {
    var username = username;
    var pssword = password;
    var userpassword = username + ":" + pssword;
    var buffer = new Buffer(userpassword);
    var toBase64 = buffer.toString('base64');
    return toBase64;
}

function exportDataToJira(response, data, userDetails) {
    var versionId = data.versionId;
    var tooltype = data.tooltype;
    var selectedScenriosIndex = data.selectedScenarioIndex;
    exportTestCaseTojira(response, versionId, selectedScenriosIndex, tooltype);
}

function exportTestCaseTojira(response, versionId, selectedScenriosIndex, tooltype) {
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
                createTestCases(versionId, issueIds, scenario_path_json, response, config_dtl, selectedScenriosIndex);
            }

        }
    });
}

function checkissueexist(versionId, issueIds, selectedScenriosIndex, response, config_dtl, scenario_path_json) {
    var parsedissueIds = JSON.parse(issueIds);
    var filteredSelectedScenarios = checkIssueIdsExist(parsedissueIds, selectedScenriosIndex, config_dtl);
    if (filteredSelectedScenarios.length > 0) {
        createTestCases(versionId, issueIds, scenario_path_json, response, config_dtl, filteredSelectedScenarios);
    } else {
        var resp = {
            msg: global.errorDescs.errorDesc.desc.SUCCESS,
            code: "200",
            data: "Selected TestCases are already exists in JIRA, this request will be ignored."
        }
        response.end(JSON.stringify(resp));
    }

}

function checkissue(daigramId, issueId, selectedScenriosIndex, response, config_dtl, scenario_path_json) {
    var jiraconfgdetails = JSON.parse(config_dtl);

    request.get({
        url: jiraconfgdetails.url + "/rest/api/2/issue/" + issueId,
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Basic " + createBasic64Code(jiraconfgdetails.userName, jiraconfgdetails.password)
        }
    },
        function (error, hpresponse, body) {
            if (hpresponse.statusCode != 200) {

                createTestCases(daigramId, issueId, scenario_path_json, response, config_dtl, selectedScenriosIndex)
            } else {
                response.issueExistCount++;
                if (response.issueCount == response.issueExistCount) {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: "Test Data Exported to jira successfully"
                    }
                    response.end(JSON.stringify(resp));
                }
            }

        }
    );

}

function createTestCases(versionId, issueIds, scenario_path_json, response, config_dtl, selectedScenriosIndex) {
    var jiraconfgdlt = JSON.parse(config_dtl);
    var testCaseData = buildtestCaseData(scenario_path_json, jiraconfgdlt.jiraprojectid, selectedScenriosIndex);
    request.post({
        url: jiraconfgdlt.url + "/rest/api/2/issue/bulk",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Basic " + createBasic64Code(jiraconfgdlt.userName, jiraconfgdlt.password)
        },
        json: testCaseData
    },
        function (error, hpresponse, body) {
            var issuesIds = {};
            var testCasedata = [];
            var issuesData = JSON.parse(JSON.stringify(body));
            if (issuesData.errors.length == 0) {
                for (var index = 0; index < issuesData.issues.length; index++) {
                    testCasedata.push(issuesData.issues[index])
                }
                var keys = Object.keys(scenario_path_json);
                if (Array.isArray(selectedScenriosIndex)) {
                    for (var kk = 0; kk < selectedScenriosIndex.length;) {
                        for (var k = kk; k < testCasedata.length; k++) {
                            issuesIds[selectedScenriosIndex[kk]] = testCasedata[k];
                            kk++;
                        }
                    }
                } else {
                    issuesIds[selectedScenriosIndex] = testCasedata[0];
                }


                var selectQuery = "select mv.jira_issue_ids from model_version mv where mv.id=?";
                global.db.driver.execQuery(selectQuery, [versionId], function (err, datamodel) {
                    if (err) {
                        global.errorLog.error(err);
                        var resp = {
                            msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                            code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                        }
                        response.end(JSON.stringify(resp));
                    } else {

                        var jira_issue_ids = null
                        if (datamodel[0].jira_issue_ids == undefined || datamodel[0].jira_issue_ids == null || datamodel[0].jira_issue_ids == '') {
                            jira_issue_ids = issuesIds;
                        } else {
                            var jira_issue_data = JSON.parse(datamodel[0].jira_issue_ids);
                            if (Array.isArray(selectedScenriosIndex)) {
                                for (var selIndex = 0; selIndex < selectedScenriosIndex.length;) {
                                    for (var k = selIndex; k < testCasedata.length; k++) {
                                        jira_issue_data[selectedScenriosIndex[selIndex]] = testCasedata[k];
                                        selIndex++;
                                    }
                                }
                            } else {
                                jira_issue_data[selectedScenriosIndex] = testCasedata[0];
                            }
                            jira_issue_ids = jira_issue_data;
                        }

                        var query = "update model_version mv set mv.jira_issue_ids=? where mv.id=?"
                        global.db.driver.execQuery(query, [JSON.stringify(jira_issue_ids), versionId], function (err, models) {
                            if (err) {
                                global.errorLog.error(err);
                                var resp = {
                                    msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                    code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                                }
                                response.end(JSON.stringify(resp));
                            } else {
                                global.db.driver.execQuery('select ts.test_step_number,ts.description,ts.node_id,ts.target, (select GROUP_CONCAT(step_data SEPARATOR \',\' ) from test_data_master tdm where tdm.test_step_id=ts.id) as add_step_data  from test_step_master ts where ts.version_id=?', [versionId], function (err, testdata) {
                                    var node_desc_map = {};
                                    if (err) {
                                        global.errorLog.error(err);
                                        var resp = {
                                            msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                            code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                                        }
                                        response.end(JSON.stringify(resp));
                                    } else {
                                        for (var i = 0; i < testdata.length; i++) {
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
                                        var stepCount = 0;
                                        if (Array.isArray(selectedScenriosIndex)) {
                                            for (var sceIndex = 0; sceIndex < selectedScenriosIndex.length; sceIndex++) {
                                                var descarr = [];
                                                var value = scenario_path_json[selectedScenriosIndex[sceIndex]];
                                                var path = value[1];
                                                var node_id = path.split(",");
                                                var node_id_desc = JSON.parse(JSON.stringify(node_desc_map));
                                                for (var i = 0; i < node_id.length - 1; i++) {
                                                    var scenrio_node_id = node_id[i];
                                                    if (node_desc_map[scenrio_node_id] != undefined) {
                                                        var description = node_desc_map[scenrio_node_id];
                                                        descarr.push.apply(descarr, description);
                                                    }
                                                }
                                                var issueId = issuesIds[selectedScenriosIndex[sceIndex]].id;
                                                postDataStepData(descarr, issueId, response, jiraconfgdlt);
                                                //stepCount++;  
                                            }

                                        } else {
                                            var descarr = [];
                                            var value = scenario_path_json[selectedScenriosIndex];
                                            var path = value[1];
                                            var node_id = path.split(",");
                                            var node_id_desc = JSON.parse(JSON.stringify(node_desc_map));
                                            for (var i = 0; i < node_id.length - 1; i++) {
                                                var scenrio_node_id = node_id[i];
                                                if (node_desc_map[scenrio_node_id] != undefined) {
                                                    var description = node_desc_map[scenrio_node_id];
                                                    descarr.push.apply(descarr, description);
                                                }
                                            }

                                            var issueId = issuesIds[selectedScenriosIndex].id;
                                            postDataStepData(descarr, issueId, response, jiraconfgdlt);
                                        }

                                    }



                                });




                            }


                        });

                    }


                });

            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: "Problem occured.Selected project is not supported for testCase creation, Please configure the project in jira to support issue type as 'Test'"
                }
                response.end(JSON.stringify(resp));
            }
        });




}

function postDataStepData(descarr, issueId, response, jiraconfgdlt) {
    var jiraconfig = JSON.parse(JSON.stringify(jiraconfgdlt));
    var basic64Code = createBasic64Code(jiraconfig.userName, jiraconfig.password);
    callService(basic64Code, descarr, issueId, response, jiraconfig);

}


function callService(basic64Code, stepdescription, issueId, response, jiraconfig) {
    if (stepdescription.length > 0) {
        for (var k = 0; k < stepdescription.length; k++) {
            var expecteddata = '';
            var finaldesc = convert(stepdescription[k].desc);
            if (finaldesc.includes("Verify")) {
                if (finaldesc.includes(" is ")) {
                    expecteddata = finaldesc.replace(" is ", " should be ");
                } else {
                    expecteddata = finaldesc;
                }
            } else {
                expecteddata = "User should able to " + finaldesc;
            }

            var testarr = { "step":stepdescription[k].desc, "data":stepdescription[k].step_data , "result": expecteddata };

            var res = syncrequest('POST', jiraconfig.url + "/rest/zapi/latest/teststep/" + issueId, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Basic " + basic64Code
                },
                body: JSON.stringify(testarr)
            });
            if (res.statusCode == "401") {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: "Problem occured.Please check with Admin if Access Key & Secret Key correct or Selected project is not supported for testCase creation, Please configure the project in jira to support issue type as 'Test'"
                }
                response.end(JSON.stringify(resp));
                break;
            } else {

                if (response.count == 0 && k == 0) {
                    response.count = 1;
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: "Test Data Exported to jira successfully"
                    }
                    response.end(JSON.stringify(resp));
                }
            }

        }
    } else {

        var resp = {
            msg: global.errorDescs.errorDesc.desc.SUCCESS,
            code: "200",
            data: "Test Data Exported to jira successfully"
        }
        response.end(JSON.stringify(resp));

    }



}

function buildtestCaseData(scenario_path_json, project_id, selectedScenriosIndex) {
    var testCaseData = { issueUpdates: [] };
    var name = '';
    if (Array.isArray(selectedScenriosIndex)) {
        for (var i = 0; i < selectedScenriosIndex.length; i++) {

            var scenarioname = scenario_path_json[selectedScenriosIndex[i]];
            var scenario_namedesc = scenarioname[0];
            var scenario_priority = scenarioname[2];
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
            }

            var testjson = { "fields": { "project": { "id": project_id }, "summary": scenario_namedesc.substring(0,250), "issuetype": { "name": "Test" }, "description": "", "priority": { "name": name } } }
            testCaseData.issueUpdates.push(testjson);

        }
    } else {
        var scenarioname = scenario_path_json[selectedScenriosIndex];
        var scenario_namedesc = scenarioname[0];
        var testjson = { "fields": { "project": { "id": project_id }, "summary": scenario_namedesc.substring(0,250), "issuetype": { "name": "Test" }, "description": "","priority": { "name": name } } }
        testCaseData.issueUpdates.push(testjson);

    }

    return testCaseData;

}

function convert(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

function checkIssueIdsExist(parsedissueIds, selectedScenriosIndex, config_dtl) {
    var jiraconfgdetails = JSON.parse(config_dtl);
    var needToCreateIssueIds = [];
    if (Array.isArray(selectedScenriosIndex)) {
        for (var i = 0; i < selectedScenriosIndex.length; i++) {
            if (parsedissueIds[selectedScenriosIndex[i]] != undefined) {
                var issueId = parsedissueIds[selectedScenriosIndex[i]].id;
                var res = syncrequest('GET', jiraconfgdetails.url + "/rest/api/2/issue/" + issueId, {
                    'headers': {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': "Basic " + createBasic64Code(jiraconfgdetails.userName, jiraconfgdetails.password)

                    }
                });
                if (res.statusCode != 200) {
                    needToCreateIssueIds.push(selectedScenriosIndex[i]);
                }
            } else {
                needToCreateIssueIds.push(selectedScenriosIndex[i]);
            }
        }
    } else {
        if (parsedissueIds[selectedScenriosIndex] != undefined) {
            var issueId = parsedissueIds[selectedScenriosIndex].id;
            var res = syncrequest('GET', jiraconfgdetails.url + "/rest/api/2/issue/" + issueId, {
                'headers': {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': "Basic " + createBasic64Code(jiraconfgdetails.userName, jiraconfgdetails.password)

                }
            });
            if (res.statusCode != 200) {
                needToCreateIssueIds.push(selectedScenriosIndex);
            }
        } else {
            needToCreateIssueIds.push(selectedScenriosIndex);
        }

    }

    return needToCreateIssueIds;

}

module.exports.service = {
    exportdatatojira: exportDataToJira
};
