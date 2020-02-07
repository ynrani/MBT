function updateScenario(response, data, userData){
	try{

		var scenarioId = data["scenarioId"];
		var name = data["name"];
		var criticality = data["criticality"];
		var defects = data["defects"];
		var severity = data["severity"];
		var risk_exposer1 = data["risk_exposer1"];
		var risk_exposer2 = data["risk_exposer2"];
		var testing_effort = data["testing_effort"];
		var primaryFlow = data["primaryFlow"];
		var modelVersionId = data["modelVersionId"];
		var preCondition= data["preCond"];
        var postCondition= data["postCond"];
        global.appLog.debug(data);
		
		var msg = '';
		if(!global.validation.validation.test('empty',modelVersionId)) msg = global.errorDescs.errorDesc.desc.MODEL_VERSION_ID_REQUIRED;
        else if(!global.validation.validation.test('empty',scenarioId)) msg = global.errorDescs.errorDesc.desc.SCENARIO_ID_REQUIRED;
		else if(!global.validation.validation.test('empty',name)) msg = global.errorDescs.errorDesc.desc.SCENARIO_NAME_REQUIRED;
		else if(!global.validation.validation.test('empty',criticality)) msg = global.errorDescs.errorDesc.desc.SCENARIO_CRITICALITY_REQUIRED;
		else if(!global.validation.validation.test('empty',defects)) msg = global.errorDescs.errorDesc.desc.SCENARIO_DEFECT_REQUIRED;
		else if(!global.validation.validation.test('empty',severity)) msg = global.errorDescs.errorDesc.desc.SCENARIO_SEVERITY_REQUIRED;
		/* else if(!global.validation.validation.test('empty',risk_exposer1)) msg = global.errorDescs.errorDesc.desc.SCENARIO_RISK_EXPOSER_REQUIRED;
		else if(!global.validation.validation.test('empty',risk_exposer2)) msg = global.errorDescs.errorDesc.desc.SCENARIO_RISK_EXPOSER_REQUIRED; */
		else if(!global.validation.validation.test('empty',testing_effort)) msg = global.errorDescs.errorDesc.desc.SCENARIO_TESTING_EFFORT_REQUIRED;
		else if(!global.validation.validation.test('empty',primaryFlow)) msg = global.errorDescs.errorDesc.desc.SCENARIO_PRIMARY_FLOW_REQUIRED;
		else{
			msg = '';
		}
		if(msg == ''){

            if (name.length > 2000) {
                name = name.substr(0, 2000) + "...";
            } 

			global.appConstants.dbConstants.tableObj.modelVersion.find({id:modelVersionId}, function(err, modelVersionObj) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(modelVersionObj.length == 1){
                    if(modelVersionObj[0].status == 7){
                        var resp={
                            msg:global.errorDescs.errorDesc.desc.CANNOT_UPDATE_SCENARIO_PUBLISHED_MODEL_VERSION,
                            code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                        }
                        response.end(JSON.stringify(resp));
                    }else{
                        persistMVData();
                    }
				}else{
				        var resp={
                            msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID,
                            code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                        }
                        response.end(JSON.stringify(resp));
				}
				function persistMVData(){


								var entryData = {
								    id : scenarioId,
									name   : name,
									criticality   : criticality,
									defects   : defects,
									severity   : severity,
									risk_exposer   : risk_exposer1,
                                    risk : risk_exposer2,
									testing_effort   : testing_effort,
									active: 1,
									status:1,
									pre_condition:preCondition,
									post_condition:postCondition,
									model_version_id:modelVersionObj[0].id
								};
								/*global.appConstants.dbConstants.tableObj.scenarioMaster.create([entryData], function (err, items) {
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
										response.end(JSON.stringify(resp));
									}
								});*/

                    global.appConstants.dbConstants.tableObj.scenarioMaster.find({id:scenarioId}, function(err, scenarioObj) {
                        if(err){
                            global.errorLog.error(err);
                            var resp={
                                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                            }
                            response.end(JSON.stringify(resp));
                        }else if(scenarioObj.length == 1){
                                scenarioObj[0].name=name,
                                scenarioObj[0].criticality=criticality,
                                scenarioObj[0].defects=defects,
                                scenarioObj[0].severity=severity,
                                scenarioObj[0].risk_exposer=risk_exposer1,
                                scenarioObj[0].risk=risk_exposer2,
                                scenarioObj[0].testing_effort=testing_effort,
                                scenarioObj[0].pre_condition=preCondition,
                                scenarioObj[0].post_condition=postCondition,
                                scenarioObj[0].primary_flow=primaryFlow,
                                scenarioObj[0].save(function(err){
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
                                        code:"200"
                                    }
                                    response.end(JSON.stringify(resp));
                                }
                            });
                        }else{
                            var resp={
                                msg:global.errorDescs.errorDesc.desc.INVALID_SCENARIO_ID,
                                code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                            }
                            response.end(JSON.stringify(resp));
                        }});
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
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}						
}

function createGeneratedScenarios(response, data, userData){
    try{
        var scenariosData=data.scenarios;
        var entryData  =  new Array();
        var modelVersionId="";
        for(var index=0;index<scenariosData.length;index++){
            entryData.push({
                name   : scenariosData[index].name,
                path : scenariosData[index].path,
                scenario_index: scenariosData[index].scenarioIndex,
                criticality   : scenariosData[index].criticality,
                defects   : scenariosData[index].defects,
                severity   : scenariosData[index].severity,
                risk_exposer   : scenariosData[index].risk_exposer1,
				risk: scenariosData[index].risk_exposer2,
                testing_effort   : scenariosData[index].testing_effort,
                active: 1,
                status:1,
                pre_condition:scenariosData[index].preCond,
                post_condition:scenariosData[index].postCond,
                model_version_id:scenariosData[index].modelVersionId,
                primary_flow:scenariosData[index].primaryFlow,
                exception:scenariosData[index].exception,
                frequency:scenariosData[index].frequency,
            });
            modelVersionId=scenariosData[index].modelVersionId;
        }

        global.appConstants.dbConstants.tableObj.modelVersion.find({id:modelVersionId}, function(err, modelVersionObj) {
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else if(modelVersionObj.length == 1){
            if(modelVersionObj[0].status == 7){
                var resp={
                    msg:global.errorDescs.errorDesc.desc.CANNOT_GENERATE_SCENARIOS_PUBLISHED_MODEL_VERSION,
                    code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                }
                response.end(JSON.stringify(resp));
            }else  if(modelVersionObj[0].diagram_data==undefined){
                var resp={
                    msg:global.errorDescs.errorDesc.desc.SAVE_DIAGRAM_DATA,
                    code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                }
                response.end(JSON.stringify(resp));
            }
            var sql = "DELETE from scenario_master WHERE model_version_id = ?";
            var query = global.db.driver.execQuery(sql, [modelVersionId], function(err, result) {
            global.appLog.debug("Records Deleted!!" + result);
                persistMVData();

            });
        }else{
            var resp={
                msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID,
                code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
            }
            response.end(JSON.stringify(resp));

        }
        function persistMVData(){


            global.appConstants.dbConstants.tableObj.scenarioMaster.create(entryData, function (err, items) {
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
                    response.end(JSON.stringify(resp));
                }
            });


        }
    });
    }catch(e){
        global.appLog.debug("Error in Saving generated scenarios");
        global.errorLog.error(e);
        var resp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}

function getAllScenarios(response, data, userDetails){
    try{
            
            global.appConstants.dbConstants.tableObj.scenarioMaster.find({model_version_id:data.modelVersionId,active:1}, function(err, models) {
                if(err){
                    global.errorLog.error(err);
                    var resp={
                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                    }
                    response.end(JSON.stringify(resp));
                }else if(models.length > 0){
                    for(var index=0;index<models.length;index++){
                       var modelScenario= models[index];
                       modelScenario.model_version='';
                    }

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
                        data:[]
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

function deleteAllScenarios(response, data, userDetails){
    try{
        var vId = data["versionId"];
        global.appConstants.dbConstants.tableObj.scenarioMaster.find({model_version_id:vId}).remove(function(err) {
            if(err) {
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
                global.appLog.debug("consile:"+JSON.stringify(resp));
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




module.exports.service = {
	update:updateScenario,
    createGenerated:createGeneratedScenarios,
	getAll:getAllScenarios,
    deleteAll:deleteAllScenarios
};
