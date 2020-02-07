function createProject(response, data, userData){
	try{
		var projectName = data["name"];
		var accountId= data["actId"];
        var qcurl= data["qcurl"];
        var qcusrname= data["qcusrname"];
        var qcpassword= data["qcpass"];
        var qcdomain= data["qcdomain"];
        var qcproject= data["qcproject"];
        var toolName= data["toolId"];
        var toolType= data["toolTyp"];
		var msg = '';
		if(!global.validation.validation.test('empty',projectName)) msg = global.errorDescs.errorDesc.desc.PROJECT_NAME_REQUIRED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.project.exists({bussiness_account_master_id:accountId,name:projectName}, function(err, projectNameExist) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(projectNameExist){
					var projnameresp={
						msg:global.errorDescs.errorDesc.desc.DUPLICATE_PROJECT,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(projnameresp));
				}else{
                    global.appConstants.dbConstants.tableObj.tool.find({name:toolName},function (err,tools) {
                        if(err) {
                            global.errorLog.error(err);
                            var resp={
                                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                            }
                            response.end(JSON.stringify(resp));
                        }else{
                            var toolId=null;
                            if(tools!=null & tools.length>0) {
                                toolId=tools[0].id;
                            }
                            if(toolName=='CafeNext'){
                                toolId=null;
                                toolType=null;
                            }
						    var entryData = {
								name   : projectName,
								description   : projectName,
								active   : 1,
								bussiness_account_master_id: accountId,
                                createdBy: userData[0].userID,
                                tst_step_tool_id: toolId,
                                tst_step_tool_typ:toolType
								};
                            /* if(userData[0].role_id == 1){
                                
                            } */
							global.appConstants.dbConstants.tableObj.project.create([entryData], function (err, items) {
								if(err){
									global.errorLog.error(err);
									var resp={
										msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
										code:global.errorCodes.errorCode.codes.DB_IO_ERROR
									}
									response.end(JSON.stringify(resp));
								}else{
                                    //create entry in user_projects table
                                    var userProjectData = {
                                        user_id   : userData[0].id,
                                        project_id   : items[0].id
                                    };

                                    global.appConstants.dbConstants.tableObj.userProjects.create([userProjectData], function (err, items) {
                                        if(err){
                                            global.errorLog.error(err);
                                            var resp={
                                                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                            }
                                            response.end(JSON.stringify(resp));
                                        }else{
                                            var  hpalmdetails = {
                                                qc_username : qcusrname,
                                                qc_password : qcpassword,
                                                qc_url : qcurl,
                                                qc_domain : qcdomain,
                                                qc_project : qcproject,
                                                project_id  : userProjectData.project_id
                                            };
                                            global.appConstants.dbConstants.tableObj.qcdetails.create([hpalmdetails], function (err, qcitems) {
                                                if(err){
                                                    global.errorLog.error(err);
                                                    var resp={
                                                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                                    }
                                                    response.end(JSON.stringify(resp));
                                                }else{
                                                    var sucdataresp={
                                                        msg:global.errorDescs.errorDesc.desc.SUCCESS,
                                                        code:"200",
                                                        data:[]
                                                    }
                                                    response.end(JSON.stringify(sucdataresp));
                                                }
                                            });
                                        }
                                    });
                                }
                                 
                            });
                        }
                    });  
				}			
			});
		}else{
			var resp={
				msg:msg,
				code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
			}
			response.end(JSON.stringify(resp));
		}			
	}catch(e){
		global.errorLog.error(e);
		var eresp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(eresp));
	}						
}


