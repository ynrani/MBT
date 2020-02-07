function logAuditData(inputData){
	try{
		global.appConstants.dbConstants.tableObj.auditLog.create([
		{
			userID   : inputData["user_id"],
			service_cd   : inputData["svc_cd"],
			service_desc   : inputData["svc_desc"],
			status_cd	: inputData["sts_cd"],			
			status_desc		:inputData["sts_desc"],
			access_time   : inputData["time"],			
			client_IP:inputData["client_ip"]			
			}
		], function (err, items) {
			if(err){
				global.errorLog.error(err);
			}else{
				global.appLog.debug('Successfully logged audit data');
			}
	});
	}catch(err){
		global.errorLog.error('Error occured while logging audit data');
		global.errorLog.error(err);
	}						
}

module.exports.service = {
	logData:logAuditData	
};
