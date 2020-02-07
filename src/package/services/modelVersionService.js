function updateVersion(response, data, userData){
	try{
		var blobData = data["blobData"];
		var versionId = data["versionId"];
global.appLog.debug(blobData);
		
		var msg = '';
		if(!global.validation.validation.test('empty',blobData)) msg = global.errorDescs.errorDesc.desc.EMPTY_DIAGRAM_DATA;
		else if(!global.validation.validation.test('empty',versionId)) msg = global.errorDescs.errorDesc.desc.MODEL_VERSION_ID_REQUIRED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, versionObj) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(versionObj.length == 1){
					if(versionObj[0].user_id == userData[0].id){
						
						
						if(versionObj[0].status == 6){
						if(data["publish"]){
							
							versionObj[0].status = 7;
							
						}else{
							versionObj[0].diagram_data= blobData;
						}
						versionObj[0].save(function(err){
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
						}else if(versionObj[0].status == 7){
							if(data["publish"]){
							var resp={
									msg:global.errorDescs.errorDesc.desc.MODEL_VERSION_ALREADY_PUBLISHED,
									code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
								}
								response.end(JSON.stringify(resp));
							}else{
								var resp={
									msg:global.errorDescs.errorDesc.desc.CANNOT_MODIFY_PUBLISHED_MODEL_VERSION,
									code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
								}
								response.end(JSON.stringify(resp));
							}
							
						}else{
							var resp={
									msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID,
									code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
								}
								response.end(JSON.stringify(resp));
						}
						}else{
							var resp={
									msg:global.errorDescs.errorDesc.desc.ACCESS_NOT_ALLOWED_FOR_DIFFERENT_PROJECT,
									code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
								}
								response.end(JSON.stringify(resp));
						}
					
				}else{
					var resp={
						msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
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
function getAllModelVersion(response, data, userDetails){
	try{
	
		var busId = userDetails[0].baccount_id;
		var msg = '';
		if(!global.validation.validation.test('empty',busId)) msg = global.errorDescs.errorDesc.desc.BUS_AC_ID_REQUIRED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.modelVersion.find({bussiness_account_master_id:busId,active:1}, function(err, models) {
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
						msg:global.errorDescs.errorDesc.desc.NO_MODELS_IN_LIST,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
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
function createModelVersion(response, data, userData){
	try{
		/* var modelVersionName = data["name"]; */
		var diagramId = data["diagramId"];
		var msg = '';
		/* if(!global.validation.validation.test('empty',modelVersionName)) msg = global.errorDescs.errorDesc.desc.MODEL_VERSION_REQUIRED; */
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
					//responseMsg=responseMsg+modelVersionObj[modelVersionObj.length-1].user.userName+' ('+modelVersionObj[modelVersionObj.length-1].user.userID+')';
					var args=modelVersionObj[modelVersionObj.length-1].user.userName+' ('+modelVersionObj[modelVersionObj.length-1].user.userID+')';
					global.appLog.debug(responseMsg);
					var resp={
						msg:"lockVersionMsg",
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE,
						args:args
					}
					response.end(JSON.stringify(resp));
					}else{
					var temp = parseFloat(modelVersionObj[modelVersionObj.length-1].name)+0.1;
					modelVersionName = parseFloat(temp.toFixed(3));
					persistMVData();
					}
				}else{
				persistMVData();
				
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
							/* if(modelNameExist[0].module.project_id == userData[0].baccount_id){ */
								var entryData = {
									name   : modelVersionName,
									description   : "Version "+modelVersionName,
									active   : 1,
									status: 6,
									//bussiness_account_master_id:userData[0].baccount_id,
									project_id:modelNameExist[0].module.project_id,
									module_id:modelNameExist[0].module.id,
									diagram_id:diagramId,
									user_id:userData[0].id
								};
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
										response.end(JSON.stringify(resp));
									}
								});
							/* }else{
								var resp={
									msg:global.errorDescs.errorDesc.desc.ACCESS_NOT_ALLOWED_FOR_DIFFERENT_PROJECT,
									code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
								}
								response.end(JSON.stringify(resp));
							} */
						}else{
							var resp={
								msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_ID,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
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
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}						
}

function getModelVersion(response, data, userData){
global.appLog.debug("inside the modelveriosn.....");

    var versionId = data["versionId"];
    global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, daigramversion) {
		var resp={
            msg:global.errorDescs.errorDesc.desc.SUCCESS,
            code:"200",
            data:daigramversion[0]

        }
       global.appLog.debug("console:"+JSON.stringify(resp));
        response.end(JSON.stringify(resp));

    });


}


function getversionModel(response,data,userData){
	var vId = data["versionId"];
	global.appLog.debug("-------->"+vId);
    global.appConstants.dbConstants.tableObj.modelVersion.find({id:vId},function(err,versionIds){
        var resp={
            msg:global.errorDescs.errorDesc.desc.SUCCESS,
            code:"200",
            data:versionIds

        }
        global.appLog.debug("console:"+JSON.stringify(resp));
        response.end(JSON.stringify(resp));


    });

}

function deleteVersion(response,data,userData){
    var vId = data["versionId"];
    global.appLog.debug("-------->"+vId);
    global.appConstants.dbConstants.tableObj.modelVersion.find({id:vId}).remove(function (err) {
        if(err) {
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else{
			global.db.driver.execQuery('delete from model_requirement where model_id=?', [vId], function (err)  {
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
						data:"Deleted Model Version successfully"
					}
					global.appLog.debug("console:"+JSON.stringify(resp));
					response.end(JSON.stringify(resp));
				}
			});		
		}
	  	
    });

}

function getModelStatusId(response, data, userData) {
	var modelVersionId = data['modelVersionId'];
	global.appConstants.dbConstants.tableObj.modelVersion.find({id:modelVersionId},function (err, modelStatus) {
		if (err) {
			global.errorLog.error(err);
		} else {
			var resp = {
				msg: global.errorDescs.errorDesc.desc.SUCCESS,
				code: "200",
				data: modelStatus
			}
			response.end(JSON.stringify(resp));
		}
	});
}

function getTemplateCols(response, data, userData) {
	var modelVersionId = data['modelVersionId'];
	global.appConstants.dbConstants.tableObj.modelVersion.find({ id: modelVersionId }, function (err, modelversiondata) {
		if (err) {
			global.errorLog.error(err);
		} else {
			var resp = {
				msg: global.errorDescs.errorDesc.desc.SUCCESS,
				code: "200",
				data: modelversiondata[0].project.templateCols
			}
			response.end(JSON.stringify(resp));
		}
	});
}

module.exports.service = {
	getAllModelVersion:getAllModelVersion,
	update:updateVersion,
	create:createModelVersion,
	getModelVersion:getModelVersion,
	getversionModel:getversionModel,
	delete:deleteVersion,
	getModelStatusId:getModelStatusId,
	getTemplateCols:getTemplateCols
};
