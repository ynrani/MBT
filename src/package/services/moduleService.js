function createModule(response, data, userData){
	try{
		var moduleName = data["name"];
		var projectId = data["projectId"];
		var msg = '';
		if(!global.validation.validation.test('empty',moduleName)) msg = global.errorDescs.errorDesc.desc.MODULE_NAME_REQUIRED;
		else if(!global.validation.validation.test('empty',projectId)) msg = global.errorDescs.errorDesc.desc.PROJECT_ID_REQUIRED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.project.exists({id:projectId}, function(err, projectIDExist) { 
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
					global.appConstants.dbConstants.tableObj.module.exists({project_id:projectId,name:moduleName}, function(err, ModuleNameExist) { 
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(ModuleNameExist){
							var resp={
								msg:global.errorDescs.errorDesc.desc.DUPLICATE_MODULE,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
						}else{
							var entryData = {
								name   : moduleName,
								description   : moduleName,
								active   : 1,
								project_id: projectId
							};
							global.appConstants.dbConstants.tableObj.module.create([entryData], function (err, items) {
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

function deleteModule(response,data,userData){
    var mId = data["modId"];
    global.appLog.debug("-------->"+mId);
    global.appConstants.dbConstants.tableObj.module.find({id:mId}).remove(function (err) {
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
                data:"Deleted module successfully"
            }
            global.appLog.debug("consile:"+JSON.stringify(resp));
            response.end(JSON.stringify(resp));
        }
    });
}

						
module.exports.service = {
	create:createModule,
	delete:deleteModule
};
