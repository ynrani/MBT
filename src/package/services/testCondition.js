var HashMap = require('hashmap');
var ArrayList = require('arraylist');
//var YAML= require('json2yaml')
var YAML= require('./yamlUtil.js')
var streamBuffers = require('stream-buffers');
var appConstants = require("../constants/constants.js");
var fs = require('fs');
var AdmZip = require('adm-zip');

function testConditionCreate(response, data, userData){
	try{
		var testsSteps=data.teststep;
        var entryData  =  new Array();
        var nodeForDelOldRec="";
		var versionForDelOldRec="";

        for(var index=0;index<testsSteps.length;index++){
            entryData.push({
				test_step_number   : testsSteps[index].testStepNo,
				action   : testsSteps[index].action,
				target_type   : testsSteps[index].targetType,
				target   : testsSteps[index].testCondTarget,
				tst_step_data   : testsSteps[index].testCondStepData,
				description : testsSteps[index].testDescription,
				node_id : testsSteps[index].nodeid,				
				version_id : testsSteps[index].testCondVersion_id,
				tool_id: testsSteps[index].tool_id,
				tst_step_args: testsSteps[index].tst_step_args
            });
			nodeForDelOldRec=testsSteps[index].nodeid;
			versionForDelOldRec = testsSteps[index].testCondVersion_id;
        }
        global.appLog.debug(entryData);
		persistMVData();

		function persistMVData(){
			global.appConstants.dbConstants.tableObj.testCondition.create(entryData, function (err, items) {								
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
	}catch(e){
		global.errorLog.error(e);
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}						
}

function testConditionRemove(response, data, userData){
	try{
		var testsStepId=data.stepId;
		global.appLog.debug(data);
		var entryData  =  new Array();
		for(var index=0;index<testsStepId.length;index++){
		entryData.push(testsStepId[index].checkStepId);
        }
        global.appLog.debug(entryData);
		persistMVData();	
		function persistMVData(){
			global.appConstants.dbConstants.tableObj.testCondition.find({id: entryData}).remove(function(err) {							
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
						data:"Deleted successfully"
					}
					response.end(JSON.stringify(resp));
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



function getAllTestCondition(response, data, userDetails){
    try{
		if(data.tool_id==undefined || data.tool_id==''){
			data.tool_id=null;
		}
		var findInput={node_id:data.n,version_id:data.testCondVersion_id,tool_id:data.tool_id};	
		if(data.actTyp !=undefined) findInput["test_step_type"]=data.actTyp;
		global.appConstants.dbConstants.tableObj.testCondition.find(findInput, function(err, models) {
			if(err){
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));
			}else if(models.length > -1){
				var resp={
					msg:global.errorDescs.errorDesc.desc.SUCCESS,
					code:'200',
					data:{testData:models}					
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

    }catch(e){
        global.errorLog.error(e);
        var resp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}


function deleteTestConditions(response, data, userDetails){
    try{
        var vId = data["versionId"];
        global.appConstants.dbConstants.tableObj.testCondition.find({version_id:vId}).remove(function(err) {
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


function updateTestConditions(response, data, userData){
	try{
		var testsSteps=data.teststep;
        var entryData  =  new Array();
		var entryDataId  =  new Array();
        var nodeForDelOldRec="";
		var versionForDelOldRec="";
		var versionId='';
		for(var index=0;index<testsSteps.length;index++){
			entryDataId.push(testsSteps[index].testStepId);
        }
        for(var index=0;index<testsSteps.length;index++){
			 entryData.push({
				id   : testsSteps[index].testStepId,
				test_step_number   : testsSteps[index].testStepNo,
				action   : testsSteps[index].action,
				target_type   : testsSteps[index].targetType,
				target   : testsSteps[index].testCondTarget,
				tst_step_data   : testsSteps[index].testCondStepData,
				description : testsSteps[index].testDescription,
				node_id : testsSteps[index].nodeid,				
				version_id : testsSteps[index].testCondVersion_id
			});
			versionId=testsSteps[index].testCondVersion_id;
		}
		global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, modelVersionObj) {
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
						msg:global.errorDescs.errorDesc.desc.CANNOT_UPDATE_TEST_CONDITIONS_PUBLISHED_MODEL_VERSION,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
				}else{
					//db update
					global.appConstants.dbConstants.tableObj.testCondition.find({id:entryDataId}, function(err, testStepObj) {
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(testStepObj.length > 0){
							for(var i=0;i<testsSteps.length;i++){
								testStepObj[i].test_step_number=entryData[i].test_step_number,
								testStepObj[i].action=entryData[i].action,
								testStepObj[i].target_type=entryData[i].target_type,
								testStepObj[i].target=entryData[i].target,
								testStepObj[i].tst_step_data=entryData[i].tst_step_data,
								testStepObj[i].description=entryData[i].description,
								testStepObj[i].node_id=entryData[i].node_id,
								testStepObj[i].version_id=entryData[i].version_id,
								testStepObj[i].save(function(err){									
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
						}else{
							var resp={
								msg:global.errorDescs.errorDesc.desc.INVALID_SCENARIO_ID,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));
						}
					});
				}
			}else{
					var resp={
						msg:global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID,
						code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
					}
					response.end(JSON.stringify(resp));
			}
		});
        //global.appLog.debug(entryData);		
	}catch(e){
		global.errorLog.error(e);
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}						
}

function getAllTestComponentData(response, data, userData){

    try{
        global.appConstants.dbConstants.tableObj.testCondition.find({node_id:data.n,version_id:data.testCondVersion_id}, function(err, models) {
            if(err){
                global.errorLog.error(err);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else if(models.length > -1){
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

    }catch(e){
        global.errorLog.error(e);
        var resp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }

}

function getStepMasterData(response, data, userData){
    var selectedVersion=data.versionId;
	var selected_scenarios_Ids = data.indexId;
	var arr = [] ;
    var node_desc_json={};
    var scmaster_data;
    global.db.driver.execQuery('select ts.test_step_number,ts.description,ts.node_id from test_step_master ts where  ts.version_id=?',[selectedVersion],function(err,testdata) {
        if (err) {
            global.errorLog.error(err);
        }
        else
		{
			for(var i =0;i < testdata.length;i++)
            {
              var nodeid =   testdata[i].node_id;
              var testdes =  testdata[i].description;
              createnodedescmap(nodeid,testdes);
			}
        }

        function createnodedescmap(nodeid,description)
        {
            createjsonmap(nodeid,description);
        }

        function put(nodekey,descArr)
        {
            node_desc_json[nodekey]=descArr;
        }

		function get(nodekey){
        	if(node_desc_json[nodekey]==undefined)
        	{
                node_desc_json[nodekey]=[];
			}
			return  node_desc_json[nodekey];
		}

		function createjsonmap(nodeid,description)
		{
            var des=get(nodeid);
            des.push(description);
            put(nodeid,des);
		}

        var resp = {
			msg: global.errorDescs.errorDesc.desc.SUCCESS,
			code: "200",
			data:node_desc_json,
			}
		response.end(JSON.stringify(resp));
       
    });


}

function getstepdatadescription(response, data, userData){
	var versionid=data["versionId"];
	var nodeDescriptionmap={};
	global.db.driver.execQuery('select ts.test_step_number,ts.description,ts.node_id from test_step_master ts where  ts.version_id=?',[versionid],function(err,testdata) {
        if (err) {
            global.errorLog.error(err);
        }
        else
		{
			for(var i =0;i < testdata.length;i++)
            {
              var nodeid =   testdata[i].node_id;
              var testdes =  testdata[i].description;
              createnodedescmap(nodeid,testdes);
			}
			var resp = {
				msg: global.errorDescs.errorDesc.desc.SUCCESS,
				code: "200",
				data:nodeDescriptionmap,
			}
			response.end(JSON.stringify(resp));
        }

        function createnodedescmap(nodeid,description)
        {
            createjsonmap(nodeid,description);
        }

        function put(nodekey,descArr)
        {
            nodeDescriptionmap[nodekey]=descArr;
        }

		function get(nodekey){
        	if(nodeDescriptionmap[nodekey]==undefined)
        	{
                nodeDescriptionmap[nodekey]=[];
			}
			return  nodeDescriptionmap[nodekey];
		}

		function createjsonmap(nodeid,description)
		{
            var des=get(nodeid);
            des.push(description);
            put(nodeid,des);
		}

	});

}

function copyTestSteps(response, data, userData){
	var vId=data["vId"];
	var nodeId=data["n"];
	var copyNodeId=data["cn"];
	var parentVId=data["pVId"];
	global.db.driver.execQuery('insert into test_step_master (SELECT 0,test_step_number, action,target_type, target, tst_step_data, description,?,?,tool_id,tst_step_args,test_step_type FROM test_step_master where version_id = ? and node_id=?)',[copyNodeId,vId,parentVId,nodeId], function(err, models){
			if(err){
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));	
			}
			else{
				var entryDataNewRec  =  new Array();
				var entryDataOldVers  =  new Array();
				var entryDataNewVers  =  new Array();		
				var testDataMap = new HashMap();				
				global.appConstants.dbConstants.tableObj.testCondition.find({node_id: nodeId}, function(err, oldStepId) {
					if(err) {
						global.errorLog.error(err);
						var resp={
							msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						}
						response.end(JSON.stringify(resp));
					}
					else if(oldStepId.length > 0){
						for(var i=0;i<oldStepId.length;i++){
							entryDataOldVers.push(oldStepId[i].id);
						}
						global.appConstants.dbConstants.tableObj.testCondition.find({node_id: copyNodeId}, function(err, newStepId) {
							if(err){
								global.errorLog.error(err);
								var resp={
									msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
									code:global.errorCodes.errorCode.codes.DB_IO_ERROR
								}
								response.end(JSON.stringify(resp));
							}
							else if(newStepId.length > 0){
								for(var i=0;i<newStepId.length;i++){
									entryDataNewVers.push(newStepId[i].id);
								}
								for(var index=0;index<entryDataOldVers.length;index++){
									var oldId = entryDataOldVers[index];
									var newId = entryDataNewVers[index];
									testDataMap.set(oldId, newId);
								}
								global.appConstants.dbConstants.tableObj.testData.find({test_step_id: entryDataOldVers}, function(err, stepDataRet){
									if(err){
										global.errorLog.error(err);
										var resp={
											msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
											code:global.errorCodes.errorCode.codes.DB_IO_ERROR
										}
										response.end(JSON.stringify(resp));
									}else if(stepDataRet.length>0){
										for(var j=0;j<stepDataRet.length;j++){
											var oldStepId = stepDataRet[j].test_step_id;
											var stepData=stepDataRet[j].step_data;
											var testStepId = testDataMap.get(oldStepId);
											if(testStepId!=null && stepData!=null){
												entryDataNewRec.push({
													step_data	   : stepData,
													test_step_id   : testStepId
												});
											}											
										}
										global.appConstants.dbConstants.tableObj.testData.create(entryDataNewRec, function (err, items){				
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
													code:'200',
													data:"Test step data has been copied"
												}
												global.appLog.debug("Test step data has been copied");
												response.end(JSON.stringify(resp));
											}
										});
									}else{
										var resp={
											msg:global.errorDescs.errorDesc.desc.SUCCESS,
											code:'200',
											data:"Test step data has been copied"
										}
										global.appLog.debug("Test step data has been copied");
										response.end(JSON.stringify(resp));
								}
								});
							}else{
								var resp={
									msg:global.errorDescs.errorDesc.desc.SUCCESS,
									code:'200',
									data:"Test step data has been copied"
								}
								global.appLog.debug("Test step data has been copied");
								response.end(JSON.stringify(resp));
							}
						});
					}else{
						var resp={
							msg:global.errorDescs.errorDesc.desc.SUCCESS,
							code:'200',
							data:"Test step data has been copied"
						}
						global.appLog.debug("Test step data has been copied");
						response.end(JSON.stringify(resp));
					}
				});
			}
		});
}


function getToolData(response, data, userData){
	var vId=data["vId"];
	var toolQuery='select id,name,(select tst_step_tool_typ from project p where p.id=(select project_id from model_version where id=?)) as type from tool where id=(select tst_step_tool_id from project p where p.id=(select project_id from model_version where id=?))';
	global.db.driver.execQuery(toolQuery, [vId,vId], function(err, toolObject) {
		if(err){
			global.errorLog.error(err);
			var resp={
				msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
				code:global.errorCodes.errorCode.codes.DB_IO_ERROR
			}
			response.end(JSON.stringify(resp));
		}else{	
			var toolName='CafeNext';
			var toolId=	null;
			var toolTyp='';	
			if(toolObject.length>0){
				toolName=toolObject[0].name;
				toolId=toolObject[0].id;
				toolTyp=toolObject[0].type;
			}
			var resp={
				msg:global.errorDescs.errorDesc.desc.SUCCESS,
				code:'200',
				data:{toolName:toolName,toolId:toolId,toolTyp:toolTyp}					
			}
			response.end(JSON.stringify(resp));
		}
	});
}

function generateYaml(response, data, userData){
	//var findInput={node_id:data.n,version_id:data.testCondVersion_id,tool_id:data.tool_id};	
	try{
		var projectName='';
		var diagramName='';
		var versionName='';
		var templateDir='';
		var testDir='';
		var testParentDir='';
		var testFolderName='';
		var importDir=appConstants.import.importDir;
		var parentDir = importDir+userData[0].userID+'\\';
		var toolQuery='SELECT tst_step_tool_id FROM project where id=(select project_id from model_version where id=?)';
		var scenarioCount=0;
		var zip = new AdmZip();
		global.db.driver.execQuery(toolQuery, [data.versionid], function(err, toolObject) {
			if(err){
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));
			}else{
				toolId=toolObject[0].tst_step_tool_id;	
				for(var index=0;index<data.selectedscenarioids.length;index++){
					var input={model_version_id:data.versionid, scenario_index:data.selectedscenarioids[index]};//[1,3]};					
					global.appConstants.dbConstants.tableObj.scenarioMaster.find(input, function(err, scenarioObj) {
						if(err){
							global.errorLog.error(err);
							var resp={
								msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
								code:global.errorCodes.errorCode.codes.DB_IO_ERROR
							}
							response.end(JSON.stringify(resp));
						}else if(scenarioObj.length > 0){
								var pathSplit=scenarioObj[0].path.split(",");
								projectName=scenarioObj[0].model_version.project.name;
								diagramName=scenarioObj[0].model_version.diagram.name;
								versionName=scenarioObj[0].model_version.name;
								testFolderName=projectName+'-'+diagramName+'-'+versionName;
								testParentDir=parentDir+testFolderName+'\\';
								templateDir=testParentDir+'templates'+'\\';
								testDir=testParentDir+'tests'+'\\';
								removeDirectory(testParentDir);
								if (!fs.existsSync(parentDir)) {
									fs.mkdirSync(parentDir);
								}
								if (!fs.existsSync(testParentDir)) {
									fs.mkdirSync(testParentDir);
								}
								if (!fs.existsSync(templateDir)) {
									fs.mkdirSync(templateDir);
								}
								if (!fs.existsSync(testDir)) {
									fs.mkdirSync(testDir);							
								}	
								var nodeIDs=[];
								for(var pathIndex=0;pathIndex<pathSplit.length;pathIndex++){
									if(pathSplit[pathIndex]!=null && pathSplit[pathIndex]!=''){
										nodeIDs.push(pathSplit[pathIndex]);
									}
								}	
								if(nodeIDs.length > 0){
									var fileName="TC-Scenario"+scenarioObj[0].scenario_index+".YAML";
									var sceName=scenarioObj[0].name;								
									var findInput={version_id:data.versionid,tool_id:toolId,node_id:nodeIDs};
									global.appConstants.dbConstants.tableObj.testCondition.find(findInput, function(err, models) {
										if(err){
											global.errorLog.error(err);
											var resp={
												msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
												code:global.errorCodes.errorCode.codes.DB_IO_ERROR
											}
											response.end(JSON.stringify(resp));
										}else if(models.length > -1){											
											var tcObject={};
											var actorObj={};	
											var tcData=[];											
											tcObject["format"]='';
											tcObject["description"]='';
											tcObject["dataSet"]='';
											tcObject["tags"]=[];
											tcObject["actors"]=[actorObj];
											actorObj["actorType"]='';
											actorObj["steps"]=[{index:1,actions:tcData}];
											 scenarioCount++;
											 for(var tcIndex=0;tcIndex<models.length;tcIndex++){
												 var arguments={};
												 if(models[tcIndex].tst_step_args!=null){
													arguments= models[tcIndex].tst_step_args;
												 }
												 if(arguments!=null && arguments!=undefined){
													 if(arguments['durationMs']!=null && arguments['durationMs']!=undefined && arguments['durationMs'].trim() ==''){
														arguments['durationMs']=0;
													 }
													 if(arguments['locator']!=null && arguments['locator']!=undefined && arguments['locator'].trim() ==''){
														arguments['locator']='XPATH';
													 }													  
												 }
												 var parsedDesc='';
												 try{
													let desc=models[tcIndex].description;
													if(desc.indexOf("<div><br></div>") > -1) {
														desc=desc.replace(/<div><br><\/div>/g,"");												
													}
													if(desc.indexOf("<div>") > -1) {
														desc=desc.replace(/<div>/g,", ");
														desc=desc.replace(/<\/div>/g," ");														
													}
													parsedDesc=desc;
												 }catch(err){
													global.errorLog.error(err);
												 }
												tcData.push({
													"description":parsedDesc,
													"action": models[tcIndex].action,
													"args": arguments
												});
											 }
											var ymlText = YAML.stringify(tcObject);
										/*	var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
												initialSize: (100 * 1024),   // start at 100 kilobytes. 
												incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows. 
											});
											myWritableStreamBuffer.write(ymlText);			
											var resp={
												msg:global.errorDescs.errorDesc.desc.SUCCESS,
												code:'200',
												//data:myWritableStreamBuffer.getContentsAsString('utf8')
												data:myWritableStreamBuffer.getContents()
											}*/
											fs.writeFileSync(testDir+fileName, ymlText,  "binary",function(err) { });
											if(scenarioCount==data.selectedscenarioids.length){											
												zip.addLocalFolder(testParentDir);											
												var willSendthis = zip.toBuffer();
												// or write everything to disk
												zip.writeZip(parentDir+testFolderName+".zip");
												//zip file & send as response;
												var resp={
													msg:global.errorDescs.errorDesc.desc.SUCCESS,
													code:'200',
													//data:myWritableStreamBuffer.getContentsAsString('utf8')
													//data:myWritableStreamBuffer.getContents()
													data: zip.toBuffer(),
													fileName:testFolderName
												}
												response.end(JSON.stringify(resp));
											}
										}
										//response.end(JSON.stringify(resp));
									});
								}
						}else{
							var resp={
								msg:global.errorDescs.errorDesc.desc.NO_MODELS_IN_LIST,
								code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
							}
							response.end(JSON.stringify(resp));				
						}
					},{autoFetchLimit:2});
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

function removeDirectory(dirPath) {
    try {
        var files = fs.readdirSync(dirPath);
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '\\' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
				   removeDirectory(filePath);
            }
        }
        fs.rmdirSync(dirPath);
    } catch(e){
        global.appLog.debug('Error while deleting folder: '+dirPath+', '+e);
    }
};

function opentestUpdate(response, data, userData){
	try{
		var testsSteps=data.teststep;
		var newData  =  new Array();
		var existingData  =  new Array();
		var existingDataIds=[];
        for(var index=0;index<testsSteps.length;index++){
			var stepId=testsSteps[index].stepId;
			if(stepId!=undefined && stepId!='' && stepId!=0){
				existingData.push({
					id:stepId,
					test_step_number   : testsSteps[index].testStepNo,
					action   : testsSteps[index].action,
					target_type   : testsSteps[index].targetType,
					target   : testsSteps[index].testCondTarget,
					tst_step_data   : testsSteps[index].testCondStepData,
					description : testsSteps[index].testDescription,
					node_id : testsSteps[index].nodeid,				
					version_id : testsSteps[index].testCondVersion_id,
					tool_id: testsSteps[index].tool_id,
					tst_step_args: testsSteps[index].tst_step_args,
					test_step_type:testsSteps[index].test_step_type
				});
				existingDataIds.push(stepId);
			}else{
				newData.push({
					test_step_number   : testsSteps[index].testStepNo,
					action   : testsSteps[index].action,
					target_type   : testsSteps[index].targetType,
					target   : testsSteps[index].testCondTarget,
					tst_step_data   : testsSteps[index].testCondStepData,
					description : testsSteps[index].testDescription,
					node_id : testsSteps[index].nodeid,				
					version_id : testsSteps[index].testCondVersion_id,
					tool_id: testsSteps[index].tool_id,
					tst_step_args: testsSteps[index].tst_step_args,
					test_step_type:testsSteps[index].test_step_type
				});
			}
		}		
		//save & update
		persistOTMVData();
	
		function persistOTMVData(){
			if(newData.length >0){
				global.appConstants.dbConstants.tableObj.testCondition.create(newData, function (err, items) {								
					if(err){
						global.errorLog.error(err);
						var resp={
							msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						}
						response.end(JSON.stringify(resp));
					}else{
						if(existingData.length >0){
							persistMVDataUpdate();
						}else{
							var resp={
								msg:global.errorDescs.errorDesc.desc.SUCCESS,
								code:"200",
								data:[]
							}
							response.end(JSON.stringify(resp));
						}					
					}
				});
			}else if(existingData.length > 0){
				persistMVDataUpdate();
			}
		}			

		function persistMVDataUpdate(){
			global.appConstants.dbConstants.tableObj.testCondition.find({id:existingDataIds}, function(err, tcObjs) {
					if(err){
						global.errorLog.error(err);
						var resp={
							msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						}
						response.end(JSON.stringify(resp));
					}else if(tcObjs.length >0 ){
						for(var tcIndex=0;tcIndex<tcObjs.length;tcIndex++){
							tcObjs[tcIndex].test_step_number   = existingData[tcIndex].test_step_number,
							tcObjs[tcIndex].action  = existingData[tcIndex].action,
							tcObjs[tcIndex].target_type  = existingData[tcIndex].target_type,
							tcObjs[tcIndex].target  = existingData[tcIndex].target,
							tcObjs[tcIndex].tst_step_data  = existingData[tcIndex].tst_step_data,
							tcObjs[tcIndex].description=existingData[tcIndex].description,
							tcObjs[tcIndex].node_id = existingData[tcIndex].node_id,				
							tcObjs[tcIndex].version_id =existingData[tcIndex].version_id,
							tcObjs[tcIndex].tool_id=existingData[tcIndex].tool_id,
							tcObjs[tcIndex].tst_step_args=existingData[tcIndex].tst_step_args;
							tcObjs[tcIndex].test_step_type=existingData[tcIndex].test_step_type;
							tcObjs[tcIndex].save(function(err){
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
										data:[]
									};
									response.end(JSON.stringify(resp));
								}
							});
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

function opentestDelete(response, data, userData){
	try{
		var delIds=data.delIds;
		var updateIds=data.updateIds;
		global.appConstants.dbConstants.tableObj.testCondition.find({id: delIds}).remove(function(err) {							
			if(err){
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));
			}else{
				if(updateIds!=undefined  && JSON.stringify(updateIds)!='{}'){
					var updateIdKeys=Object.keys(updateIds);
					if(updateIdKeys!=null && updateIdKeys.length>0){
						global.appConstants.dbConstants.tableObj.testCondition.find({id:updateIdKeys}, function(err, tcObjs) {
							if(err){
								global.errorLog.error(err);
								var resp={
									msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
									code:global.errorCodes.errorCode.codes.DB_IO_ERROR
								}
								response.end(JSON.stringify(resp));
							}else if(tcObjs.length >0 ){
								for(var tcIndex=0;tcIndex<tcObjs.length;tcIndex++){
									var stepid=tcObjs[tcIndex].id;
									var stepNumber=updateIds[stepid];
									tcObjs[tcIndex].test_step_number   = stepNumber,
									tcObjs[tcIndex].save(function(err){
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
												data:"Deleted successfully"
											};
											response.end(JSON.stringify(resp));
										}
									});
								}
							}else{
								var resp={
								msg:global.errorDescs.errorDesc.desc.SUCCESS,
								code:"200",
								data:"Deleted successfully"
							};
							response.end(JSON.stringify(resp));
						}
						});
					}
				}else{
					var resp={
						msg:global.errorDescs.errorDesc.desc.SUCCESS,
						code:"200",
						data:"Deleted successfully"
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

module.exports.service = {
	create:testConditionCreate,
	remove:testConditionRemove,
	getAll:getAllTestCondition,
	deletes: deleteTestConditions,
	update: updateTestConditions,
	getTestData:getAllTestComponentData,
	getstepmasterdata:getStepMasterData,
	getstepdata:getstepdatadescription,
	copyTestSteps:copyTestSteps,
	generateYaml:generateYaml,
	getToolData:getToolData,
	opentestUpdate:opentestUpdate,
	opentestDelete:opentestDelete
};
