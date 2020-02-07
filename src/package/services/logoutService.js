function logoutService(response, data, userData){
	try{
		/*global.appConstants.dbConstants.tableObj.osList.find({ used_by: userData[0].userID , virt_category_id:[1], isAAS:global.orm.eq(0)}).each(function (osData) {
				delete osData.virt_category;
				osData.used_by = null;
				osData.vm_status = 0;
		}).save(function (err) {
			if(err){
				global.accessLog.error("Problem in clearing assigned OS to current user "+userData[0].userID);
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.USR_UPDATE_FAILED,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));	
			}else{*/
				var resp={
					msg:global.errorDescs.errorDesc.desc.SUCCESS,
					code:"200"
				}
				response.clearCookie('_token');
				response.end(JSON.stringify(resp));	
		/*	}
		});	*/
	}catch(e){
		global.errorLog.error(e);
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}
}

module.exports.logoutService = {
	logout:logoutService
};
