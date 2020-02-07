function getAllBusinessAccounts(response, data, userData){

if(userData[0].role_id == 1){
global.appConstants.dbConstants.tableObj.buss_account.find({}, function(err, statusObjtemp) { 
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
							data:statusObjtemp
						}
						response.end(JSON.stringify(resp));
				}

});
}else{
var resp={
								msg:global.errorDescs.errorDesc.desc.ACCESS_DENIED,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));

}
}

function addBusinessAccount(response, data, userData){
	try{
		var name = data["name"];
		var desc = data["desc"];
		var location = data["location"];
		var active = data["active"];
		var msg = '';
		if(!global.validation.validation.test('empty',name)) msg = global.errorDescs.errorDesc.desc.BUS_AC_NAME_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',name)) msg = global.errorDescs.errorDesc.desc.BUS_AC_NAME_INCORRECT;
		else if(!global.validation.validation.test('empty',desc)) msg = global.errorDescs.errorDesc.desc.BUS_AC_DESC_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',desc)) msg = global.errorDescs.errorDesc.desc.BUS_AC_DESC_INCORRECT;
		else if(!global.validation.validation.test('empty',location)) msg = global.errorDescs.errorDesc.desc.BUS_AC_LOCATION_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',location)) msg = global.errorDescs.errorDesc.desc.BUS_AC_LOCATION_INCORRECT;
		else if(!global.validation.validation.test('empty',active)) msg = global.errorDescs.errorDesc.desc.BUS_AC_STATUS_REQUIRED;
		else if(userData[0].role_id != 1) msg = global.errorDescs.errorDesc.desc.ACCESS_DENIED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.buss_account.exists({name:name}, function(err, BAExists) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(BAExists){
					var resp={
						msg:global.errorDescs.errorDesc.desc.BUS_AC_EXISTS,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
				}else{
					global.appConstants.dbConstants.tableObj.buss_account.create([
						{
						name   : name,
						description   : desc,
						location   : location,
						active: active,
						/* apiKey:generateUUID(); */
						apiKey:"8fe65a3c-98dc-4788-be10-59729bfa1e1e"
						}
					], function (err, items) {
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


function updateOldBusinessAccount(response, data, userData){
	try{
		var name = data["name"];
		var desc = data["desc"];
		var location = data["location"];
		var active = data["active"];
		var baId = data["baId"];
		var msg = '';
		if(!global.validation.validation.test('empty',name)) msg = global.errorDescs.errorDesc.desc.BUS_AC_NAME_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',name)) msg = global.errorDescs.errorDesc.desc.BUS_AC_NAME_INCORRECT;
		else if(!global.validation.validation.test('empty',desc)) msg = global.errorDescs.errorDesc.desc.BUS_AC_DESC_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',desc)) msg = global.errorDescs.errorDesc.desc.BUS_AC_DESC_INCORRECT;
		else if(!global.validation.validation.test('empty',location)) msg = global.errorDescs.errorDesc.desc.BUS_AC_LOCATION_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',location)) msg = global.errorDescs.errorDesc.desc.BUS_AC_LOCATION_INCORRECT;
		else if(!global.validation.validation.test('empty',active)) msg = global.errorDescs.errorDesc.desc.BUS_AC_STATUS_REQUIRED;
		else if(userData[0].role_id != 1) msg = global.errorDescs.errorDesc.desc.ACCESS_DENIED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appLog.debug(baId);
			global.appConstants.dbConstants.tableObj.buss_account.find({id:parseInt(baId)}, function(err, BAObj) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(BAObj.length == 1){
					BAObj[0].description = desc;
					BAObj[0].location = location;
					BAObj[0].active = active;
					BAObj[0].save(function(err){
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
						msg:global.errorDescs.errorDesc.desc.BUS_AC_NOT_FOUND,
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

function generateUUID()
{
    var d = new Date().getTime();
    
    if( window.performance && typeof window.performance.now === "function" )
    {
        d += performance.now();
    }
    
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
    {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });

return uuid;
}

module.exports.BusinessAccountService = {
	getAllBusinessAccounts:getAllBusinessAccounts,
	addBusinessAccount:addBusinessAccount,
	updateOldBusinessAccount:updateOldBusinessAccount
};
