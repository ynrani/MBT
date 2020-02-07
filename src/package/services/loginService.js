function signIn(response, data,exists){
	try{
		var userID = data["sin_usrN"];
		var userPass = global.crypto.security.encrypt(data["sin_usrP"]);
		
		var msg = '';
		if(!global.validation.validation.test('empty',userID)) msg = global.errorDescs.errorDesc.desc.USR_USERID_REQUIRED;
		else if(!global.validation.validation.test('empty',userPass)) msg = global.errorDescs.errorDesc.desc.USR_PASS_REQUIRED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.register.find({userID:userID}, function(err, signUpData) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else{					
					if(signUpData.length == 1){
						if(signUpData[0].status_id == 1){
							if(signUpData[0].userPass == userPass){
								if(signUpData[0].active == 1){
									if(signUpData[0].activeStartDate != null && signUpData[0].activeEndDate != null){
										var currentTime = global.getCurrDate('datetime');
											if(((new Date(currentTime)) > (new Date(signUpData[0].activeStartDate))) && ((new Date(currentTime)) < (new Date(signUpData[0].activeEndDate)))){
												global.appLog.debug("User is in active date range");
												/* checkMaxHours(true); */
												continueWithAuthenticatedUser();
											}else{
											//need to clear all the reserved instance from this user
												var msgKey='';
												if(signUpData[0].isDemoUser == true) {
													msgKey=global.errorDescs.errorDesc.desc.DEMO_TRIAL_EXPIRED;
												}else {
													msgKey=global.errorDescs.errorDesc.desc.ACCOUNT_EXPIRED;
												}
												var resp={
														msg:msgKey,
														code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
													}
													response.end(JSON.stringify(resp));
												}
									}else{
										/* checkMaxHours(false); */
										continueWithAuthenticatedUser();
									}
									
									function continueWithAuthenticatedUser(){
										var authentication = true;
										var uid = signUpData[0].userID;
										var uNm = signUpData[0].userName;
										var rID = signUpData[0].role_id;
										var roleName = signUpData[0].role.name;
										var emailId = signUpData[0].userEmail;
										var bActIds= signUpData[0].baccount_id;
										signUpData[0].WPass = 0;
										var apiKey = signUpData[0].baccount.apiKey;
										signUpData[0].save(function(err){
											if(err){
												global.accessLog.error("Error in updating user details in login" );
												global.errorLog.error(err);
												var resp={
													msg:global.errorDescs.errorDesc.desc.USR_UPDATE_FAILED,
													code:global.errorCodes.errorCode.codes.DB_IO_ERROR
												}
												response.end(JSON.stringify(resp));	
											}else{
												global.appLog.debug("Created cookie now");
												response.clearCookie('_token');
												response.cookie('_token',signUpData[0].userID+";"+Date.now(), { signed: true ,expires: new Date(Date.now() + 1000*60*30)});
												var respData = {
													authentication:authentication,
													userID:uid,
													userName:uNm,
													role_id:rID,
													roleName:roleName,
													emailId:emailId,
													bActIds:bActIds,
													apiKey:apiKey
												}
												var resp={
													msg:global.errorDescs.errorDesc.desc.SUCCESS,
													code:"200",
													data:respData
												}
												response.end(JSON.stringify(resp));	
											}
										});
									}
								}else{
									var resp={
										msg:global.errorDescs.errorDesc.desc.USR_NOT_ACTIVE,
										code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									}		
									response.end(JSON.stringify(resp));
								}
							}else{
								if(signUpData[0].WPass < 5){
									signUpData[0].WPass += 1;
									if(signUpData[0].WPass == 5){
										delete signUpData[0].status;
										signUpData[0].status_id = 2; //user account will be locked here
										signUpData[0].active = 2;
									}
									signUpData[0].save(function(err){
										if(err){
											global.accessLog.error("Error in updating user details in login" );
											global.errorLog.error(err);
											var resp={
												msg:global.errorDescs.errorDesc.desc.USR_UPDATE_FAILED,
												code:global.errorCodes.errorCode.codes.DB_IO_ERROR
											}
											response.end(JSON.stringify(resp));	
										}else{
											authentication = false;
											uid = '';
											response.clearCookie('_token');
											global.appLog.info("Authentication failed for user : "+userID);
											var respData = {
												authentication:authentication,
												userID:uid,
												userName:'',
												role_id:'',
											}
											if(signUpData[0].WPass < 5){
												var resp={
													msg:global.errorDescs.errorDesc.desc.USR_PASS_INCORRECT[0]+(global.appConstants.dbConstants.tableObj.AllowedWrongAttempts-signUpData[0].WPass)+global.errorDescs.errorDesc.desc.USR_PASS_INCORRECT[1],
													code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE,
													data:respData
												}
												response.end(JSON.stringify(resp));
											}else{
												var resp={
													msg:global.errorDescs.errorDesc.desc.USR_ACCOUNT_LOCKED,
													code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE,
													data:respData
												}
												response.end(JSON.stringify(resp));
											}
										}
									});		
								}else{
									var resp={
										msg:global.errorDescs.errorDesc.desc.USR_ACCOUNT_LOCKED,
										code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									}		
									response.end(JSON.stringify(resp));
								}
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
							msg:global.errorDescs.errorDesc.desc.USR_USERID_INCORRECT,
							code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
						}
						response.end(JSON.stringify(resp));
					}
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



function serviceSignIn(response, data){
signIn(response, data, false);
}
function serviceRefreshSignIn(response, data){
signIn(response, data, true);
}
module.exports.login = {
	signIn:serviceSignIn,
	refresh:serviceRefreshSignIn
};