function getAllProjectDetails(response, data, userDetails){
	try{
	
		var busId = userDetails[0].baccount_id;
		var msg = '';
		if(!global.validation.validation.test('empty',busId)) msg = global.errorDescs.errorDesc.desc.BUS_AC_ID_REQUIRED;
		else{
			msg = '';
		}
		if(msg == '') {
            var projectIds = [];
            var bussIdArr = [];
            var query = '';
            var createdBy = userDetails[0].userID;
            var roleName = userDetails[0].role.name;
            var inputParams=[1,1,1,1];
            if (roleName === 'Super Admin') {
                query = 'SELECT mv.id,mv.user_id,mv.name,mv.description,mv.active,mv.status,p.id project_id,m.id module_id,d.id diagram_id,p.name project_name,m.name module_name,d.name diagram_name,ba.name account_name,req.id requirement_id,req.name summary,req.description reqdescription,req.issue_id issue_id FROM project p left join bussiness_account_master ba on p.bussiness_account_master_id=ba.id left join module m on p.id=m.project_id and p.active=? left join diagram d on m.id = d.module_id and m.active=? and d.active=? left join model_version mv on m.id = mv.module_id and d.id = mv.diagram_id and p.id = mv.project_id and mv.active=? left join requirement req on  m.id= req.module_id order by ba.name,p.name,mv.id';
                //query ='SELECT mv.id,mv.user_id,mv.name,mv.description,mv.active,mv.status,p.id project_id,m.id module_id,d.id diagram_id,CONVERT(mv.diagram_data USING utf8) diagram_data,p.name project_name,m.name module_name,d.name diagram_name,ba.name account_name FROM project p left join bussiness_account_master ba on p.bussiness_account_master_id=ba.id left join module m on p.id=m.project_id and p.active=? left join diagram d on m.id = d.module_id and m.active=? and d.active=? left join model_version mv on m.id = mv.module_id and d.id = mv.diagram_id and p.id = mv.project_id and mv.active=? order by ba.name,p.name';
                getDetails(query,inputParams);
            } else if (roleName === 'Admin') {
                bussIdArr.push(busId);
                createdBy = userDetails[0].userID;
                inputParams.push(bussIdArr);
                inputParams.push(createdBy);
				query = 'SELECT mv.id,mv.user_id,mv.name,mv.description,mv.active,mv.status,p.id project_id,m.id module_id,d.id diagram_id,p.name project_name,m.name module_name,d.name diagram_name,ba.name account_name,req.id requirement_id,req.name summary,req.description reqdescription,req.issue_id issue_id FROM project p left join bussiness_account_master ba on p.bussiness_account_master_id=ba.id left join module m on p.id=m.project_id and p.active=? left join diagram d on m.id = d.module_id and m.active=? and d.active=? left join model_version mv on m.id = mv.module_id and d.id = mv.diagram_id and p.id = mv.project_id and mv.active=? left join requirement req on  m.id= req.module_id where (p.bussiness_account_master_id in ? and p.createdBy=?) order by p.name,mv.id';
                getDetails(query,inputParams);
            } else {
                bussIdArr.push(busId);
                inputParams.push(bussIdArr);
                userDetails[0].getProjects(function(err,userProjects){
                    for(var i=0;i<userProjects.length;i++){
                        projectIds.push(userProjects[i].project_id);
                    }
                    if (projectIds != null && projectIds.length > 0) {
                        inputParams.push(projectIds);
                         query = 'SELECT mv.id,mv.user_id,mv.name,mv.description,mv.active,mv.status,p.id project_id,m.id module_id,d.id diagram_id,p.name project_name,m.name module_name,d.name diagram_name,ba.name account_name,req.id requirement_id,req.name summary,req.description reqdescription,req.issue_id issue_id FROM project p left join bussiness_account_master ba on p.bussiness_account_master_id=ba.id left join module m on p.id=m.project_id and p.active=? left join diagram d on m.id = d.module_id and m.active=? and d.active=? left join model_version mv on m.id = mv.module_id and d.id = mv.diagram_id and p.id = mv.project_id and mv.active=? left join requirement req on  m.id= req.module_id  where (p.bussiness_account_master_id in ? and p.id in ?) order by p.name,mv.id';
                         //query = 'SELECT mv.id,mv.user_id,mv.name,mv.description,mv.active,mv.status,p.id project_id,m.id module_id,d.id diagram_id,CONVERT(mv.diagram_data USING utf8) diagram_data,p.name project_name,m.name module_name,d.name diagram_name,ba.name account_name FROM project p left join bussiness_account_master ba on p.bussiness_account_master_id=ba.id left join module m on p.id=m.project_id and p.active=? left join diagram d on m.id = d.module_id and m.active=? and d.active=? left join model_version mv on m.id = mv.module_id and d.id = mv.diagram_id and p.id = mv.project_id and mv.active=?  where (p.bussiness_account_master_id in ? and p.id in ?) order by p.name';
                    }
                    getDetails(query,inputParams);
                });
            }
		}else{
			var resp={
				msg:msg,
				code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
			}
			response.end(JSON.stringify(resp));
		}
	}catch(e){
		global.errorLog.error(e);
		var syntaxeresp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(syntaxeresp));
	}

	function getDetails(query,inputParams){
        global.db.driver.execQuery(query,inputParams, function(err, models) {
            if(err){
                global.errorLog.error(err);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else if(models.length > 0){
                var authorizedModels = [];
                for(var i=0;i<models.length;i++){
                    if(models[i].user_id){
                        if(models[i].user_id == userDetails[0].id){
                            authorizedModels.push(models[i]);
                        }else if(models[i].status == 7){
                            authorizedModels.push(models[i]);
                        }else{
                            var empty;
                            models[i].name = empty;
                            authorizedModels.push(models[i]);
                        }
                    }else{
                        authorizedModels.push(models[i]);
                    }
                    if(i == models.length-1){
                        var modelresp={
                            msg:global.errorDescs.errorDesc.desc.SUCCESS,
                            code:'200',
                            data:authorizedModels
                        }
                        response.end(JSON.stringify(modelresp));
                    }
                }

            }else if(models.length <= 0){
                var modelsresp={
                    msg:global.errorDescs.errorDesc.desc.SUCCESS,
                    code:'200',
                    data:[]
                }
                response.end(JSON.stringify(modelsresp));
            }
        });
	}

}



