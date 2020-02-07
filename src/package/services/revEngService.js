var DOMParser = new (require('xmldom')).DOMParser;
var HashMap = require('hashmap');
var fs = require('fs');
var AdmZip = require('adm-zip');
var appConstants = require("../constants/constants.js");
var excel = require('exceljs');
var xlsx = require('xlsx');
var uuidv1 = require('uuid/v1');
var uuidv5 = require('uuid/v5');
var ArrayList = require('arraylist');
var stringSimilarity = require('string-similarity');


function importTestCaseFile(response, data, userData) {    
    global.appConstants.dbConstants.tableObj.modelVersion.find({id: data.versionId}, function(err, modelVersionObj) {
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
                    msg:global.errorDescs.errorDesc.desc.CANNOT_IMPORT_PUBLISHED_MODEL_VERSION,
                    code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                }
                response.end(JSON.stringify(resp));
            }else{                
                var parentDir=appConstants.import.importDir;
                var dir = parentDir+userData[0].userID+'\\';
                var headerJson;    
                if(data.fileType=='excel'){        
                    try {
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                        var fileName='';
                        if(data.fileName.endsWith('.xls')){
                            fileName='reveng.xls';
                        }else{
                            fileName='reveng.xlsx'
                        }
                        fs.writeFileSync(dir+fileName, data.fileData,  "binary",function(err) { });
                        headerJson=parseInputFile(data,response);                     
                        var resp = {
                            msg: global.errorDescs.errorDesc.desc.SUCCESS,
                            code: "200",
                            data: headerJson
                        }
                        response.end(JSON.stringify(resp));
                    }catch(e){
                        removeDirectory(dir);
                        global.errorLog.error(e);
                        var resp={
                            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
                            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
                        }
                        response.end(JSON.stringify(resp));
                    }
                }else{
                    // Unspported file error
                   // global.errorLog.error(e);
                    var resp={
                        msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
                        code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
                    }
                    response.end(JSON.stringify(resp));
                }
            }
        }
    });
}

function parseInputFile(inputData,response) {    
    var workbook = xlsx.read(inputData.fileData,{type: 'binary'});
    var versionId=inputData.versionId;
    var sheetName= inputData.sheet;
    var headers = [];
    var headerRow=1;
    if(inputData.headerRowNum!=undefined){
        headerRow=inputData.headerRowNum;
    }
    var worksheet = workbook.Sheets[sheetName];    
    for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var row = z.match(/\d+/)[0];  
        row=parseInt(row);
        headerRow=parseInt(headerRow);        
        if(row < headerRow) continue;               
        var value = worksheet[z].v;
        //store header names
        if(row == headerRow) {
            headers.push(removeLineBreaks(value));
        }
    }
    return headers;   
}

function parseInputFileForMapping(inputFile,mappedCols, headerRowNum,sheetName) {    
    var workbook = xlsx.readFile(inputFile,{type: 'binary'});
    var headerRow=1;
    if(headerRowNum!=undefined){
        headerRow=headerRowNum;
    }
    var worksheet = workbook.Sheets[sheetName];
    var headers = {};
    var data = [];
    var prevRowNum=0;
    for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value 
        var row = z.match(/\d+/)[0];
        row=parseInt(row);
        headerRow=parseInt(headerRow);
        if(row < headerRow) continue;        
        var colLength=z.length;
        var rowNumStrLen=(row+'').length;       
       // if(row > 45) break;
        var col = z.substring(0,colLength-rowNumStrLen);
        var value = worksheet[z].v;
        if(row!=prevRowNum && prevRowNum!=(row-1)){
          data[row-1]={};
        }
        prevRowNum=row;
        //store header names
        if(row == headerRow) {
            headers[col] = removeLineBreaks(value);
            continue;
        }          
        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;
    }
    data.shift();
    data.shift();
    return data;   
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
                    rmDir(filePath);
            }
        }
        fs.rmdirSync(dirPath);
    } catch(e){
        global.appLog.debug('Error while deleting folder: '+dirPath+', '+e);
    }
}

function applyFieldMapping(response, data, userData) {    
    global.appConstants.dbConstants.tableObj.modelVersion.find({id: data.versionId}, function(err, modelVersionObj) {
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
                    msg:global.errorDescs.errorDesc.desc.CANNOT_IMPORT_PUBLISHED_MODEL_VERSION,
                    code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                }
                response.end(JSON.stringify(resp));
            }else{                
                var parentDir=appConstants.import.importDir;
                var fileName='';
                if(data.fileName.endsWith('.xls')){
                    fileName='reveng.xls';
                }else{
                    fileName='reveng.xlsx'
                }
                var filePath = parentDir+userData[0].userID+'\\'+fileName;
                var outputJson;    
                try {
                    outputJson= parseInputFileForMapping(filePath,data.mc,data.headerRowNum,data.sheet);
                    var resp = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: outputJson
                    }
                    response.end(JSON.stringify(resp));                    
                }catch(e){
                    global.errorLog.error(e);
                    var resp={
                        msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
                        code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
                    }
                    response.end(JSON.stringify(resp));
                }
            }
        }
    });
}

