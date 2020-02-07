function createModel(response, data, userData){
	try{
		var modelName = data["name"];
		var moduleId = data["moduleId"];
		var msg = '';
		if(!global.validation.validation.test('empty',modelName)) msg = global.errorDescs.errorDesc.desc.MODEL_NAME_REQUIRED;
		else if(!global.validation.validation.test('empty',moduleId)) msg = global.errorDescs.errorDesc.desc.INVALID_MODULE_ID;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.module.find({id:moduleId}, function(err, moduleObj) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(moduleObj.length <= 0){
					var resp={
						msg:global.errorDescs.errorDesc.desc.INVALID_MODULE_ID,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
				}else{
					global.appConstants.dbConstants.tableObj.project.exists({id:moduleObj[0].project_id}, function(err, projectIDExist) { 
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(!projectIDExist){
							var resp={
								msg:global.errorDescs.errorDesc.desc.INVALID_PROJECT_ID,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
						}else{
							global.appConstants.dbConstants.tableObj.diagram.exists({module_id:moduleId,name:modelName}, function(err, modelNameExist) { 
								if(err){
									global.errorLog.error(err);
									var resp={
										msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
										code:global.errorCodes.errorCode.codes.DB_IO_ERROR
									}
									response.end(JSON.stringify(resp));
								}else if(modelNameExist){
									var resp={
										msg:global.errorDescs.errorDesc.desc.DUPLICATE_MODEL,
										code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									}
									response.end(JSON.stringify(resp));
								}else{
									var entryData = {
										name   : modelName,
										description   : modelName,
										active   : 1,
										module_id: moduleId
									};
									global.appConstants.dbConstants.tableObj.diagram.create([entryData], function (err, items) {
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


function deleteModel(response,data,userData){
    var diagId = data["diagId"];
    global.appLog.debug("-------->"+diagId);
    global.appConstants.dbConstants.tableObj.diagram.find({id:diagId}).remove(function (err) {
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
                data:"Deleted Module successfully"
            }
            global.appLog.debug("consile:"+JSON.stringify(resp));
            response.end(JSON.stringify(resp));
        }
    });
}


module.exports.service = {
	create:createModel,
	delete:deleteModel
};