function deleteProject(response,data,userData){
    var pId = data["projId"];
    global.appLog.debug("-------->"+pId);
    global.appConstants.dbConstants.tableObj.project.find({id:pId}).remove(function (err) {
        if(err) {
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else{
            global.appConstants.dbConstants.tableObj.userProjects.find({project_id:pId}).remove(function(err) {
                if(err){
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
                        data:"Deleted project successfully"
                    }
                    global.appLog.debug("consile:"+JSON.stringify(delsucresp));
                    response.end(JSON.stringify(delsucresp));
                }
            });
        }
    });
}

function getAccountProjects(response,data,userData){
    try{
        var busId = data.baccount_id;
        var msg = '';
        if(!global.validation.validation.test('empty',busId)) msg = global.errorDescs.errorDesc.desc.BUS_AC_ID_REQUIRED;
        else{
            msg = '';
        }
        if(msg == ''){
            var searchJSON = {bussiness_account_master_id: busId};
            if(userData[0].role.name == 'Admin'){
                searchJSON.createdBy=userData[0].userID;
				getProjectsData(searchJSON);
            }else {
                getProjectsData(searchJSON);
            }
        }else{
            var resp={
                msg:msg,
                code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
            }
            response.end(JSON.stringify(resp));
        }
    }catch(e){
        global.errorLog.error(e);
        var esynresp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(esynresp));
    }

    function getProjectsData(searchJSON){
        global.appConstants.dbConstants.tableObj.project.find(searchJSON, function (err, statusObjtemp) {
            if (err) {
                global.errorLog.error(err);
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            } else {
                var statusObj = statusObjtemp;
                var  statusObjresp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: statusObj
                }
                response.end(JSON.stringify(statusObjresp));
            }
        });
	}

}

function getProjectDetails(response,data,userDetails){
    var busId = userDetails[0].baccount_id;
    var proId=data.projectId;
   if(proId==null || proId==undefined){ 
        global.appConstants.dbConstants.tableObj.project.find({bussiness_account_master_id:busId},function(err,projectdata){
            var resp = {
                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                code: "200",
                data: projectdata
            }
            response.end(JSON.stringify(resp));
        });
    }else{
        global.appConstants.dbConstants.tableObj.project.find({id:proId},function(err,projectdata){
            var resp = {
                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                code: "200",
                data: projectdata
            }
            response.end(JSON.stringify(resp));
        });

    }  
}
        