function diagnose(response, data, userData) {    
    global.appConstants.dbConstants.tableObj.modelVersion.find({id: data.versionId}, function(err, modelVersionObj) {
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
                    msg:global.errorDescs.errorDesc.desc.CANNOT_IMPORT_PUBLISHED_MODEL_VERSION,
                    code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                }
                response.end(JSON.stringify(resp));
            }else{ 
               /* var buffer = new Buffer('admin:admin');
                var toBase64 = buffer.toString('base64');
                request.post({
                    url:'http://IN-PNQ-COE60:8088/api/rest/process/Nothing?',
                    port: 8081,
                    method:"POST", 
                    headers:{
                        'Content-Type': 'application/xml',
                        'Authorization': "Basic "+toBase64
                    },
                     body: '<?xml version="1.0" encoding="UTF-8"?><breakfast_menu><food><name>Belgian Waffles</name><price>$5.95</price><description>Two of our famous Belgian Waffles with plenty of real maple syrup</description><calories>650</calories></food></breakfast_menu>'
                },
                function(error,response, body)
                {     
                  // if(response!=undefined){
                    global.appLog.debug("response:" + response);
                    global.appLog.debug("error:" + error);
                    global.appLog.debug("body:" + body);
                   // }else{
                       
                   // }
                }); */
                var fieldMappingData=JSON.parse(data.tableData);
                var compNameList= [];    
                var compName='';
                var testCaseName='';
                var isFirstTestCase=true;
                var modifiedCount=0;
                for(var index=0;index<fieldMappingData.length;index++){
                    var isBestMatchFound=false;                                    
                    var testCaseName=fieldMappingData[index].TestCaseName;
                    compName=fieldMappingData[index].StepDesc;
                    if(index!=0 && testCaseName!='' && isFirstTestCase){
                        isFirstTestCase=false;
                    }
                    var rating=1;
                    if(!isFirstTestCase){
                        var stringSimilarityResp= stringSimilarity.findBestMatch(compName,compNameList);
                        rating=stringSimilarityResp.bestMatch.rating;
                        rating=rating.toFixed(2);
                        if(rating >= data.dcval && rating < 1){
                            compName=stringSimilarityResp.bestMatch.target;
                            isBestMatchFound=true;
                            modifiedCount++;
                        } 
                    }else{
                        rating=0;
                    }
                    if(!isBestMatchFound){
                        compNameList.push(compName);       
                    }  
                    fieldMappingData[index].ComponentName= compName;        
                    fieldMappingData[index].DCNum= rating;
                }
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: {"tableData":fieldMappingData,"modifiedCount":modifiedCount}
                }
                response.end(JSON.stringify(resp));              
            }
        }
    });
}

function getexcelsheetnames(response, data, userData){
    var workbook = xlsx.read(data.fileData,{type: 'binary'});
    var sheetnames = workbook.SheetNames;
    var resp = {
        msg: global.errorDescs.errorDesc.desc.SUCCESS,
        code: "200",
        data: sheetnames
    }
    response.end(JSON.stringify(resp));
}

