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

function getRequirementDetials(response, data, userData) {
    var project_id = data.projectId;
    global.db.driver.execQuery('select td.config_dtl from tool_details td where td.project_id=?', [project_id], function (err, tooldetails) {
        if (err) {
            global.errorLog.error(err);
        } else {
            if (tooldetails.length > 0) {
                var configDetails = tooldetails[0];
                var config_details = JSON.parse(configDetails.config_dtl);
                var jiraProjectKey = config_details.projeckey;
                getRequirementProjectDetails(response, config_details, jiraProjectKey);
            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "300",
                    data: "Project is not mapped to requirement in jira server."
                }
                response.end(JSON.stringify(resp));
            }

        }
    });


}


function getRequirementProjectDetails(response, config_details, jiraProjectKey) {
    var configDetails = config_details;
    var jiraProjectKeyName = jiraProjectKey;
    request.get({
        url: configDetails.url + "/rest/com.easesolutions.jira.plugins.requirements/1.0/tree/" + configDetails.projeckey,
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Basic " + createBasic64Code(configDetails.userName, configDetails.password),

        }
    },
        function (error, hpresponse, body) {
            if (hpresponse != undefined) {
                if (hpresponse.statusCode == 200) {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: body
                    }
                    response.end(JSON.stringify(resp));
                } else {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "300",
                        data: "Project is not mapped to requirement in jira server."
                    }
                    response.end(JSON.stringify(resp));
                }
            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "300",
                    data: "Problem occured.check Jira server is down."
                }
                response.end(JSON.stringify(resp));
            }

        }
    );

}

function setRequirementDetials(response, data, userData) {
    var requirementdata = data.requirement_data;
    var module_id = data.module_id;
    var requirementLength = requirementdata.length;
    var count = 0;
    for (var k = 0; k < requirementdata.length; k++) {
        var requirementData = requirementdata[k];
        var requirementSummaryData = requirementData.split(":");
        var name = requirementSummaryData[1];
        var description = requirementSummaryData[2];
        var issue_id = requirementSummaryData[0];
        var module_index = module_id.split("_");
        var module_req_id = module_index[1];
        var requirementDetails = {
            name: name,
            description: description,
            issue_id: issue_id,
            module_id: module_req_id
        };
        global.appConstants.dbConstants.tableObj.requirement.create([requirementDetails], function (err, items) {
            count = count + 1;
            if (err) {
                global.errorLog.error(err);
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            } else {
                if (requirementLength == count) {
                    count=0;
                    var globalResp = {
                        msg: "Requirement Details Saved Successfully",
                        code: "200"
                    }
                    response.end(JSON.stringify(globalResp));
                }
            }
        });
    }


}

function getRequirementIssueIds(response, data, userData) {
    var module_id = data.module_id;
    global.db.driver.execQuery('select td.description,td.issue_id,td.name from requirement td where td.module_id=?', [module_id], function (err, issuedetails) {
        if (err) {
            global.errorLog.error(err);
        } else {
            var resp = {
                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                code: "200",
                data: issuedetails
            }
            response.end(JSON.stringify(resp));
        }
    });
}

function getRequirementIssueDetails(response, data, userData) {
    var issue_id = data.issue_id;
    var project_id = data.project_id;
    global.db.driver.execQuery('select td.config_dtl from tool_details td where td.project_id=?', [project_id], function (err, tooldetails) {
        if (err) {
            global.errorLog.error(err);
        } else {
            if (tooldetails.length > 0) {
                var configDetails = tooldetails[0];
                var config_details = JSON.parse(configDetails.config_dtl);
                var jiraProjectKey = config_details.projeckey;
                getRequirementDetails(response, config_details, issue_id);
            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "300",
                    data: "Project is not mapped to requirement in jira server."
                }
                response.end(JSON.stringify(resp));
            }

        }
    });

}

function getRequirementDetails(response, config_details, issue_id) {
    var configDetails = config_details;
    var issue_id = issue_id;
    //console.log("jiraProjectKeyName:" + jiraProjectKeyName);
    request.get({
        url: configDetails.url + "/rest/api/2/issue/" + issue_id,
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Basic " + createBasic64Code(configDetails.userName, configDetails.password),

        }
    },
        function (error, hpresponse, body) {
            if (hpresponse != undefined) {
                if (hpresponse.statusCode == 200) {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: body
                    }
                    response.end(JSON.stringify(resp));
                } else {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "300",
                        data: "Project is not mapped to requirement in jira server."
                    }
                    response.end(JSON.stringify(resp));
                }
            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "300",
                    data: "Problem occured.check Jira server is down."
                }
                response.end(JSON.stringify(resp));
            }

        }
    );
}

