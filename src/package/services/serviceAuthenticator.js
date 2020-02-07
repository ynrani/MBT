function serviceAuthenticator(response, data, cb){
	try{
		
		global.appConstants.dbConstants.tableObj.register.find({userID:data.userId}, function(err, signUpData) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else{
					if(signUpData.length == 1){
						global.appConstants.dbConstants.tableObj.buss_account.find({apiKey:data.apiKey,active:orm.eq(1)}, function(err, baccountDetail) {
							if(err){
								global.errorLog.error(err);
								var resp={
									msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
									code:global.errorCodes.errorCode.codes.DB_IO_ERROR
								}
								response.end(JSON.stringify(resp));
							}else if(baccountDetail.length > 0){
								var baccountIds = signUpData[0].baccount_id.split(',');
								var apiKeys = [];
								for(var ap=0;ap<baccountDetail.length;ap++){
								 apiKeys.push((baccountDetail[ap].id).toString());
								}
								var validationResult = global.validateApiKey(apiKeys,baccountIds);
								/* if(baccountIds.indexOf((baccountDetail[0].id).toString()) >= 0){ */
								if(validationResult == true){
									if(signUpData[0].status_id == 1){										
											if(signUpData[0].active == 1){
												cb(signUpData);
											}else{
												var resp={
													msg:global.errorDescs.errorDesc.desc.USR_NOT_ACTIVE,
													code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
												}		
												response.end(JSON.stringify(resp));
											}
										
									}else{
										var resp={
											msg:signUpData[0].status.description,
											code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
										}		
										response.end(JSON.stringify(resp));
									}
								}else{
									var resp={
										msg:global.errorDescs.errorDesc.desc.USR_ACCESS_FAILED,
										code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									}		
									response.end(JSON.stringify(resp));
								}
							}else{
								var resp={
									msg:global.errorDescs.errorDesc.desc.USR_ACCESS_FAILED,
									code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
								}		
								response.end(JSON.stringify(resp));
							}
						});
					}else{
						var resp={
							msg:global.errorDescs.errorDesc.desc.USR_USERID_INCORRECT,
							code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
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


module.exports.serviceAuthenticator = {
	authenticate:serviceAuthenticator
};
