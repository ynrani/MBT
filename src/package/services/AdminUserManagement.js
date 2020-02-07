var uuidv1 = require('uuid/v1');
var uuidv5 = require('uuid/v5');

function getAllRoles(response, mainData,userData){
	try{
		var searchJSON = {};
		if( userData[0].role.name == 'Super Admin'){
			searchJSON = {};
		}else if(userData[0].role.name == 'Admin'){
			searchJSON = {name:global.orm.not_in(['Super Admin', 'Admin'])};
		}
		global.appLog.debug(searchJSON);
		global.appConstants.dbConstants.tableObj.roleList.find(searchJSON, function(err, statusObjtemp) { 
				if(err){
					global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));
			}else{
				var statusObj = statusObjtemp;	
				var resp={
						msg:global.errorDescs.errorDesc.desc.SUCCESS,
						code:"200",
						data:statusObj
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


function getAllUsers(response, mainData, userData){
	var userProjectsMap = {};
	try{
		var projectIds = [];
        if(userData[0].role.name == 'Super Admin'){
		 global.appConstants.dbConstants.tableObj.project.find({}, function(err, allProjects) {
                if(err){
                    global.errorLog.error(err);
                    var resp={
                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                    }
                    response.end(JSON.stringify(resp));
                }else {
				    if(allProjects!=null){
						 for(var i=0;i<allProjects.length;i++){
						      var project=allProjects[i];
							  if(project.createdBy!=null){
								  if(userProjectsMap[project.createdBy]==undefined){
									userProjectsMap[project.createdBy] =[];
									userProjectsMap[project.createdBy].push(project.name);
								  }else{
									userProjectsMap[project.createdBy].push(project.name);
								  }
							  }
						 }
					}
					global.appLog.debug(userProjectsMap);				    
                    global.appConstants.dbConstants.tableObj.register.find({}, function(err, statusObjtemp) {
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else {
							var resp = {
								msg: global.errorDescs.errorDesc.desc.SUCCESS,
								code: "200",
								data: buildUsersReposnse(statusObjtemp)
							}
							global.appLog.debug(JSON.stringify(resp))
							response.end(JSON.stringify(resp));
						}
					},{autoFetch:true});
                }
            });
           
        }else{
            global.appConstants.dbConstants.tableObj.project.find({createdBy:userData[0].userID},function(err,adminProjects) {
                    for (var i = 0; i < adminProjects.length; i++) {
                        projectIds.push(adminProjects[i].id);
                    }
                    global.appConstants.dbConstants.tableObj.userProjects.find({project_id:projectIds}, function(err, userProjects){
                        if(err){
                            global.errorLog.error(err);
                            var resp={
                                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                            }
                            response.end(JSON.stringify(resp));
                        }else{
                            var userIds=[];
                            for (var i = 0; i < userProjects.length; i++) {
                                userIds.push(userProjects[i].user_id);
                            }
                            global.appConstants.dbConstants.tableObj.register.find({id:userIds,role_id:global.orm.not_in([1,2])}, function(err, statusObjtemp) {
                                if(err){
                                    global.errorLog.error(err);
                                    var resp={
                                        msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                        code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                    }
                                    response.end(JSON.stringify(resp));
                                }else {								
                                    var resp = {
                                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                                        code: "200",
                                        data: buildUsersReposnse(statusObjtemp)
                                    }
                                    global.appLog.debug(JSON.stringify(resp))
                                    response.end(JSON.stringify(resp));
                                }
                            },{autoFetch:true});
                        }
                    });
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
    function buildUsersReposnse(userObjs){
	     var userRespObjs=[];
	     for(var i=0;i<userObjs.length;i++){
		    var userObj={};
			userObj.id=userObjs[i].id;
			userObj.userID=userObjs[i].userID;
			userObj.userName=userObjs[i].userName;
			userObj.userEmail=userObjs[i].userEmail;
			userObj.activeEndDate=parseDate(userObjs[i].activeEndDate);
			userObj.activeStartDate=parseDate(userObjs[i].activeStartDate);
			userObj.active=userObjs[i].active;
			userObj.createdBy=userObjs[i].createdBy;
			userObj.baccount=userObjs[i].baccount;
			userObj.role=userObjs[i].role;
			userObj.status=userObjs[i].status;
			userObj.baccount=userObjs[i].baccount;
			var projects=[];
			var projectIds=[];
			var numProjects=userObjs[i].projects.length;
			for(var projIndex=0;projIndex<numProjects;projIndex++){
				var project=userObjs[i].projects[projIndex].project;
				if(project!=undefined){
					projects.push(project.name);
					projectIds.push(project.id);
				}	
			}
			userObj.projects=projects;
			userObj.projectIds=projectIds;
			userRespObjs.push(userObj);
			if(userObjs[i].role.name=='Super Admin' || userObjs[i].role.name=='Admin'){
				userObj.projects=userProjectsMap[userObjs[i].userID];
			}
		 }
		 return userRespObjs;
	}
}

function createNewUser(response, data, userData){
	try{
		global.appLog.debug("createNewUser=============================");	
		var userID = data["uId"];
		var uPass = data["uPass"];
		var uName = data["uName"];
		var uEmail = data["uEmail"];
		var uRole = data["uRole"];
		var status = data["status"];
		
		var bAccounts = data["bAccounts"];
        var projectId = data["projectId"];
        var userIsDemo = parseInt(data["userIsDemo"]);
		var sDateS = data["sDateS"];
		
		var eDateS = data["eDateS"];
		
		var demoUserMaxHrs = parseInt(data["demoUserMaxHrs"]);		
		
		var errorId = "";
		var reason = "";
		
		if(sDateS != ""){
			if(eDateS == ""){
				errorId = "endDate";
				reason = "*required with Start date."
			}else{
				errorId = "";
			}
			}else if(eDateS != ""){
					errorId = "startDate";
					reason = "*required with End Date."
			}else{ 
			if(demoUserMaxHrs > 0){
				errorId = "";
			}else{
				errorId = "isUserDemoAC";
					reason = "*At least one expiry condition is required for demo user."
			}
		}
		
		var msg = '';
		//if(!global.validation.validation.test('empty',userID)) msg = global.errorDescs.errorDesc.desc.USR_USERID_REQUIRED;
		//else if(!global.validation.validation.test('userid',userID)) msg = global.errorDescs.errorDesc.desc.USR_USERID_INCORRECT;
		//else if(!global.validation.validation.test('empty',uName)) msg = global.errorDescs.errorDesc.desc.USR_NAME_REQUIRED;
		//else if(!global.validation.validation.test('longstringwithspaces',uName)) msg = global.errorDescs.errorDesc.desc.USR_NAME_INCORRECT;
		//else if(!global.validation.validation.test('empty',uPass)) msg = global.errorDescs.errorDesc.desc.USR_PASS_REQUIRED;
		//else if(!global.validation.validation.test('password',uPass)) msg = global.errorDescs.errorDesc.desc.USR_PASS_INVALID;
		//else if(!global.validation.validation.test('empty',uEmail)) msg = global.errorDescs.errorDesc.desc.USR_EMAIL_REQUIRED;
		//else if(!global.validation.validation.test('email',uEmail)) msg = global.errorDescs.errorDesc.desc.USR_EMAIL_INCORRECT;
		//else if(!global.validation.validation.test('empty',uRole)) msg = global.errorDescs.errorDesc.desc.USR_ROLE_REQUIRED;
		//else if(uRole == '0') msg = global.errorDescs.errorDesc.desc.USR_ROLE_REQUIRED;
		/*else if((userData[0].role_id == 1) && (userIsDemo == 1) && (errorId != "")) msg = global.errorDescs.errorDesc.desc.DEMO_TRIAL_CONF_ERROR;
		else if((userData[0].role_id == 1) && (bAccounts.length == 0)) msg = global.errorDescs.errorDesc.desc.BUS_AC_ID_REQUIRED;*/
		//else if(!global.validation.validation.test('empty',status)) msg = global.errorDescs.errorDesc.desc.USR_STATUS_REQUIRED;
		//else if(userData[0].role_id != 1 && userData[0].role_id != 2) msg = global.errorDescs.errorDesc.desc.ACCESS_DENIED;
		////else{
		//	msg = '';
		//}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.register.exists({userEmail:uEmail}, function(err, userEmailExists) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(userEmailExists){
					var resp={
						msg:global.errorDescs.errorDesc.desc.USR_EMAIL_ALREADY_EXIST,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
				}else{
					global.appConstants.dbConstants.tableObj.register.exists({userID:userID}, function(err, userUserIDExists) { 
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(userUserIDExists){
							var resp={
								msg:global.errorDescs.errorDesc.desc.USR_ID_ALREADY_EXIST,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
						}else{						
						      var adminExpiryDate=new Date(userData[0].activeEndDate);
							  var userExpiryDate=new Date(eDateS);
							  global.appLog.debug(adminExpiryDate);
							  global.appLog.debug(userExpiryDate);							 
						      if(userExpiryDate>adminExpiryDate){
									var resp={
										msg:global.errorDescs.errorDesc.desc.USR_ENDDATE_EXCEEDED_ADMIN,
										code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									}
									response.end(JSON.stringify(resp));
							  }else if(bAccounts===''){
									global.appConstants.dbConstants.tableObj.buss_account.find({name:'UTO'}, function(err, superAdminAcct) {
										if(err){
											global.errorLog.error(err);
											var resp={
												msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
												code:global.errorCodes.errorCode.codes.DB_IO_ERROR
											}
											response.end(JSON.stringify(resp));
										}else {
											bAccounts = superAdminAcct[0].id;
											createUser(bAccounts);
										}
									});
								}else{
									createUser(bAccounts);
								}
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
		function createUser(bAccounts){
			var entryData = {
				userID   : userID,
				userPass   : global.crypto.security.encrypt(uPass),
				userEmail   : uEmail,
				userName: uName,
				status: status,
				active: status,
				role_id:uRole,
				baccount_id:bAccounts,
				WPass:0,
				language:'en',
				activeStartDate: new Date(sDateS),
				activeEndDate: new Date(eDateS),
				createdBy: userData[0].userID
			};
			global.appConstants.dbConstants.tableObj.register.create([entryData], function (err, items) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else{
					var userId=items[0].id;
					var entryDataArr=[];
					if(projectId!= null && projectId!=''){
						var projectIdArr=projectId.split(',');
						for(var i=0;i<projectIdArr.length;i++){
							var userProjectData = {
								user_id   : userId,
								project_id   : projectIdArr[i]
							};
							entryDataArr.push(userProjectData);
						}
						global.appConstants.dbConstants.tableObj.userProjects.create(entryDataArr, function (err, items) {
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
								}
								response.end(JSON.stringify(resp));
							}
						});
					}else {
						var resp = {
							msg: global.errorDescs.errorDesc.desc.SUCCESS,
							code: "200"
						}
						response.end(JSON.stringify(resp));
					}
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
function updateUser(response, data,userData){
	try{
		global.appLog.debug("Update User=============================");
		var id = data["id"];
		var userID = data["uId"];
		var uPass = data["uPass"];
		var uName = data["uName"];
		var uEmail = data["uEmail"];
		var uRole = data["uRole"];
		var status = data["status"];
		
		var bAccounts = data["bAccounts"];
        var projectId = data["projectId"];
        var userIsDemo = parseInt(data["userIsDemo"]);
		var sDateS = data["sDateS"];
		var eDateS = data["eDateS"];
		var demoUserMaxHrs = parseInt(data["demoUserMaxHrs"]);
		
		var errorId = "";
		var reason = "";
		
		if(sDateS != ""){
			if(eDateS == ""){
				errorId = "endDate";
				reason = "*required with Start date."
			}else{
				errorId = "";
			}
		}else if(eDateS != ""){
				errorId = "startDate";
				reason = "*required with End Date."
		}else{ 
			if(demoUserMaxHrs > 0){
				errorId = "";
			}else{
				errorId = "isUserDemoAC";
					reason = "*At least one expiry condition is required for demo user."
			}
		}
		
		var msg = '';
		var uID=[];
		uID.push(id);
		if(!global.validation.validation.test('empty',userID)) msg = global.errorDescs.errorDesc.desc.USR_USERID_REQUIRED;
		else if(!global.validation.validation.test('userid',userID)) msg = global.errorDescs.errorDesc.desc.USR_USERID_INCORRECT;
		else if(!global.validation.validation.test('empty',uName)) msg = global.errorDescs.errorDesc.desc.USR_NAME_REQUIRED;
		else if(!global.validation.validation.test('longstringwithspaces',uName)) msg = global.errorDescs.errorDesc.desc.USR_NAME_INCORRECT;
		else if(!global.validation.validation.test('empty',uPass)) msg = global.errorDescs.errorDesc.desc.USR_PASS_REQUIRED;
		else if(!global.validation.validation.test('password',uPass)) msg = global.errorDescs.errorDesc.desc.USR_PASS_INVALID;
		else if(!global.validation.validation.test('empty',uEmail)) msg = global.errorDescs.errorDesc.desc.USR_EMAIL_REQUIRED;
		else if(!global.validation.validation.test('email',uEmail)) msg = global.errorDescs.errorDesc.desc.USR_EMAIL_INCORRECT;
		else if(!global.validation.validation.test('empty',uRole)) msg = global.errorDescs.errorDesc.desc.USR_ROLE_REQUIRED;
		else if(uRole == '0') msg = global.errorDescs.errorDesc.desc.USR_ROLE_REQUIRED;
		/*else if((userData[0].role_id == 1) && (userIsDemo == 1) && (errorId != "")) msg = global.errorDescs.errorDesc.desc.DEMO_TRIAL_CONF_ERROR;
		else if((userData[0].role_id == 1) && (bAccounts.length == 0)) msg = global.errorDescs.errorDesc.desc.BUS_AC_ID_REQUIRED;*/
		else if(!global.validation.validation.test('empty',status)) msg = global.errorDescs.errorDesc.desc.USR_STATUS_REQUIRED;
		//else if(userData[0].role_id != 1 && userData[0].role_id != 2) msg = global.errorDescs.errorDesc.desc.ACCESS_DENIED;
		else{
			msg = '';
		}
		if(msg == ''){
			global.appConstants.dbConstants.tableObj.register.exists({id:global.orm.not_in(uID),userEmail:uEmail}, function(err, userEmailExists) { 
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(userEmailExists){
					var resp={
						msg:global.errorDescs.errorDesc.desc.USR_EMAIL_ALREADY_EXIST,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
				}else{
					global.appConstants.dbConstants.tableObj.register.exists({id:global.orm.not_in(uID),userID:userID}, function(err, userUserIDExists) { 
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(userUserIDExists){
							var resp={
								msg:global.errorDescs.errorDesc.desc.USR_ID_ALREADY_EXIST,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
						}else{
							  var adminExpiryDate=new Date(userData[0].activeEndDate);
							  var userExpiryDate=new Date(eDateS);
							  global.appLog.debug(adminExpiryDate);
							  global.appLog.debug(userExpiryDate);							 
						      if(userExpiryDate>adminExpiryDate){
									var resp={
										msg:global.errorDescs.errorDesc.desc.USR_ENDDATE_EXCEEDED_ADMIN,
										code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
									}
									response.end(JSON.stringify(resp));
							  }else if(bAccounts===''){
                                global.appConstants.dbConstants.tableObj.buss_account.find({name:'UTO'}, function(err, superAdminAcct) {
                                    if(err){
                                        global.errorLog.error(err);
                                        var resp={
                                            msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                            code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                                        }
                                        response.end(JSON.stringify(resp));
                                    }else {
                                        bAccounts = superAdminAcct[0].id;
                                        updateUserData(bAccounts);
                                    }
                                });
								}else{
									updateUserData(bAccounts);
								}
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
		function updateUserData(bAccounts){			
			global.appConstants.dbConstants.tableObj.register.find({id:id}, function (err, items) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else{
					var user=items[0];
					user.userID=userID;
					if(uPass!='iauthor'){
						user.userPass=global.crypto.security.encrypt(uPass);
					}
					user.userEmail=uEmail;
					user.userName=uName;
					user.status=status;
					user.active=status;
					user.role_id=uRole;
					user.baccount_id=bAccounts;
					user.activeStartDate=new Date(sDateS);
					user.activeEndDate=new Date(eDateS);
					user.createdBy=userData[0].userID;		
					global.appConstants.dbConstants.tableObj.userProjects.find({user_id:id}).remove(function(err) {
						if(err) {
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else{
							global.appConstants.dbConstants.tableObj.roleList.find({id:user.role_id}, function (err, items) {
							    if(err) {
									global.errorLog.error(err);
									var resp={
										msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
										code:global.errorCodes.errorCode.codes.DB_IO_ERROR
									}
									response.end(JSON.stringify(resp));
								}else{
									user.role=items[0];
								    global.appConstants.dbConstants.tableObj.buss_account.find({id:user.baccount_id}, function (err, items) {
										if(err) {
											global.errorLog.error(err);
											var resp={
												msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
												code:global.errorCodes.errorCode.codes.DB_IO_ERROR
											}
										response.end(JSON.stringify(resp));
										}else{
											user.baccount=items[0];
											global.appConstants.dbConstants.tableObj.status.find({id:user.status}, function (err, items) {
												if(err) {
													global.errorLog.error(err);
													var resp={
														msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
														code:global.errorCodes.errorCode.codes.DB_IO_ERROR
													}
													response.end(JSON.stringify(resp));
												}else{
														user.status=items[0];
														user.save(function(err){
														if(err){
															global.errorLog.error(err);
															var resp={
																msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
																code:global.errorCodes.errorCode.codes.DB_IO_ERROR
															}
															response.end(JSON.stringify(resp));
														}else{
															if(projectId!= null && projectId!=''){
																var entryDataArr=[];
																var projectIdArr=projectId.split(',');
																for(var i=0;i<projectIdArr.length;i++){
																	var userProjectData = {
																		user_id:id,
																		project_id   : projectIdArr[i]
																	};
																	entryDataArr.push(userProjectData);
																}
																global.appConstants.dbConstants.tableObj.userProjects.create(entryDataArr, function (err, projects) {
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
																			data:"updated user successfully"
																		}
																		response.end(JSON.stringify(resp));
																	}
																});
															}else {
																var resp = {
																	msg: global.errorDescs.errorDesc.desc.SUCCESS,
																	code: "200",
																	data:"updated user successfully"
																}
																response.end(JSON.stringify(resp));
															}
														}
													});
												}
											});											
										}
									});
								}
							});							
						}
					});
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


function updateRole(response, data, userData){

    var empId  =  data["emp_id"];
    var role =  data["new_role"];
    global.appLog.debug("<empId>"+empId);
    global.appLog.debug("<role>"+role);
    global.appConstants.dbConstants.tableObj.register.find({userID:empId}, function(err, userObj){
    	global.appLog.debug("---->"+userObj.length);



        if(userObj.length > 0){
            delete userObj[0].role;
            userObj[0].role_id=role;
            userObj[0].save(function(err){
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
        		msg:global.errorDescs.errorDesc.desc.USAERNAME_NOT_EXIST,
                code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
			}
            response.end(JSON.stringify(resp));
		}


    });
}

function getAllBusinessAccounts(response, data, userData) {
    try {
        var searchJSON = {active: 1};
        if( userData[0].role.name != 'Super Admin') {
            if (data.actIds != null && data.actIds.length > 0) {
                searchJSON = {active: 1, id: []};
                searchJSON.id = data.actIds;
            }
        }else{
            searchJSON = {name: global.orm.not_in(['UTO']) };
        }
        global.appConstants.dbConstants.tableObj.buss_account.find(searchJSON, function (err, statusObjtemp) {
            if (err) {
                global.errorLog.error(err);
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            } else {
                var statusObj = statusObjtemp;
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: statusObj
                }
                response.end(JSON.stringify(resp));
            }
        });
    } catch (e) {
        global.errorLog.error(e);
        var resp = {
            msg: global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code: global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}

function createBusinessAccount(response, data, userData){
        try{
            var name = data["name"];
            var location= data["location"];
            var desc= data["desc"];
			var isActive= data["isActive"];
			global.appConstants.dbConstants.tableObj.buss_account.exists({name:name}, function(err, bussAcctExist) {
				if(err){
					global.errorLog.error(err);
					var resp={
						msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
						code:global.errorCodes.errorCode.codes.DB_IO_ERROR
					}
					response.end(JSON.stringify(resp));
				}else if(bussAcctExist){
					var resp={
						msg:global.errorDescs.errorDesc.desc.DUPLICATE_ACCOUNT,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
				}else {
                    var entryData = {
                        name: name,
                        description: desc,
                        location: location,
                        apiKey: uuidv5(name, uuidv1()),
                        active: isActive
                    };
                    global.appConstants.dbConstants.tableObj.buss_account.create([entryData], function (err, items) {
                        if (err) {
                            global.errorLog.error(err);
                            var resp = {
                                msg: global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                                code: global.errorCodes.errorCode.codes.DB_IO_ERROR
                            }
                            response.end(JSON.stringify(resp));
                        } else {
                            var resp = {
                                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                                code: "200",
                                data: items
                            }
                            response.end(JSON.stringify(resp));
                        }
                    });
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
function updateBusinessAccount(response, data, userData){
	var id = data["id"];
	var name = data["name"];
	var location= data["location"];
	var desc= data["desc"];
	var isActive= data["isActive"];
	global.appConstants.dbConstants.tableObj.buss_account.find({id:id}, function(err, bussAcctExist) {
		global.appLog.debug("bussAcctExist"+bussAcctExist.length);
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else if(bussAcctExist.length==1){
            bussAcctExist[0].id=id,
            bussAcctExist[0].name=name,
            bussAcctExist[0].location=location,
            bussAcctExist[0].description=desc,
            bussAcctExist[0].active=isActive,
            bussAcctExist[0].save(function(err){
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
                        data:"1"
                    }
                    response.end(JSON.stringify(resp));
                }
            });
              
		}    
    });
}
function deleteUser(response, data, userData){
    try{
        var delUserId = data["delUserId"];
        global.appConstants.dbConstants.tableObj.register.find({id:delUserId}).remove(function(err) {
            if(err) {
                global.errorLog.error(err);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else{
				global.appConstants.dbConstants.tableObj.userProjects.find({user_id:delUserId}).remove(function(err) {
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
							data:"Deleted user successfully"
						}
						global.appLog.debug("console:"+JSON.stringify(resp));
						response.end(JSON.stringify(resp));
					}				
				});              
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

function parseDate(date){
	var year =date.getFullYear()+'';
	var month=date.getMonth()+1+'';
	var date=date.getDate()+'';
	if(month.length<2){
		month='0'+month;
	}
	if(date.length<2){
		date='0'+date;
	}
	return year+"-"+month+"-"+date;
}

module.exports.adminUserManagement = {
	getAllRoles:getAllRoles,
	getAllUsers:getAllUsers,
	createNew:createNewUser,
	updateUser:updateUser,
	updateRole:updateRole,
    getAllAccounts:getAllBusinessAccounts,
    createAccount:createBusinessAccount,
    updateAccount:updateBusinessAccount,
    deleteUser: deleteUser	
};