function setTestCaseTemplateStru(response,data,userDetails){
    var busId=data.busID;
    var projectTemplate=data.testcaseTemplate;
   
    global.appConstants.dbConstants.tableObj.project.find({id:busId},function(err,projectdata){
        
        var project = projectdata[0];
        project.templateCols=projectTemplate;
        project.save(function(e){
            if(e){
                global.errorLog.error(e);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else{
                var tempresp={
                    msg:global.errorDescs.errorDesc.desc.SUCCESS,
                    code:"200",
                    data:"Template updated successfully"
                }
                response.end(JSON.stringify(tempresp));
            }
        });
    });
}

function setJiraConfiguration(response,data,userDetails){
  var projectid= data.projectid;
  var toolname=  data.toolname;
  var configdetails=data.configdetails;
  
  global.appConstants.dbConstants.tableObj.tooldetails.find({tool_name:toolname,project_id:projectid}, function(err, projectIdExist) {
    if(err){
        global.errorLog.error(err);
        var resp={
            msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
            code:global.errorCodes.errorCode.codes.DB_IO_ERROR
        }
        response.end(JSON.stringify(resp));
    }else if(projectIdExist.length==1){
        projectIdExist[0].project_id=projectid;
        projectIdExist[0].tool_name=toolname;
        projectIdExist[0].config_dtl=configdetails;
        projectIdExist[0].save(function(err){
            if(err){
                global.errorLog.error(err);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else{
                
            var query = "update model_version mv set mv.jira_issue_ids=? where mv.project_id=?"
            global.db.driver.execQuery(query, [null, projectid], function (err, models) {
            
                var resp={
                    msg:global.errorDescs.errorDesc.desc.SUCCESS,
                    code:"200",
                    data:"1"
                }
                response.end(JSON.stringify(resp));
                       
            });
     
            }
        });
          
    }else{
        var tooldetails={
            project_id:projectid,
            tool_name:toolname,
            config_dtl:JSON.stringify(configdetails),
          };
        global.appConstants.dbConstants.tableObj.tooldetails.create([tooldetails], function (err, items) {
            if(err){
                global.errorLog.error(err);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else{
                var globalResp={
                    msg:global.errorDescs.errorDesc.desc.SUCCESS,
                    code:"200",
                    data:"2"
                }
                response.end(JSON.stringify(globalResp));
            }
        });
    }
   
  });

    
}

function getJiraConfiguration(response,data,userDetails){
    var project_id=  data.project_id;
    var toolName= data.tooltype;
    global.appConstants.dbConstants.tableObj.tooldetails.find({tool_name:toolName,project_id:project_id}, function(err, projectIdExist) {
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else{
            var projectExistresp={
                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                code:"200",
                data:projectIdExist
            }
            response.end(JSON.stringify(projectExistresp));
        }
    });
}

function getProjectReport(response,data,userDetails){
    let project_id = data.project_id;
    let proj_act_name=data.proj_name;
    let sql = `CALL project_report(?)`;
    global.db.driver.execQuery(sql, [project_id], function (err, models) {
        var dbResponse=models[0];
        var reportData=dbResponse[0].report_data;
        var projectReportJSON={projectName:'',actName:'',allTC:0,moduleData:[]};        
        if(reportData!=''){
            var projectReportData=JSON.parse(reportData);
            var allTcCount=0;
            var rowSpanIndex={};
            for(var i=0;i<projectReportData.length;i++){
                if(i==0){
                    projectReportJSON.projectName=projectReportData[i].project_name;
                    projectReportJSON.actName=projectReportData[i].account_name;
                }
                allTcCount+=parseInt(projectReportData[i].tc_count);
                var current_module_id=projectReportData[i].module_id;           
                var objectData={
                    moduleId:projectReportData[i].module_id,
                    moduleName:projectReportData[i].module_name,
                    diagramName:projectReportData[i].diagram_name,
                    totalTc:projectReportData[i].tc_count,
                    highTc:projectReportData[i].tc_high,
                    mediumTc:projectReportData[i].tc_medium,
                    lowTc:projectReportData[i].tc_low,
                    sanityTc:projectReportData[i].tc_sanity,
                    exceptionTc:projectReportData[i].tc_exception,
                    versionId:projectReportData[i].version_id,
                    versionNumber:projectReportData[i].version_number,
                    rowSpanCount:0
                }
                projectReportJSON.moduleData.push(objectData);
                if(rowSpanIndex[""+current_module_id]!=undefined){
                    var existingCount=rowSpanIndex[""+current_module_id].count;
                    rowSpanIndex[""+current_module_id].count=existingCount+1;
                }else{
                    rowSpanIndex[""+current_module_id]={index:(projectReportJSON.moduleData.length-1),count:1}
                }
            }
            var keys=Object.keys(rowSpanIndex);
            for(var keyCount=0;keyCount<keys.length;keyCount++){
                var key=keys[keyCount];
                var keyData=rowSpanIndex[key];
                projectReportJSON.moduleData[keyData.index].rowSpanCount=keyData.count;
            }
            projectReportJSON.allTC=allTcCount;
        }else{
            //set project name, act name
            proj_act_name=proj_act_name.replace("]","");
            var nameArray=proj_act_name.split("[");
            if(nameArray.length == 2){
                var pName=nameArray[0].trim();
                var aName=nameArray[1].trim();
                projectReportJSON.projectName=pName;
                projectReportJSON.actName=aName;      
            }  
        }
        var projectReportresp={
            msg:global.errorDescs.errorDesc.desc.SUCCESS,
            code:"200",
            data:projectReportJSON
        }
        response.end(JSON.stringify(projectReportresp));
    });    

}

module.exports.service = {
	create:createProject,
	getAllProjectDetails:getAllProjectDetails,
	delete:deleteProject,
    getAccountProjects:getAccountProjects,
    getProjectDetails:getProjectDetails,
    setTestCaseTemplateStru:setTestCaseTemplateStru,
    setJiraConfiguration:setJiraConfiguration,
    getJiraConfiguration:getJiraConfiguration,
    getProjectReport :getProjectReport
};