function setModelRequirement(response, data, userData){
  var reqData = data.req_map_data;
  var count = 0;
  var requirementLength = reqData.length
  for(var i=0;i<reqData.length;i++){
      var req_id_ver_id =  reqData[i].split("@");
      var requirementDetails = {
        model_id: req_id_ver_id[1],
        requirement_id: req_id_ver_id[0],
    };
    global.appConstants.dbConstants.tableObj.model_requirement.create([requirementDetails], function (err, items) {
        count = count + 1;
        if (err) {
            global.errorLog.error(err);
            var resp = {
                msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code: global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        } else {
            if (requirementLength == count) {
                count=0;
                var globalResp = {
                    msg: "Selected Requirements mapped to version successfully",
                    code: "200"
                }
                response.end(JSON.stringify(globalResp));
            }
        }
    });
      
  } 
 

}

function getModelRequirementIds(response, data, userData){
    var version_id = data.model_id;
    global.db.driver.execQuery('select * from model_requirement td where td.model_id=?', [version_id], function (err, model_req) {
        if (err) {
            global.errorLog.error(err);
        } else {
            var globalResp = {
                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                code: "200",
                data: model_req
            }
            response.end(JSON.stringify(globalResp));
        }
        });

}

function deleteRequirement(response, data, userData){
 var versionId  = data.issueId;

 global.db.driver.execQuery('select td.issue_id from requirement td where td.id=?', [versionId], function (err, data) {
    if (err) {
        global.errorLog.error(err);
    } else {
       
        var issueId = data[0].issue_id;
        deleteIssue(issueId,versionId,response);     
    }
    });

}

function  deleteIssue(issueId,versionId,response){

    global.appConstants.dbConstants.tableObj.requirement.find({id:versionId}).remove(function (err) {
        if(err) {
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else{
           
            global.db.driver.execQuery('delete from model_requirement where requirement_id=?', [issueId], function (err, issueId)  {
                if(err) {
                    global.errorLog.error(err);
                    var resp={
                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                    }
                    response.end(JSON.stringify(resp));
                }else{
                    var delsucresp={
                        msg:global.errorDescs.errorDesc.desc.SUCCESS,
                        code:"200",
                        data:"Deleted requirement successfully"
                    }
                    global.appLog.debug("consile:"+JSON.stringify(delsucresp));
                    response.end(JSON.stringify(delsucresp));
                } 
            });  
        }
    });   
        

}

function getChildRequirements(response, data, userData){
    var parentKey =   data.parentKey;
    var projectName = data.projectName;
    var project_id =  data.project_id;
    global.db.driver.execQuery('select td.config_dtl from tool_details td where td.project_id=?', [project_id], function (err, tooldetails) {
        if (err) {
            global.errorLog.error(err);
        } else {
            if (tooldetails.length > 0) {
                var configDetails = tooldetails[0];
                var config_details = JSON.parse(configDetails.config_dtl);
                var jiraProjectKey = config_details.projeckey;
                getChildDetails(response, config_details,parentKey,projectName);
            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "300",
                    data: "Project is not mapped to requirement in jira server."
                }
                response.end(JSON.stringify(resp));
            }

        }
    });  

}

function  getChildDetails(response, config_details,parentKey,projectName){
    var configDetails = config_details;
    var parenkey = parentKey ;
    var project = projectName;
    //console.log("jiraProjectKeyName:" + jiraProjectKeyName);
    request.get({
        url: configDetails.url + "/rest/com.easesolutions.jira.plugins.requirements/1.0/child-req/"+ project+"/"+parenkey,
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': "Basic " + createBasic64Code(configDetails.userName, configDetails.password),

        }
    },
        function (error, hpresponse, body) {
            if (hpresponse != undefined) {
                if (hpresponse.statusCode == 200) {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: body
                    }
                    response.end(JSON.stringify(resp));
                } else {
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "300",
                        data: "Project is not mapped to requirement in jira server."
                    }
                    response.end(JSON.stringify(resp));
                }
            } else {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "300",
                    data: "Problem occured.check Jira server is down."
                }
                response.end(JSON.stringify(resp));
            }

        }
    );
}

function getVersionMappedRequirments(response, data, userData){
    var version_id = data.version_id;
    global.db.driver.execQuery('select name,issue_id from requirement where issue_id in(select requirement_id from model_requirement where model_id=?)', [version_id], function (err, requirementNames) {
        if (err) {
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        } else {
            var resp = {
                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                code: "200",
                data: requirementNames
            }
            response.end(JSON.stringify(resp));
        }    
      });    
}
module.exports.service = {
    getRequirementDetials: getRequirementDetials,
    setRequirementDetials: setRequirementDetials,
    getRequirementIssueIds: getRequirementIssueIds,
    getRequirementIssueDetails: getRequirementIssueDetails,
    setModelRequirement : setModelRequirement,
    getModelRequirementIds : getModelRequirementIds,
    delete : deleteRequirement,
    getChildRequirements : getChildRequirements,
    getVersionMappedRequirments :  getVersionMappedRequirments
};