function generateModelPreview(response,data,userData){
    try{
        var nodeIdMap=new HashMap(); 
        var scenarioId='';
        var versionId=data.versionId;
        var blobJson = {"cells": []};  
        var scenarioMap=new HashMap();
        var nodeIdTestData= new HashMap(); 
        var appendedNodeName='';
        var forkMap=new HashMap();
        var joinMap=new HashMap(); 
        var decisionMap=new HashMap(); 
        var decisionCount=0;
        var forkCount=0;
        var nodeNumber=0;
        var curScenarioId='';
        var nodeInOutMap=new HashMap();
        var nodeIndexMap=new HashMap();
        var nodeCountElement={
            inCount:0,
            outCount:0,
            inMap:[],
            outMap:[]
        }
        var inputData=JSON.parse(data.tableData);
    // var joinCount=0;
        var startNode={};
        var endNode={};
        var numOfNodes=0;
        var tcCount=0;
        
        for(var i=0;i<inputData.length;i++){
            var item=inputData[i];
            var scenarioNodes=[];         
            if(i==0){
                //Create Start node for diagram
                var startNodeName='Start';
                var startNodeUUID=uuidv5(startNodeName, uuidv1());
                nodeIdMap.set(startNodeName,startNodeUUID);
                nodeNumber++; 
                nodeIndexMap.set(startNodeUUID,0);
                addComponentToBlob(startNodeUUID,'Start','',blobJson,nodeNumber);
                startNode={
                    id: startNodeUUID,
                    name: 'Start',
                    type: 'Start',
                    appendedName: startNodeName,
                    }   
            }
            if(JSON.stringify(item) != '{}') {
                var component=checkIfExists('ComponentName',item);
                var nodeType='Process';
                //if(nodeType!='' && component!=''){
                    if(checkIfExists('TestCaseName',item)!=''){ 
                        scenarioNodes=[];
                        scenarioId=checkIfExists('TestCaseName',item);   
                        if(scenarioMap.get(scenarioId)==undefined){
                            scenarioNodes.push(startNode);                        
                            scenarioMap.set(scenarioId,scenarioNodes);  
                            appendedNodeName='Start';                              
                            //Create End Node when a new Scenario/Test case starts
                            if(curScenarioId!=scenarioId && tcCount>0) {                               
                                var prevScenarioNodes=scenarioMap.get(curScenarioId);
                                if(prevScenarioNodes!=undefined) {
                                    var lastNode=prevScenarioNodes[prevScenarioNodes.length-1];
                                    var endNodeObject=createEndNodeObject(lastNode.appendedName);
                                    if(nodeIdMap.get(lastNode.appendedName+'End'+'End Node')==undefined) {    
                                        nodeIdMap.set(lastNode.appendedName+'End'+'End Node',endNodeObject.id);
                                        nodeNumber++; 
                                        nodeIndexMap.set(endNodeObject.id,blobJson.cells.length);
                                        addComponentToBlob(endNodeObject.id,endNodeObject.name,'',blobJson,nodeNumber);
                                    }
                                    prevScenarioNodes.push(endNodeObject);     
                                }                                
                            }
                            curScenarioId=scenarioId;      
                            tcCount++;                                  
                        }
                    }
                    if(component==''){continue;}
                    scenarioNodes=scenarioMap.get(scenarioId);
                    if(appendedNodeName==''){
                        appendedNodeName=component;
                    }else{
                        appendedNodeName=appendedNodeName+component;
                    }
                    var nodeId=appendedNodeName+nodeType;
                    var nodeUUID='';
                    if(nodeIdMap.get(nodeId)==undefined) {
                        nodeUUID=uuidv5(nodeId, uuidv1());
                        nodeIdMap.set(nodeId,nodeUUID);
                        nodeNumber++;
                        nodeIndexMap.set(nodeUUID,blobJson.cells.length);                                
                        numOfNodes++;
                        addComponentToBlob(nodeUUID,nodeType,component,blobJson,nodeNumber);                         
                    }else{
                        nodeUUID=nodeIdMap.get(nodeId);
                    }
                    scenarioNode={
                        id: nodeUUID,
                        name: component,
                        type: nodeType,
                        appendedName: appendedNodeName,
                    }
                    scenarioNodes.push(scenarioNode);
                    if(i== (inputData.length-1)){
                        var endNodeObject=createEndNodeObject(scenarioNode.appendedName);                        
                        if(nodeIdMap.get(scenarioNode.appendedName+'End'+'End Node')==undefined) {                                
                            nodeIdMap.set(scenarioNode.appendedName+'End'+'End Node',endNodeObject.id);
                            nodeNumber++; 
                            nodeIndexMap.set(endNodeObject.id,blobJson.cells.length);
                            addComponentToBlob(endNodeObject.id,endNodeObject.name,'',blobJson,nodeNumber);
                        }
                        scenarioNodes.push(endNodeObject);
                    }
                    scenarioMap.set(scenarioId,scenarioNodes);       
                //}                 
            }else{
                global.appLog.debug('skipped empty Object');
            }
        }
        var numOfScenarios=scenarioMap.size;
        if(scenarioMap!=null){
            scenarioMap.forEach(function(value, key) {            
                var scenarioItems=value;
                var nodesLength=scenarioItems.length;
                for (var index = 0; index < nodesLength; index++){
                    var nextIndex =index+1; 
                    var nodeUUID=scenarioItems[index].id;                        
                    if(nextIndex<nodesLength){
                        if(scenarioItems[nextIndex].type=='Link'){                   
                            continue;                    
                        }    
                        var nodeId='';
                        var isLinkCreated=false;  
                        var isEmptyLink=false;   
                        nodeId=scenarioItems[index].appendedName+scenarioItems[nextIndex].name;
                        if(nodeIdMap.get(nodeId)==undefined) {
                            nodeUUID=uuidv5(nodeId, uuidv1());
                            nodeIdMap.set(nodeId,nodeUUID);
                            nodeNumber++;
                            nodeIndexMap.set(nodeUUID,blobJson.cells.length); 
                            createLink1(nodeUUID,'',scenarioItems[index].id,scenarioItems[nextIndex].id,blobJson,nodeNumber);
                            isLinkCreated=true;
                            isEmptyLink=true;                        
                        }else{
                            nodeUUID=nodeIdMap.get(nodeId);
                        } 
                        if(isLinkCreated){
                            if(nodeInOutMap.get(scenarioItems[index].id) == undefined){
                                nodeCountElement={
                                    inCount:0,
                                    outCount:1,
                                    inMap:[],
                                    outMap:[nodeUUID]
                                }
                                nodeInOutMap.set(scenarioItems[index].id,nodeCountElement);                        
                            }else{
                                nodeCountElement=nodeInOutMap.get(scenarioItems[index].id);
                                ++nodeCountElement.outCount;
                                nodeCountElement.outMap.push(nodeUUID);
                            }
                            if(nodeInOutMap.get(scenarioItems[nextIndex].id) == undefined){
                                nodeCountElement={
                                    inCount:1,
                                    outCount:0,
                                    inMap:[nodeUUID],
                                    outMap:[]
                                }
                                nodeInOutMap.set(scenarioItems[nextIndex].id,nodeCountElement);                        
                            }else{
                                nodeCountElement=nodeInOutMap.get(scenarioItems[nextIndex].id);
                                ++nodeCountElement.inCount;
                                nodeCountElement.inMap.push(nodeUUID);
                            }
                        }
                    }   
                } 
            });
            nodeInOutMap.forEach(function(element, key) {
                var inCount=element.inCount;
                var outCount=element.outCount;
                var nodeIndex=nodeIndexMap.get(key);
                var nodeId= blobJson.cells[nodeIndex].id;
                var name=blobJson.cells[nodeIndex].attrs.text.text;
                var nodeNumber=blobJson.cells[nodeIndex].z;
                if(inCount == 1 && outCount ==2){
                    //change to Decision           
                    blobJson.cells[nodeIndex]= createDecisionObject(nodeId,name,nodeNumber);
                }else if(inCount > 1 && outCount ==1){
                    //change to JOIN          
                    var joinObj= createJoinObject(nodeId,name,nodeNumber);
                    var portCount=3;
                    for(var count=1;count<=inCount;count++){
                        if(count>=3){
                            joinObj.inPorts.push('in'+count);
                        }                      
                        var inLinkIndex=nodeIndexMap.get(element.inMap[count-1]);
                        blobJson.cells[inLinkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                        blobJson.cells[inLinkIndex].target.port=joinObj.inPorts[count-1];   
                        portCount++;
                    }
                    var outLinkIndex=nodeIndexMap.get(element.outMap[0]);                    
                    blobJson.cells[outLinkIndex].source.port=joinObj.outPorts[0];        
                    blobJson.cells[outLinkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";     
                    blobJson.cells[nodeIndex]=joinObj;
                }else if(inCount==1 && outCount >1){
                    //change to Fork           
                    var forkObj= createForkObject(nodeId,name,nodeNumber);                    
                    var inLinkIndex=nodeIndexMap.get(element.inMap[0]);
                    var portCount=3;
                    blobJson.cells[inLinkIndex].target.port=forkObj.inPorts[0];        
                    blobJson.cells[inLinkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";     
                   for(var count=1;count<=outCount;count++){
                        if(count>=3){
                            forkObj.outPorts.push('out'+count);
                        }                      
                        var outLinkIndex=nodeIndexMap.get(element.outMap[count-1]);
                        blobJson.cells[outLinkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                        blobJson.cells[outLinkIndex].source.port=forkObj.outPorts[count-1];   
                        portCount++;
                    }
                    blobJson.cells[nodeIndex]=forkObj;
                }else if(inCount==0 && outCount>1){
                    var newNodeId='';   
                    //create a new link b/w fork & Join 
                    var linkNodeUUID=uuidv5('Start-Link', uuidv1());
                    nodeIdMap.set('Start-Link',linkNodeUUID);
                    nodeNumber++;                    
                    nodeIndexMap.set(linkNodeUUID,blobJson.cells.length); 
                    var startNodeId=blobJson.cells[0].id;
                    /*if(outCount==2){
                        //Create new decision node  
                        newNodeId=uuidv5('Start-Decision', uuidv1());  
                        createLink1(linkNodeUUID,'',startNodeId,newNodeId,blobJson,nodeNumber);                        
                        nodeIdMap.set('Start-Decision',newNodeId);         
                        nodeNumber++;       
                        nodeIndexMap.set(newNodeId,blobJson.cells.length);
                        numOfNodes++;
                        createDecisionNode1(newNodeId,'Decision',blobJson,nodeNumber);
                        var outLinkIndex=nodeIndexMap.get(element.outMap[0]);     
                        blobJson.cells[outLinkIndex].source.id=newNodeId;    
                        outLinkIndex=nodeIndexMap.get(element.outMap[1]);     
                        blobJson.cells[outLinkIndex].source.id=newNodeId;                 
                    }*/
                    //Create new fork node
                    newNodeId=uuidv5('Start-Fork', uuidv1()); 
                    createLink1(linkNodeUUID,'',startNodeId,newNodeId,blobJson,nodeNumber);   
                    //  createForkObject(newNodeId,'Fork',nodeNumber); 
                    nodeIdMap.set('Start-Fork',newNodeId);         
                    nodeNumber++;       
                    nodeIndexMap.set(newNodeId,blobJson.cells.length);
                    numOfNodes++;
                    var forkObj=createForkObject(newNodeId,'Fork (Add text here)',nodeNumber);   
                    var inLinkIndex=nodeIndexMap.get(linkNodeUUID);
                    var portCount=3;
                    blobJson.cells[inLinkIndex].target.port=forkObj.inPorts[0];        
                    blobJson.cells[inLinkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";     
                    for(var count=1;count<=outCount;count++){
                        if(count>=3){
                            forkObj.outPorts.push('out'+count);
                        }                      
                        var outLinkIndex=nodeIndexMap.get(element.outMap[count-1]);
                        blobJson.cells[outLinkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                        blobJson.cells[outLinkIndex].source.port=forkObj.outPorts[count-1]; 
                        blobJson.cells[outLinkIndex].source.id=newNodeId;   
                        portCount++;
                    }
                    blobJson.cells.push(forkObj);                    
                }else if(inCount>1 && outCount>1){
                    newForkCount++;
                    var joinObj=createJoinObject(nodeId,name,nodeNumber);
                    //create a Fork Object
                    var forkNodeUUID=uuidv5('Fork'+newForkCount, uuidv1());
                    nodeIdMap.set('Fork'+newForkCount,forkNodeUUID);
                    nodeNumber++;
                    nodeIndexMap.set(forkNodeUUID,blobJson.cells.length);                                
                    numOfNodes++;
                    var forkObj=createForkObject(forkNodeUUID,'Fork (Add text here)',nodeNumber);   
                    //create a new link b/w fork & Join 
                    var linkNodeUUID=uuidv5(nodeId+'Fork', uuidv1());
                    nodeIdMap.set(nodeId+'Fork'+newForkCount,linkNodeUUID);
                    nodeNumber++;                    
                    nodeIndexMap.set(linkNodeUUID,blobJson.cells.length); 
                    createLink1(linkNodeUUID,'',nodeId,forkNodeUUID,blobJson,nodeNumber);  
                    var portCount=3;
                    for(var count=1;count<=inCount;count++){
                        if(count>=3){
                            joinObj.inPorts.push('in'+count);
                        }                      
                        var inLinkIndex=nodeIndexMap.get(element.inMap[count-1]);
                        blobJson.cells[inLinkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                        blobJson.cells[inLinkIndex].target.port=joinObj.inPorts[count-1];   
                        portCount++;
                    }
                    var outLinkIndex=nodeIndexMap.get(linkNodeUUID);                    
                    blobJson.cells[outLinkIndex].source.port=joinObj.outPorts[0];        
                    blobJson.cells[outLinkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";     
                    blobJson.cells[nodeIndex]=joinObj;
                    var inLinkIndex=nodeIndexMap.get(linkNodeUUID);
                    var portCount=3;
                    blobJson.cells[inLinkIndex].target.port=forkObj.inPorts[0];        
                    blobJson.cells[inLinkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";     
                   for(var count=1;count<=outCount;count++){
                        if(count>=3){
                            forkObj.outPorts.push('out'+count);
                        }                      
                        var outLinkIndex=nodeIndexMap.get(element.outMap[count-1]);
                        blobJson.cells[outLinkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                        blobJson.cells[outLinkIndex].source.port=forkObj.outPorts[count-1];   
                        blobJson.cells[outLinkIndex].source.id=forkNodeUUID;
                        portCount++;
                    }
                    blobJson.cells.push(forkObj);
                }
            });
        } 
        var responseData={
            diagramData:blobJson,
            numScenarios:numOfScenarios,
            numNodes:numOfNodes
        };   
        var resp={
            msg:global.errorDescs.errorDesc.desc.SUCCESS,
            code:"200",
            data:responseData
        }
        response.end(JSON.stringify(resp));
    }catch(err){
        global.errorLog.error(err);
        var resp={
            msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
            code:global.errorCodes.errorCode.codes.DB_IO_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}

function createEndNodeObject(nodeName){
    var endNodeUUID=uuidv5(nodeName+'End'+'End Node', uuidv1());
   return {
        id: endNodeUUID,
        name: 'End',
        type: 'End',
        appendedName: nodeName+'End',
        }
}

function saveModelVersion(response,data,userData){
    var msg = '';
    var versionId=data.versionId;
    var blobJson=data.diagData;
    if(blobJson==null || JSON.stringify(blobJson)=='{}') msg = global.errorDescs.errorDesc.desc.EMPTY_DIAGRAM_DATA;
    else if(!global.validation.validation.test('empty',versionId)) msg = global.errorDescs.errorDesc.desc.MODEL_VERSION_ID_REQUIRED;
    else{
        msg = '';
    }
    if(msg == ''){
        global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, versionObj) { 
            if(err){
                global.errorLog.error(err);
                msg=global.errorDescs.errorDesc.desc.DB_IO_ERROR;
            }else if(versionObj.length == 1){
                if(versionObj[0].user_id == userData[0].id){ 
                    if(versionObj[0].status == 6){                   
                        versionObj[0].diagram_data= blobJson;
                        versionObj[0].save(function(err){
                            if(err){
                                global.errorLog.error(err);
                                msg=global.errorDescs.errorDesc.desc.DB_IO_ERROR;                            
                            }else{
                                //DELETE Existing Scenario data
                                var sql = "DELETE from scenario_master WHERE model_version_id = ?";
                                var query = global.db.driver.execQuery(sql, [versionId], function(err, result) {
                                    if(err){
                                        global.errorLog.error(err);
                                        msg=global.errorDescs.errorDesc.desc.DB_IO_ERROR;
                                    }else{
                                        var resp={
                                            msg:global.errorDescs.errorDesc.desc.SUCCESS,
                                            code:"200",
                                            data:blobJson
                                        }
                                        response.end(JSON.stringify(resp));
                                    }                           
                                });
                            }
                        });
                    }else if(versionObj[0].status == 7){
                        msg=global.errorDescs.errorDesc.desc.CANNOT_MODIFY_PUBLISHED_MODEL_VERSION;                       
                    }else{
                        msg=global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID;
                    }
                }else{
                    msg=global.errorDescs.errorDesc.desc.ACCESS_NOT_ALLOWED_FOR_DIFFERENT_PROJECT;
                }                
            }else{
                    msg=global.errorDescs.errorDesc.desc.INVALID_MODEL_VERSION_ID;
            }				
        });
    }
    if(msg!=''){
        var resp={
            msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
            code:global.errorCodes.errorCode.codes.DB_IO_ERROR
        }
        response.end(JSON.stringify(resp));
    }					
}

function checkIfExists(key,obj){
    try{
      var id=obj[key];
      if(id!=undefined){
          return id;
      }
    }catch(err){};
    return '';
 }


 function createLink1(id,name,sourceId,targetId,blobJson,nodeNumber) {
    var componentObj =
        {
            "type": "app.Link",
            "router": {
                "name": "normal"
            },
            "connector": {
                "name": "normal"
            },
            "source": {
                "id": ""
            },
            "target": {
                "id": ""
            },
            "id": "",
            "labels": [{
                "attrs": {
                    "text": {
                        "text": ""
                    }
                }
            }],
            "attrs": {}
        };
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.labels[0].attrs.text.text = name;
    componentObj.source.id = sourceId;
    componentObj.target.id = targetId;
    blobJson.cells.push(componentObj);
}

function createDecisionObject(id,name,nodeNumber){
    var width=getWidth(name,80);
    var componentObj=
        {
            "type": "erd.Relationship",
            "size": {
                "width": width,
                "height": 40
            },
            "angle": 0,
            "id": "",
            "z": 4,
            "attrs": {
                ".outer": {
                    "fill": "#61549C",
                    "stroke": "transparent",
                    "stroke-dasharray": "0"
                },
                "text": {
                    "text": "",
                    "font-family": "Roboto Condensed",
                    "font-size": 11,
                    "font-weight": "Normal",
                    "fill": "#f6f6f6",
                    "stroke-width": 0
                },
                ".": {
                    "data-tooltip-position": "left",
                    "data-tooltip-position-selector": ".joint-stencil"
                }
            }
        };
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    componentObj.attrs.text.text=name;
    return componentObj;
}

function createDecisionNode1(id,name,blobJson,nodeNumber){
    blobJson.cells.push(createDecisionObject(id,name,nodeNumber));
}

function createEntityNode1(id,name,blobJson,nodeNumber){
    blobJson.cells.push(createEntityObject(id,name,nodeNumber));
}

function createEntityObject(id,name,nodeNumber){
    var width=getWidth(name,80);    
    var componentObj=
    {
        "type": "erd.Entity",
        "size": {
            "width": width,
            "height": 40
        },
        "angle": 0,
        "id": "",
        "z": 3,
        "attrs": {
            ".outer": {
                "fill": "#31d0c6",
                "stroke": "transparent",
                "rx": 3,
                "ry": 3,
                "stroke-dasharray": "0"
            },
            "text": {
                "text": "",
                "font-family": "Roboto Condensed",
                "font-size": 11,
                "font-weight": "Normal",
                "fill": "#f6f6f6",
                "stroke-width": 0
            },
            ".": {
                "data-tooltip-position": "left",
                "data-tooltip-position-selector": ".joint-stencil"
            }
        }
    };
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    componentObj.attrs.text.text=name;
    return componentObj;
}

function createStateNode1(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "fsa.State",
		"size": {
			"width": 20,
			"height": 20
		},
		"angle": 0,
		"preserveAspectRatio": true,
		"id": "",
		"z": 72,
		"attrs": {
			"circle": {
				"stroke-width": 2,
				"fill": "#FF0000",
				"stroke": "transparent",
				"stroke-dasharray": "0"
			},
			"text": {
				"font-weight": "Normal",
				"font-size": 11,
				"text": "",
				"fill": "#f6f6f6",
				"font-family": "Roboto Condensed",
				"stroke-width": 0
			},
			".": {
				"data-tooltip-position": "left",
				"data-tooltip-position-selector": ".joint-stencil"
			}
		}
	};
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    componentObj.attrs.text.text=name;
    blobJson.cells.push(componentObj);
}


function createStartNode1(id,blobJson,nodeNumber){
    var componentObj=
        {
            "type": "fsa.StartState",
            "size": {
                "width": 20,
                "height": 20
            },
            "angle": 0,
            "preserveAspectRatio": true,
            "id": "",
            "z": 1,
            "attrs": {
                "circle": {
                    "fill": "#61549C",
                    "width": 40,
                    "height": 20,
                    "stroke-width": 0
                },
                ".": {
                    "data-tooltip-position": "left",
                    "data-tooltip-position-selector": ".joint-stencil"
                },
                "text": {
                    "text": "startState",
                    "fill": "#c6c7e2",
                    "font-family": "Roboto Condensed",
                    "font-weight": "Normal",
                    "font-size": 11,
                    "stroke-width": 0
                }
            }
        };
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    blobJson.cells.push(componentObj);
}

function createEndNode1(id,blobJson,nodeNumber){
    var componentObj=
        {
            "type": "fsa.EndState",
            "size": {
                "width": 20,
                "height": 20
            },
            "angle": 0,
            "preserveAspectRatio": true,
            "id": "",
            "z": 5,
            "attrs": {
                ".outer": {
                    "fill": "transparent",
                    "stroke": "#61549C",
                    "stroke-width": 2,
                    "stroke-dasharray": "0"
                },
                ".inner": {
                    "fill": "#6a6c8a",
                    "stroke": "transparent"
                },
                ".": {
                    "data-tooltip-position": "left",
                    "data-tooltip-position-selector": ".joint-stencil"
                },
                "text": {
                    "text": "endState",
                    "fill": "#c6c7e2",
                    "font-family": "Roboto Condensed",
                    "font-weight": "Normal",
                    "font-size": 11,
                    "stroke-width": 0
                }
            }
        };
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    blobJson.cells.push(componentObj);
}

function createForkObject(id,name,nodeNumber){
    var width=getWidth(name,80);    
    var componentObj=
    {
        type: 'app.RectangularModel', 
        ports: {
            "groups": {
                "in": {
                    "markup": "<circle class=\"port-body\" r=\"4\"/>",
                    "attrs": {
                        ".port-body": {
                            "fill": "#61549C",
                            "stroke-width": 0,
                            "stroke": "#000",
                            "r": 4,
                            "magnet": true
                        },
                        ".port-label": {
                            "font-size": 11,
                            "fill": "#61549C",
                            "font-weight": 800
                        }
                    },
                    "label": {
                        "position": {
                            "name": "top",
                            "args": {
                                "y": -12
                            }
                        }
                    },
                    "position": {
                        "name": "top"
                    }
                },
                "out": {
                    "markup": "<circle class=\"port-body\" r=\"4\"/>",
                    "attrs": {
                        ".port-body": {
                            "fill": "#61549C",
                            "stroke-width": 0,
                            "stroke": "#000",
                            "r": 4,
                            "magnet": true
                        },
                        ".port-label": {
                            "font-size": 11,
                            "fill": "#61549C",
                            "font-weight": 800
                        }
                    },
                    "label": {
                        "position": {
                            "name": "bottom",
                            "args": {
                                "y": 12
                            }
                        }
                    },
                    "position": {
                        "name": "bottom"
                    }
                }
            },
            "items": [{
                "id": "in",
                "group": "in",
                "attrs": {
                    ".port-label": {
                        "text": "in"
                    }
                }
            },
            {
                "id": "out1",
                "group": "out",
                "attrs": {
                    ".port-label": {
                        "text": "out1"
                    }
                }
            },
            {
                "id": "out2",
                "group": "out",
                "attrs": {
                    ".port-label": {
                        "text": "out2"
                    }
                }
            }]
        },           
        inPorts: ['in'],
        outPorts: ['out1','out2'],
        size: {
            "width": width,
            "height": 40
        },
		angle: 0,
        allowOrthogonalResize: false,
        attrs: {
            ".": {
                "data-tooltip": "Fork Node",
                "data-tooltip-position": "left",
                "data-tooltip-position-selector": ".joint-stencil"
            },
            ".label": {
                "text": "Fork Node",
                "ref-y": 0.5,
                "font-size": 11,
                "fill": "#f6f6f6",
                "font-family": "Roboto Condensed",
                "font-weight": "Normal",
                "stroke-width": 0,
                "y-alignment": "middle"
            },
            ".body": {
                "stroke": "#7c68fc",
                "fill": "#7c68fc",
                "rx": 2,
                "ry": 2,
                "stroke-width": 0,
                "stroke-dasharray": "0"
            }
        }
    };
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    componentObj.attrs['.label'].text=name;
    return componentObj;
}

function createForkNode(id,name,blobJson,nodeNumber){
    blobJson.cells.push(createForkObject(id,name,nodeNumber));
}    

function createJoinObject(id,name,nodeNumber){
    var width=getWidth(name,80);    
    var componentObj=
    {
        type: 'app.RectangularModel',
        ports: {
            "groups": {
                "in": {
                    "markup": "<circle class=\"port-body\" r=\"4\"/>",
                    "attrs": {
                        ".port-body": {
                            "fill": "#b75d32",
                            "stroke-width": 0,
                            "stroke": "#000",
                            "r": 4,
                            "magnet": true
                        },
                        ".port-label": {
                            "font-size": 11,
                            "fill": "#61549C",
                            "font-weight": 800
                        }
                    },
                    "label": {
                        "position": {
                            "name": "top",
                            "args": {
                                "y": -12
                            }
                        }
                    },
                    "position": {
                        "name": "top"
                    }
                },
                "out": {
                    "markup": "<circle class=\"port-body\" r=\"4\"/>",
                    "attrs": {
                        ".port-body": {
                            "fill": "#b75d32",
                            "stroke-width": 0,
                            "stroke": "#000",
                            "r": 4,
                            "magnet": true
                        },
                        ".port-label": {
                            "font-size": 11,
                            "fill": "#61549C",
                            "font-weight": 800
                        }
                    },
                    "label": {
                        "position": {
                            "name": "bottom",
                            "args": {
                                "y": 12
                            }
                        }
                    },
                    "position": {
                        "name": "bottom"
                    }
                }
            },
            "items": [{
                "id": "in1",
                "group": "in",
                "attrs": {
                    ".port-label": {
                        "text": "in1"
                    }
                }
            },
            {
                "id": "in2",
                "group": "in",
                "attrs": {
                    ".port-label": {
                        "text": "in2"
                    }
                }
            },
            {
                "id": "out",
                "group": "out",
                "attrs": {
                    ".port-label": {
                        "text": "out"
                    }
                }
            }]
        },
        inPorts: ["in1",
        "in2"],
        outPorts: ["out"],
        size: {
            "width": width,
            "height": 40
        },
        angle: 0,        
        allowOrthogonalResize: false,
        attrs: {
            ".": {
                "data-tooltip": "Join Node",
                "data-tooltip-position": "left",
                "data-tooltip-position-selector": ".joint-stencil"
            },
            ".label": {
                "text": "Join Node",
                "ref-y": 0.5,
                "font-size": 11,
                "fill": "#f6f6f6",
                "font-family": "Roboto Condensed",
                "font-weight": "Normal",
                "stroke-width": 0,
                "y-alignment": "middle"
            },
            ".body": {
                "stroke": "#feb663",
                "fill": "#feb663",
                "rx": 2,
                "ry": 2,
                "stroke-width": 2,
                "stroke-dasharray": "0"
            }
        }
    };
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    componentObj.attrs['.label'].text=name;
    return componentObj;
}

function createJoinNode(id,name,blobJson,nodeNumber){
    blobJson.cells.push(createJoinObject(id,name,nodeNumber));
}

function createSendSignal(id,blobJson,nodeNumber){
    var width=getWidth(name,80);    
    var componentObj=
    {
		"type": "basic.Path",
		"size": {
			"width": width,
			"height": 40
		},
		"name": "SendSignal",
		"id": "",
		"attrs": {
			"path": {
				"fill": "#03c1c4",
				"stroke": "#7c68fc",
				"d": "M 0 0 L 80 0 100 20 80 40 0 40 Z"
			},
			"text": {
				"text": "Send\nSignal",
				"ref-dy": null,
				"fill": "#f6f6f6",
				"ref-y": 0.5,
				"y-alignment": "middle"
			},
			".": {
				"data-tooltip-position": "left",
				"data-tooltip-position-selector": ".joint-stencil"
			}
		}
	};
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    blobJson.cells.push(componentObj);
}

function createAcceptEvent(id,blobJson,nodeNumber){
    var width=getWidth(name,80);        
    var componentObj=
    {
		"type": "basic.Path",
		"size": {
			"width": width,
			"height": 40
		},		
		"name": "AcceptEvent",
		"id": "",
		"attrs": {
			"path": {
				"fill": "#fe854f",
				"stroke": "#feb663",
				"d": "M 0 0 L 100 0 100 40 0 40 20 20 Z"
			},
			"text": {
				"text": "Accept\nEvent",
				"ref-dy": null,
				"fill": "#f6f6f6",
				"ref-y": 0.5,
				"y-alignment": "middle"
			},
			".": {
				"data-tooltip-position": "left",
				"data-tooltip-position-selector": ".joint-stencil"
			}
		}
	};
    componentObj.id=id;
    componentObj.z = nodeNumber;    
    blobJson.cells.push(componentObj);
}

function addComponentToBlob(id,type,name,blobJson,nodeNumber){
    if(type.indexOf('Decision')!=-1){
       createDecisionNode1(id,name,blobJson,nodeNumber);
    }else if(type.indexOf('Start')!=-1){
       createStartNode1(id,blobJson,nodeNumber);
    }else if(type.indexOf('State')!=-1){
       createStateNode1(id,name,blobJson,nodeNumber);
    }else if(type.indexOf('Process')!=-1){
       createEntityNode1(id,name,blobJson,nodeNumber);
    }else if(type.indexOf('End')!=-1){
       createEndNode1(id,blobJson,nodeNumber);
    }else if(type.indexOf('Fork')!=-1){
       createForkNode(id,name,blobJson,nodeNumber);
    }else if(type.indexOf('Join')!=-1){
       createJoinNode(id,name,blobJson,nodeNumber);
    }else if(type.indexOf('SendSignal')!=-1){
       createSendSignal(id,blobJson,nodeNumber);
    }else if(type.indexOf('AcceptEvent')!=-1){
       createAcceptEvent(id,blobJson,nodeNumber);
    }
}

function getWidth(nodename,defaultWidth){
    if(nodename!=undefined && nodename!=null && nodename!=''){
        var length=nodename.length;
        length=length*5;
        if(length>300){
            return 300;
        }
        return length;
    }
    return defaultWidth;
}

function removeLineBreaks(input){
    return input.replace(/(\r\n|\n|\r)/gm," ");
}


module.exports.service = {
    import:importTestCaseFile,
    fieldMapping:applyFieldMapping,
    diagnose:diagnose,
    getsheetname:getexcelsheetnames,
    generate:generateModelPreview,
    saveModelVersion:saveModelVersion
};