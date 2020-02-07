function createModelVersion(response, data, userData){
	try{
		var diagramId = data["diagramId"];
		var defaultVersion = (data.copyDefaultVersion == 'true');
		var blankVersion = (data.copyBlankVersion == 'true');
		var newVersionId = '';
		var lastPubVersion = '';
		var versionId = '';
		var testStepId = ''; 
		var newTestStpId = '';
		var entryDataOldVers  =  new Array();
		var entryDataNewVers  =  new Array();
		var entryDataNewRec  =  new Array();
		var dataTable;
		var dataFlag = 0;
		var issue_ids = data.req_map_data;
		var projectIds=[];
		//var testDataMap = new Array();
		var HashMap = require('hashmap');
		var testDataMap = new HashMap();
		if(!defaultVersion && !blankVersion){
			versionId = data["selectedVer"];
		}
		var versionDiag = '';
		var msg = '';
		if(!global.validation.validation.test('empty',diagramId)) msg = global.errorDescs.errorDesc.desc.INVALID_MODEL_ID;
		else{
			msg = '';
		}
		if(msg == ''){
			var modelVersionName = 1.0;
			global.appConstants.dbConstants.tableObj.modelVersion.find({diagram_id:diagramId}, function(err, modelVersionObj) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(modelVersionObj.length > 0){
					if(modelVersionObj[modelVersionObj.length-1].status == 6){
						var responseMsg=global.errorDescs.errorDesc.desc.MODEL_LOCKED;
						//responseMsg=responseMsg;
						var args=modelVersionObj[modelVersionObj.length-1].user.userName+' ('+modelVersionObj[modelVersionObj.length-1].user.userID+')';
						global.appLog.debug(responseMsg);
						var resp={
							msg:"lockVersionMsg",
							code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE,
							args:args

						}
						response.end(JSON.stringify(resp));
					}else{
						lastPubVersion = parseFloat(modelVersionObj[modelVersionObj.length-1].name);
						var temp = parseFloat(modelVersionObj[modelVersionObj.length-1].name)+0.1;
						modelVersionName = parseFloat(temp.toFixed(3));
					}
				}
				if(defaultVersion == true){
					getDiagDetailLstPubV();
				}else if(blankVersion == true){
					persistMVData();
				}
				else{
					getDiagramDetail();
				}
				function getDiagDetailLstPubV(){
					global.appConstants.dbConstants.tableObj.modelVersion.find({diagram_id:diagramId, name:lastPubVersion}, function(err, VersionDiagram) { 
					if(err){
						global.errorLog.error(err);
						var resp={
							msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						}
						response.end(JSON.stringify(resp));
					}else if(VersionDiagram.length > 0){
						versionDiag = VersionDiagram[0].diagram_data;
						versionId = VersionDiagram[0].id;
						persistMVData();
							
					}else{
						var resp={
							msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_ID,
							code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
						}
						response.end(JSON.stringify(resp));
						}	
					});
				}
				function getDiagramDetail(){
					global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, VersionDiagram) { 
					if(err){
						global.errorLog.error(err);
						var resp={
							msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						}
						response.end(JSON.stringify(resp));
					}else if(VersionDiagram.length > 0){
						versionDiag = VersionDiagram[0].diagram_data;
						projectIds.push(VersionDiagram[0].project_id);
						persistMVData();
							
					}else{
						var resp={
							msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_ID,
							code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
						}
						response.end(JSON.stringify(resp));
						}	
					});
				}
				function persistMVData(){
					global.appConstants.dbConstants.tableObj.diagram.find({id:diagramId}, function(err, modelNameExist) { 
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(modelNameExist.length > 0){
								var entryData = {
									name   : modelVersionName,
									description   : "Version "+modelVersionName,
									active   : 1,
									status: 6,
									diagram_data: versionDiag,
									project_id:modelNameExist[0].module.project_id,
									module_id:modelNameExist[0].module.id,
									diagram_id:diagramId,
									user_id:userData[0].id
								};
								projectIds.push(modelNameExist[0].module.project_id);
								global.appConstants.dbConstants.tableObj.modelVersion.create([entryData], function (err, items) {
									if(err){
										global.errorLog.error(err);
										var resp={
											msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
											code:global.errorCodes.errorCode.codes.DB_IO_ERROR
										}
										response.end(JSON.stringify(resp));
									}else{
										var resp={
											msg:global.errorDescs.errorDesc.desc.SUCCESS,
											code:"200",
											data:items
										}
										newVersionId = items[0].id;
										var checkProjectTool=false;
										if(!defaultVersion && !blankVersion){
										   if(projectIds.length==2){
											   if(projectIds[0]!=projectIds[1]){
												checkProjectTool=true;
											   }
										   }
										}
										if(!blankVersion){
											createSceCopy();
											if(checkProjectTool){
												global.appConstants.dbConstants.tableObj.project.find({id:projectIds}, function (err, projects) {
													if (err) {
														global.errorLog.error(err);
													} else {
														if(projects!==null && projects.length==2){
															if(projects[0].tool_id==projects[1].tool_id){
																createTstStpCopy();
																setTimeout(function() {
																	createTstDataCopy();
																}, 300);	
															}
														}
													}
												});
											}else{
												createTstStpCopy();
												setTimeout(function() {
													createTstDataCopy();
												}, 300);
											}
											createCommentsCopy();
											mapRequirementToModel();										
											setTimeout(function() {
												createNewData();
											}, 600);
										}else{
											mapRequirementToModel();
										}
										response.end(JSON.stringify(resp));
									}
								});
						}else{
							var resp={
								msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_ID,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
						}
					});
				}
				function createSceCopy(){
					global.db.driver.execQuery('insert into scenario_master (SELECT 0, name,criticality, defects, severity, risk_exposer,testing_effort,active,status,?,scenario_index,frequency,exception,type,primary_flow,loop_path,risk,pre_condition,post_condition,path FROM scenario_master where model_version_id = ?)',[newVersionId, versionId], function(err, models){
							if(err){
								global.errorLog.error(err);
								//var resp={
							//		msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							//		code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							//	}
							//	response.end(JSON.stringify(resp));	
							}else{
								//var resp={
								//	msg:global.errorDescs.errorDesc.desc.SUCCESS,
								//	code:'200',
								//	data:"Scenario and Test Step and Data has been copied"
								//}
								//response.end(JSON.stringify(resp));
								global.appLog.debug("Scenario and Test Step and Data has been copied");
							}
						});
				}
				function createTstStpCopy(){
					global.db.driver.execQuery('insert into test_step_master (SELECT 0,test_step_number, action,target_type, target, tst_step_data, description,node_id,?,tool_id,tst_step_args,test_step_type FROM test_step_master where version_id = ?)',[newVersionId, versionId], function(err, models){
							if(err){
								global.errorLog.error(err);
								//var resp={
								//	msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								//	code:global.errorCodes.errorCode.codes.DB_IO_ERROR
								//}
								//response.end(JSON.stringify(resp));	
							}
							else{
								//var resp={
							//		msg:global.errorDescs.errorDesc.desc.SUCCESS,
							//	code:'200',
							//		data:"Scenario and Test Step and Data has been copied"
							//	}
								global.appLog.debug("Scenario and Test Step and Data has been copied");
							//	response.end(JSON.stringify(resp));
							}
						});
				}
				function createTstDataCopy(){
					//code for insertion into test data table
						global.appConstants.dbConstants.tableObj.testCondition.find({version_id: versionId}, function(err, oldStepId) {
						if(err) {
							global.errorLog.error(err);
						//	var resp={
							//	msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							//	code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							//}
							//response.end(JSON.stringify(resp));
						}
						else if(oldStepId.length > 0){
								for(var i=0;i<oldStepId.length;i++){
									entryDataOldVers.push(oldStepId[i].id);
								}
								global.appConstants.dbConstants.tableObj.testCondition.find({version_id: newVersionId}, function(err, newStepId) {
									if(err){
										global.errorLog.error(err);
									//	var resp={
									//		msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
									//		code:global.errorCodes.errorCode.codes.DB_IO_ERROR
									//	}
									//	response.end(JSON.stringify(resp));
									}
									else if(newStepId.length > 0){
											for(var i=0;i<newStepId.length;i++){
												entryDataNewVers.push(newStepId[i].id);
											}
											for(var index=0;index<entryDataOldVers.length;index++){
												var oldId = entryDataOldVers[index];
												var newId = entryDataNewVers[index];
												testDataMap.set(oldId, newId);
											}
													global.appConstants.dbConstants.tableObj.testData.find({test_step_id: entryDataOldVers}, function(err, stepDataRet){
														if(err){
														global.errorLog.error(err);
												//		var resp={
												//			msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
												//			code:global.errorCodes.errorCode.codes.DB_IO_ERROR
												//		}
													//	response.end(JSON.stringify(resp));
														}
														else if(stepDataRet.length>0){
															for(var j=0;j<stepDataRet.length;j++){
																var oldStepId = stepDataRet[j].test_step_id
																	entryDataNewRec.push({
																	step_data	   : stepDataRet[j].step_data,
																	test_step_id   : testDataMap.get(oldStepId)
																});
															}
														}
														else{
														//var resp={
														//	msg:global.errorDescs.errorDesc.desc.SUCCESS,
														//	code:"200",
														//	data:"Searched successfully"
													//	}
														//response.end(JSON.stringify(resp));
														global.appLog.debug("Searched successfully");
													}
													});
									}
									else{
										//var resp={
										//	msg:global.errorDescs.errorDesc.desc.NO_MODELS_IN_LIST,
										//	code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									//	}
									//	response.end(JSON.stringify(resp));
									}
								});
							}
						else{
							//var resp={
							//	msg:global.errorDescs.errorDesc.desc.SUCCESS,
							//	code:"200",
							//	data:"Deleted successfully"
						//	}
							global.appLog.debug("console:"+JSON.stringify(resp));
							//response.end(JSON.stringify(resp));
						}
					});
		// code for insertion into test data ends
				}
				function createNewData(){
					global.appConstants.dbConstants.tableObj.testData.create(entryDataNewRec, function (err, items){				
						if(err){
							global.errorLog.error(err);
						//	var resp={
						//		msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						//		code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						//	}
						//	response.end(JSON.stringify(resp));
						}else{
						//	var resp={
						//		msg:global.errorDescs.errorDesc.desc.SUCCESS,
						//		code:"200",
						//		data:items
						//	}
						//	response.end(JSON.stringify(resp));
						}
					});
				}

				function createCommentsCopy(){
					try{	
						var inputParams=[versionId];
						var commentsOrder=[];
						var query = 'SELECT mc.id,mc.comment_txt,mc.parent_id,mc.created_date,r.userName,mc.user_id FROM model_comments mc left join register r on (mc.user_id=r.userID)  where mc.model_version_id=? order by mc.created_date desc, mc.id desc';
						var commentMap=new HashMap();         
						global.db.driver.execQuery(query,inputParams, function(err, comments) {
							if(err){
								global.errorLog.error(err);
							//   var resp={
							//       msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							//       code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							//   }
						//     response.end(JSON.stringify(resp));
							}else if(comments.length > 0){
								var length=comments.length;
								for(var index=0;index<length;index++){
									var commentRow=comments[index];
									if(commentRow.parent_id!=null){
										var replyObject={
											comment_txt:commentRow.comment_txt,
											created_date:commentRow.created_date,
											user_id:commentRow.user_id,
											model_version_id:newVersionId
										}
										if(commentMap.get(commentRow.parent_id)==undefined){
											commentMap.set(commentRow.parent_id,{
												comment_txt:'',
												created_date:'',
												user_id:'',
												model_version_id:newVersionId,
												replies:[replyObject]
										});
										}else{
											var commentObj=commentMap.get(commentRow.parent_id);
											commentObj.replies.push(replyObject);
										}
									}else{
										if(commentMap.get(commentRow.id)==undefined){
											commentMap.set(commentRow.id,{
												comment_txt:commentRow.comment_txt,
												created_date:commentRow.created_date,
												user_id:commentRow.user_id,
												model_version_id:newVersionId,
												replies:[]
											});
										}else{
											var commentObj=commentMap.get(commentRow.id);
											commentObj.comment_txt=commentRow.comment_txt;
											commentObj.created_date=commentRow.created_date;
											commentObj.user_id=commentRow.user_id; 
											commentObj.model_version_id=newVersionId;                            
										}
										commentsOrder.push(commentRow.id);                        
									}
								} 
								if(commentsOrder.length>0){
									var pushComments=[];
									for(var index=0;index<commentsOrder.length;index++){
										pushComments.push(commentMap.get(commentsOrder[index]));
									}            
									persistComments(pushComments);               
									//console.log(JSON.stringify(pushComments));
								}
							}
						});		
					}catch(e){
						global.errorLog.error(e);
					//	var resp={
					//		msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
					//		code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
					//	}
					//	response.end(JSON.stringify(resp));
					}
				}

				function persistComments(entryData){ 
					global.appConstants.dbConstants.tableObj.modelComments.create(entryData, function (err, items) {
						if(err){
							global.errorLog.error(err);
						// var resp={
						//     msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						//     code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						//  }
						//  response.end(JSON.stringify(resp));
						}else{
							//var resp={
							//    msg:global.errorDescs.errorDesc.desc.SUCCESS,
							//    code:"200",
							//    data:items
						//  }
						//  response.end(JSON.stringify(resp));
						}
					});
				}

			});
				
	
	
		function mapRequirementToModel(){
			var req_ids = issue_ids;
			var VersionId = newVersionId;
			var requirementArr=[];
		 if(req_ids!=undefined){ 	
			for(var i=0;i<req_ids.length;i++){
				var req_id_ver_id =  req_ids[i];
				var requirementDetails = {
				  	model_id: VersionId,
				  	requirement_id: req_id_ver_id
				  }
				  requirementArr.push(requirementDetails)
			}
			global.appConstants.dbConstants.tableObj.model_requirement.create(requirementArr, function (err, items) {
				//count = count + 1;
				if (err) {
					global.errorLog.error(err);
					var resp = {
						msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code: global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				} else {
					
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
}catch(e){
	global.errorLog.error(e);
	var resp={
		msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
		code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
	}
	response.end(JSON.stringify(resp));
}		
}

function testConditionRemove(response, data, userData){
	try{
		var testsStepId=data.stepId;
		global.appLog.debug(data);
		var entryData  =  new Array();
		for(var index=0;index<testsStepId.length;index++){
		entryData.push(testsStepId[index].checkStepId);
        }
        global.appLog.debug(entryData);
		persistMVData();	
		function persistMVData(){
			global.appConstants.dbConstants.tableObj.testCondition.find({id: entryData}).remove(function(err) {							
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else{
					var resp={
						msg:global.errorDescs.errorDesc.desc.SUCCESS,
						code:"200",
						data:"Deleted successfully"
					}
					response.end(JSON.stringify(resp));
				}
			});
		
		
		}			
	}catch(e){
		global.errorLog.error(e);
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}						
}



function getAllModel(response, data, userDetails){
    try{
		var userDetail = data.userName;
		var diagramId=data.diagId;
		global.db.driver.execQuery('select d.id,d.name,count(*) as vCount from diagram d, model_version mv where (d.id = mv.diagram_id and d.id=?) group by d.id,d.name',[diagramId], function(err, diagramDetails) {
			if(err){
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));	
			}else{
                if(diagramDetails[0] == undefined || diagramDetails[0].vCount<=0){
					global.db.driver.execQuery('select id,name from diagram where id in(select distinct(diagram_id) from model_version where user_id in(select id from register where userName =?))',[userDetail], function(err, models) {
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));	
						}else if(models.length > 0){
							var resp={
								msg:global.errorDescs.errorDesc.desc.SUCCESS,
								code:'200',
								data:models
							}
							response.end(JSON.stringify(resp));
						}
					});
				}else{
					var resp={
						msg:global.errorDescs.errorDesc.desc.SUCCESS,
						code:'200',
						data:[{"id":diagramDetails[0].id,"name":diagramDetails[0].name,"vCount":diagramDetails[0].vCount}]
					}
					response.end(JSON.stringify(resp));
				}
			}	
		});
    }catch(e){
        global.errorLog.error(e);
        var resp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}


function getAllVersion(response, data, userDetails){
    try{
		var diagramName = data.selected;
		global.db.driver.execQuery('select mv.description,mv.id from model_version mv where diagram_id= ?',[diagramName], function(err, models) {
		if(err){
			global.errorLog.error(err);
			var resp={
				msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
				code:global.errorCodes.errorCode.codes.DB_IO_ERROR
			}
			response.end(JSON.stringify(resp));	
		}else if(models.length > 0){
			var resp={
				msg:global.errorDescs.errorDesc.desc.SUCCESS,
				code:'200',
				data:models
			}
			response.end(JSON.stringify(resp));
		}else{
			var resp={
				msg:global.errorDescs.errorDesc.desc.SUCCESS,
				code:'200',
				data:models
			}
			response.end(JSON.stringify(resp));
		}
	});

    }catch(e){
        global.errorLog.error(e);
        var resp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}

function checkdaigramlock(response, data, userDetails) {
	var diagramId = data["diagramId"];
	
    global.appConstants.dbConstants.tableObj.modelVersion.find({diagram_id: diagramId}, function (err, modelVersionObj) {
        if (err) {
            global.errorLog.error(err);
            var resp = {
                msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code: global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        } else if (modelVersionObj.length > 0)
        {
            if (modelVersionObj[modelVersionObj.length - 1].status == 6) {
                var responseMsg = global.errorDescs.errorDesc.desc.MODEL_LOCKED;
                //responseMsg = responseMsg + modelVersionObj[modelVersionObj.length - 1].user.userName + ' (' + modelVersionObj[modelVersionObj.length - 1].user.userID + ')';
				var args=modelVersionObj[modelVersionObj.length - 1].user.userName + ' (' + modelVersionObj[modelVersionObj.length - 1].user.userID + ')';
				global.appLog.debug(responseMsg);
                var resp = {
                    msg: "lockVersionMsg",
					code: global.errorCodes.errorCode.codes.RESPONSE_FAILURE,
					args: args
                }
                response.end(JSON.stringify(resp));
            }else{
                var resp={
                    msg:global.errorDescs.errorDesc.desc.SUCCESS,
                    code:'200'
				}
                response.end(JSON.stringify(resp));
			}

        }else{
            var resp={
                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                code:'300'

            }
            response.end(JSON.stringify(resp));
		}
    });
}

function checkPrevVersionData(response, data, userDetails){
	var diagramId = data["diagramId"];
	global.appConstants.dbConstants.tableObj.modelVersion.find({diagram_id:diagramId}, function(err, modelNameExist) { 
		if(err){
			global.errorLog.error(err);
			var resp={
				msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
				code:global.errorCodes.errorCode.codes.DB_IO_ERROR
			}
			response.end(JSON.stringify(resp));
		}else if(modelNameExist.length > 0){
			  var versionId=modelNameExist[modelNameExist.length-1].id
			  var resp={
				msg:global.errorDescs.errorDesc.desc.SUCCESS,
				code:"200",
				data:versionId
			  }
			  response.end(JSON.stringify(resp));			  
		}else{
			var resp={
				msg:'modelNotFoundError',
				code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
			}
			response.end(JSON.stringify(resp));
		}
	});
}



module.exports.service = {
	create:createModelVersion,
	getAllM:getAllModel,
	getAllV:getAllVersion,
	checkdaigramstatus:checkdaigramlock,
	checkPrevVersionData:checkPrevVersionData
};
