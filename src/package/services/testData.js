function testDataCreate(response, data, userData){
	try{
		var testsData=data.testdata;
        var entryData  =  new Array();

        for(var index=0;index<testsData.length;index++){
            entryData.push({
				step_data   : testsData[index].testData,
				test_step_id   : testsData[index].testStepIdGlobal				
            });
        }
        global.appLog.debug(entryData);
		persistMVData();		
		function persistMVData(){
			global.appConstants.dbConstants.tableObj.testData.create(entryData, function (err, items) {
			
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

function testDataRemove(response, data, userData){
	try{
		var testsDataId=data.dataId;
		global.appLog.debug(data);
		var entryData  =  new Array();
		for(var index=0;index<testsDataId.length;index++){
		entryData.push(testsDataId[index].checkDataId);
        }
        global.appLog.debug(entryData);
		persistMVData();	
		function persistMVData(){
			global.appConstants.dbConstants.tableObj.testData.find({id: entryData}).remove(function(err) {							
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




function getAllTestData(response, data, userDetails){
    try{
		global.appConstants.dbConstants.tableObj.testData.find({test_step_id:data.testStepId}, function(err, models) {
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

function deleteTestData(response, data, userDetails){
    try{
        var vId = data["versionId"];
        global.appConstants.dbConstants.tableObj.testData.find({version_id:vId}).remove(function(err) {
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
                global.appLog.debug("console:"+JSON.stringify(resp));
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

function updateTestData(response, data, userData){
	try{
		var testsStepsData=data.testdata;
        var entryData  =  new Array();
		var entryDataId  =  new Array();
		var testSaveCount=0;
		for(var index=0;index<testsStepsData.length;index++){
			entryDataId.push(testsStepsData[index].testDataId);
        }
        for(var index=0;index<testsStepsData.length;index++){
			 entryData.push({
				id   : testsStepsData[index].testDataId,
				step_data   : testsStepsData[index].testData,
				tst_step_id   : testsStepsData[index].testStepIdGlobal
            });
		}
			
			//db update
			global.appConstants.dbConstants.tableObj.testData.find({id:entryDataId}, function(err, testStepObj) {
			if(err){
				global.errorLog.error(err);
				var resp={
					msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
					code:global.errorCodes.errorCode.codes.DB_IO_ERROR
				}
				response.end(JSON.stringify(resp));
			}else if(testStepObj.length > 0){
				for(var i=0;i<testsStepsData.length;i++){
					testSaveCount++;
					testStepObj[i].step_data=entryData[i].step_data,
					testStepObj[i].tst_step_id=entryData[i].tst_step_id,
					testStepObj[i].save(function(err){									
					if(err){
						global.errorLog.error(err);
						var resp={
							msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
							code:global.errorCodes.errorCode.codes.DB_IO_ERROR
						}
						response.end(JSON.stringify(resp));
					}else{
					if(testsStepsData.length == testSaveCount){	
						var resp={
							msg:global.errorDescs.errorDesc.desc.SUCCESS,
							code:"200"
						}
						response.end(JSON.stringify(resp));
					 }	
					}
				});
				}
			}else{
				var resp={
					msg:global.errorDescs.errorDesc.desc.INVALID_SCENARIO_ID,
					code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
				}
				response.end(JSON.stringify(resp));
			}});
        global.appLog.debug(entryData);		
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
	create:testDataCreate,
	remove:testDataRemove,
	removeCallFrmTstStp:testDataRemove,
	getAll:getAllTestData,
    deletes: deleteTestData,
	update: updateTestData
};
