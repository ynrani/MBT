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

function importFile(response, data, userData) {    
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
                var blobJson;
                if(data.fileType=='visio' || data.fileType=='xml' || data.fileType=='bpmn' ){  
                    
                    try {
                        if(data.fileType=='visio'){
                            if (!fs.existsSync(dir)) {
                                fs.mkdirSync(dir);
                            }
                            var extractFolderName= (data.fileName).replace(/\./gi, "_");
                            var extractFolderPath=dir+extractFolderName;
                            if (!fs.existsSync(extractFolderPath)) {
                                fs.mkdirSync(extractFolderPath);                            
                            }
                            fs.writeFileSync(dir+data.fileName, data.fileData,  "binary",function(err) { });
                            var zip = new AdmZip(dir+data.fileName);
                            zip.extractAllTo(extractFolderPath, true);
                            blobJson=parseFile(response,extractFolderPath+"\\visio\\pages\\");
                        } else if(data.fileType=='bpmn'){
                            blobJson=parseBPMNData(response,data.fileData);
                        }else{
                            blobJson=parseXMLData(response,data.fileData);
                            removeDirectory(dir);
                           } 
                      
                        var resp = {
                                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                                code: "200",
                                data: blobJson
                            }
                            global.appLog.debug("console:" + JSON.stringify(resp));
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
                    importExcelFile(response, data, userData);
                }
            }
        }
    });
}

function parseFile(response,extractDir){
    var filePath=extractDir+'page1.xml';
    var xml = fs.readFileSync(filePath,"utf8");
    return parseXMLData(response,xml);
}

function parseXMLData(response,xml){
    var blobJson = {"cells": []};
    var document = DOMParser.parseFromString(xml);
    var shapes = findShapeElements('Shape', document);
    var connections = findConnectElements('Connect', document);
    createModelDiagramJson(blobJson, shapes, connections);
    return blobJson;
}

function parseBPMNData(response,xml){
    var bpmnBlobJson = {"cells": []};
    var removedObjectId = [];
    var bpmnDocument =  DOMParser.parseFromString(xml);
    var bpmnShapeEvents = ['bpmn:boundaryEvent','bpmn:endEvent','bpmn:exclusiveGateway','bpmn:intermediateCatchEvent','bpmn:task','bpmn:startEvent','bpmn:intermediateThrowEvent','bpmn:textAnnotation','boundaryEvent','textAnnotation','endEvent','exclusiveGateway','intermediateCatchEvent','task','startEvent','intermediateThrowEvent']
    var bpmnShapeElement =['bpmndi:BPMNShape','BPMNShape'];
    var bpmnshapes =   findBPMNShapeElements(bpmnShapeEvents,bpmnDocument,bpmnShapeElement,removedObjectId);
    var bpmnshapeIds = getBPMNShapeIds(bpmnShapeEvents,bpmnDocument);
    var connectFlows = ['bpmn:messageFlow','bpmn:sequenceFlow','sequenceFlow','messageFlow']; 
    var bpmnEdges =    ['bpmndi:BPMNEdge','BPMNEdge'];
    var bpmnConnectionFlows = findBPMConnectElements(connectFlows, bpmnDocument,bpmnshapeIds,bpmnEdges,removedObjectId);
    var daigramJson = createBPMNModelDiagramJson(bpmnBlobJson,bpmnshapes,bpmnConnectionFlows);
    return daigramJson;
    
    
}

function getBPMNShapeIds(bpmnShapeEvents,bpmnDocument){
    var shapeIds=[];
    for(var i=0;i<bpmnShapeEvents.length;i++){
        var shapeEventNode = bpmnDocument.getElementsByTagName(bpmnShapeEvents[i]);
        for(let k=0;k<shapeEventNode.length;k++){
            for(var j=0; j<shapeEventNode[k].attributes.length ; j++){ 
                if(shapeEventNode[k].attributes[j].localName == "id"){
                    shapeIds.push(shapeEventNode[k].attributes[j].nodeValue);
                }
            }        
        }

    }
   return shapeIds;
}
function createBPMNModelDiagramJson(blobJson, shapes, connections){
            var linkblobJson = createBPMNConnectionLink(connections,blobJson);
            var linkShapeblobJson =createBPMNShape(shapes,linkblobJson);

            return linkShapeblobJson;

}

function createBPMNShape(shapes,linkblobJson){
    var connectionJson = linkblobJson;
    var bpmnShape = shapes;
    for(var k=0;k<bpmnShape.length;k++)
    {
       var bpmnShapes =bpmnShape[k];
       if(bpmnShapes.name.indexOf("exclusiveGateway")!=-1){
            createexclusiveGateway(bpmnShapes,connectionJson)
       }else if(bpmnShapes.name.indexOf("inclusiveGateway")!=-1){
            createinclusiveGateway(bpmnShapes,connectionJson)
       }else if(bpmnShapes.name.indexOf("parallelGateway")!=-1){
            createparallelGateway(bpmnShapes,connectionJson)
      }else if(bpmnShapes.name.indexOf("startEvent")!=-1){
            createstartEvent(bpmnShapes,connectionJson)
      }else if(bpmnShapes.name.indexOf("endEvent")!=-1){
            createEndEvent(bpmnShapes,connectionJson)    
      }else if((bpmnShapes.name.indexOf("task")!=-1) || (bpmnShapes.name.indexOf("boundaryEvent")!=-1)){
            createTaskEvent(bpmnShapes,connectionJson)
      }else if((bpmnShapes.name.indexOf("intermediateCatchEvent") !=-1)){
            createInterCatchEvent(bpmnShapes,connectionJson)
      }else if((bpmnShapes.name.indexOf("textAnnotation") !=-1)){
           createTextAnnotation(bpmnShapes,connectionJson)
      }
    }
    //|| (bpmnShapes.name.indexOf("intermediateThrowEvent") !=-1 )
    return connectionJson;

 }

 function  createTextAnnotation(bpmnShapes,linkblobJson){
    var catchObj =
    
    { 
        "size":{ 
           "width":80,
           "height":40
        },
        "type":"bpmn.Annotation",
        "wingLength":20,
        "content":"",
        "position":{ 
           "x":715,
           "y":160
        },
        "angle":0,
        "id":"7ea98862-f5b4-4837-8c8c-a976101b96a3",
        "z":1,
        "attrs":{ 
           ".body":{ 
              "fill-opacity":0.4,
              "fill":"#61549C"
           },
           ".stroke":{ 
              "fill":"#61549C",
              "d":"M 20 0 L 0 0 0 40 20 40"
           },
           ".content":{ 
              "html":""
           },
           ".":{ 
              "data-tooltip-position":"bottom"
           },
           ".fobj":{ 
              "width":80,
              "height":40
           },
           "div":{ 
              "style":{ 
                 "width":80,
                 "height":40
              }
           }
        }
     }
    catchObj.id=bpmnShapes.id;
    catchObj.content=bpmnShapes.text;
    catchObj.position.x=bpmnShapes.x;
    catchObj.position.y=bpmnShapes.y;
    linkblobJson.cells.push(catchObj);
 }

 function createInterCatchEvent(bpmnShape,linkblobJson){
     var catchObj =
    
        {
            "type": "bpmn.Event",
            "size": {
                "width": 40,
                "height": 40
            },
            "eventType": "intermediate",
            "position": {
                "x": 285,
                "y": 45
            },
            "angle": 0,
            "id": "",
            "z": 2,
            "icon": "message",
            "attrs": {
                ".inner": {
                    "visibility": "visible"
                },
                "image": {
                    "xlink:href": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUxMiA1MTIiIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik00NzkuOTk4LDY0SDMyQzE0LjMyOSw2NCwwLDc4LjMxMiwwLDk2djMyMGMwLDE3LjY4OCwxNC4zMjksMzIsMzIsMzJoNDQ3Ljk5OEM0OTcuNjcxLDQ0OCw1MTIsNDMzLjY4OCw1MTIsNDE2Vjk2ICBDNTEyLDc4LjMxMiw0OTcuNjcxLDY0LDQ3OS45OTgsNjR6IE00MTYsMTI4TDI1NiwyNTZMOTYsMTI4SDQxNnogTTQ0OCwzODRINjRWMTYwbDE5MiwxNjBsMTkyLTE2MFYzODR6Ii8+PC9zdmc+"
                },
                ".label": {
                    "text": ""
                },
                ".": {
                    "data-tooltip-position": "bottom"
                }
            }
        
    }
    catchObj.id=bpmnShape.id;
    catchObj.attrs[".label"].text=bpmnShape.text;
    catchObj.position.x=bpmnShape.x;
    catchObj.position.y=bpmnShape.y;
    linkblobJson.cells.push(catchObj); 
 }

 function createTaskEvent(bpmnShape,linkblobJson){
     var taskObj =
     {
        "size": {
            "width": 80,
            "height": 60
        },
        "type": "bpmn.Activity",
        "activityType": "task",
        "subProcess": false,
        "content": "",
        "position": {
            "x": 385,
            "y": 63
        },
        "angle": 0,
        "id": "",
        "z": 9,
        "icon": "none",
        "attrs": {
            ".body": {
                "fill": "#ff0000"
            },
            "content": "this actciie",
            ".inner": {
                "visibility": "hidden"
            },
            "path": {
                "ref": ".outer"
            },
            
            "image": {
                "ref": ".outer",
                "ref-dy": "",
                "ref-y": 5,
                "xlink:href": ""
            },
            "text": {
                "ref-y": 0.5
            },
            ".content": {
                "html": ""
            },
            ".": {
                "data-tooltip-position": "bottom"
            },
            ".fobj": {
                "width": 20,
                "height": 20
            },
            "div": {
                "style": {
                    "width": 20,
                    "height": 20
                }
            },
            ".fobj div": {
                "style": {
                    "verticalAlign": "middle",
                    "paddingTop": 0
                }
            },
            ".outer": {
                "stroke-width": 1,
                "stroke-dasharray": "none"
            },
            ".sub-process": {
                "visibility": "hidden",
                "data-sub-process": ""
            }
        }
    }
    taskObj.id=bpmnShape.id;
    taskObj.content=bpmnShape.text;
    taskObj.position.x=bpmnShape.x;
    taskObj.position.y=bpmnShape.y;
    linkblobJson.cells.push(taskObj); 

 }
 function  createEndEvent(bpmnShape,linkblobJson){
   var endObj =
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
    "position":{
      "x":100,
      "y":200
    },
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
        
endObj.id=bpmnShape.id;
//endObj.attrs[".label"].text=bpmnShape.text;
endObj.position.x=bpmnShape.x;
endObj.position.y=bpmnShape.y;
linkblobJson.cells.push(endObj);        
 } 
 function  createstartEvent(bpmnShape,linkblobJson){
   var startObj=  {
    "type": "fsa.StartState",
    "size": {
        "width": 20,
        "height": 20
    },
    "angle": 0,
    "preserveAspectRatio": true,
    "id": "",
    "z": 1,
    "posiiton":{
      "x":100,
      "y":200
    },
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
    startObj.id=bpmnShape.id;
    linkblobJson.cells.push(startObj);
 }


 function createparallelGateway(bpmnShape,linkblobJson){
   var parallelGatewayObj =
   {
	"type": "bpmn.Gateway",
	"size": {
		"width": 40,
		"height": 40
	},
	"position": {
		"x": 225,
		"y": 100
	},
	"angle": 0,
	"id": "",
	"z": 7,
	"icon": "circle",
	"attrs": {
		".body": {
			"fill": "#61549C"
        },
        ".label": {
            "text": "inclusive"
        },
		"image": {
			"xlink:href": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gULEBE3DEP64QAAAwlJREFUaN7dmktrU0EUx38ZmmBbfEIL2hSjkYKC1EW6EDFudC+404/gE6WKSvGxERQfIH4AX1T9EOKrCrYurVrbgsZWoaBVixDbpC6ci+Fyz9ybZG478cBs7syc+Z+5c86c+c8ksCPrgW1ADtgEbARafG1+AW+AYWAIGADGWUTZAJwHxoD5GssocA7ILiTwLcADoFQHcH8pAfeB7jiBtwO3gLJF4P5S1mO02wa/C5iMEbi/TAI7bYE/Y3m5VLOs+sLAJULqrgKHIxhZBp4DT4FX2jkLGoinq1M7fg7YDmwFVATd14CjFboiy5UIs/QBOAmka/izaeCU1hE2zuVqlZ8IUfgVOAA0WViiTcBBrdM0Zm9UhTuAOYOiRzXOeJh0Ak8M484B+TAlK4BPBiU3gWSMoTqpw6g0fgFYblJww9D5dojT25IEcMeA47rUsdsQLp9FmPmURSNSOqpJS2lzUKd+ocN3IBNx5mz+oXXADwHTXX/jjMFxjy1iwtgrYJoF1lY27BMafozZaaMspYKA7XRlw7f1xt4Y5biA7bXXIGv4TW0OGNCmsQRhzCidlwTJADDlgAFTwAuhLq+AHqHyMe6IhKVHAV1C5ZBDBkhYupThPPreIQNGJTJBGXKLLw4Z8NmQu/Fb8PCkQwakBIxFRWPLvAJmhMpWh4AuFb7PKGBaqFzjkAGrhe/TSjNrQZJ1yAAJy5gCRoTKnEMGSFhGFDBoOBu7IhKWQe8wLRFLHQ6A7zCcFNNK59vvAjoqYK8DBuwTCLBhTUD8Hweahj9S2jjU297VqzrU26BVmi2yEjXRKg1PbHnpqYla7AeWxAi+GbhHHdSit2mYyN2XQQ5kQTJ6Y6qL3PUkCr2+H7v0+jcs0eueRLngGNeKa9mxY73g8JzpEtHusorAQ/7e+e7WUWIl//jSVTrK7QEu6KgW9d7tYr3B44iBWPJfkZZ8pZ4r2VngkC0HywMTLNwN5YSBcKtZWoGzernEBbyox2iJc6Np2KcGfnHisYet1CDouc2yCjbhp07MrD+3+QNxi4JkAscRswAAAABJRU5ErkJggg=="
		},
		".": {
			"data-tooltip-position": "bottom"
		}
	}
}
parallelGatewayObj.id=bpmnShape.id;
parallelGatewayObj.attrs[".label"].text=bpmnShape.text;
parallelGatewayObj.position.x = bpmnShape.x;
parallelGatewayObj.position.y = bpmnShape.y;
linkblobJson.cells.push(parallelGatewayObj);

 }

 function createinclusiveGateway(bpmnShape,linkblobJson){
     var inclusiveGateWayObj=
     {
        "type": "bpmn.Gateway",
        "size": {
            "width": 40,
            "height": 40
        },
        "position": {
            "x": 225,
            "y": 100
        },
        "angle": 0,
        "id": "",
        "z": 7,
        "icon": "circle",
        "attrs": {
            ".body": {
                "fill": "#61549C"
            },
            ".label": {
				"text": "inclusive"
			},
            "image": {
                "xlink:href": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gULEBE3DEP64QAAAwlJREFUaN7dmktrU0EUx38ZmmBbfEIL2hSjkYKC1EW6EDFudC+404/gE6WKSvGxERQfIH4AX1T9EOKrCrYurVrbgsZWoaBVixDbpC6ci+Fyz9ybZG478cBs7syc+Z+5c86c+c8ksCPrgW1ADtgEbARafG1+AW+AYWAIGADGWUTZAJwHxoD5GssocA7ILiTwLcADoFQHcH8pAfeB7jiBtwO3gLJF4P5S1mO02wa/C5iMEbi/TAI7bYE/Y3m5VLOs+sLAJULqrgKHIxhZBp4DT4FX2jkLGoinq1M7fg7YDmwFVATd14CjFboiy5UIs/QBOAmka/izaeCU1hE2zuVqlZ8IUfgVOAA0WViiTcBBrdM0Zm9UhTuAOYOiRzXOeJh0Ak8M484B+TAlK4BPBiU3gWSMoTqpw6g0fgFYblJww9D5dojT25IEcMeA47rUsdsQLp9FmPmURSNSOqpJS2lzUKd+ocN3IBNx5mz+oXXADwHTXX/jjMFxjy1iwtgrYJoF1lY27BMafozZaaMspYKA7XRlw7f1xt4Y5biA7bXXIGv4TW0OGNCmsQRhzCidlwTJADDlgAFTwAuhLq+AHqHyMe6IhKVHAV1C5ZBDBkhYupThPPreIQNGJTJBGXKLLw4Z8NmQu/Fb8PCkQwakBIxFRWPLvAJmhMpWh4AuFb7PKGBaqFzjkAGrhe/TSjNrQZJ1yAAJy5gCRoTKnEMGSFhGFDBoOBu7IhKWQe8wLRFLHQ6A7zCcFNNK59vvAjoqYK8DBuwTCLBhTUD8Hweahj9S2jjU297VqzrU26BVmi2yEjXRKg1PbHnpqYla7AeWxAi+GbhHHdSit2mYyN2XQQ5kQTJ6Y6qL3PUkCr2+H7v0+jcs0eueRLngGNeKa9mxY73g8JzpEtHusorAQ/7e+e7WUWIl//jSVTrK7QEu6KgW9d7tYr3B44iBWPJfkZZ8pZ4r2VngkC0HywMTLNwN5YSBcKtZWoGzernEBbyox2iJc6Np2KcGfnHisYet1CDouc2yCjbhp07MrD+3+QNxi4JkAscRswAAAABJRU5ErkJggg=="
            },
            ".": {
                "data-tooltip-position": "bottom"
            }
        }
    }
    inclusiveGateWayObj.id=bpmnShape.id;
    inclusiveGateWayObj.attrs[".label"].text=bpmnShape.text;
    inclusiveGateWayObj.position.x=bpmnShape.x;
    inclusiveGateWayObj.position.y=bpmnShape.y;
    linkblobJson.cells.push(exculsiveGateWayObj);

 }

 function createexclusiveGateway(bpmnShape,linkblobJson)
 {
   var exculsiveGateWayObj =
   {
    "type": "bpmn.Gateway",
	"size": {
		"width": 40,
		"height": 40
	},
	"position": {
		"x": 225,
		"y": 90
	},
	"angle": 0,
	"id": "",
	"z": 7,
	"icon": "cross",
	"attrs": {
		".body": {
			"fill": "#61549C"
        },
        ".label": {
            "text": "inclusive"
        },
		"image": {
			"xlink:href": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik0yMi4yNDUsNC4wMTVjMC4zMTMsMC4zMTMsMC4zMTMsMC44MjYsMCwxLjEzOWwtNi4yNzYsNi4yN2MtMC4zMTMsMC4zMTItMC4zMTMsMC44MjYsMCwxLjE0bDYuMjczLDYuMjcyICBjMC4zMTMsMC4zMTMsMC4zMTMsMC44MjYsMCwxLjE0bC0yLjI4NSwyLjI3N2MtMC4zMTQsMC4zMTItMC44MjgsMC4zMTItMS4xNDIsMGwtNi4yNzEtNi4yNzFjLTAuMzEzLTAuMzEzLTAuODI4LTAuMzEzLTEuMTQxLDAgIGwtNi4yNzYsNi4yNjdjLTAuMzEzLDAuMzEzLTAuODI4LDAuMzEzLTEuMTQxLDBsLTIuMjgyLTIuMjhjLTAuMzEzLTAuMzEzLTAuMzEzLTAuODI2LDAtMS4xNGw2LjI3OC02LjI2OSAgYzAuMzEzLTAuMzEyLDAuMzEzLTAuODI2LDAtMS4xNEwxLjcwOSw1LjE0N2MtMC4zMTQtMC4zMTMtMC4zMTQtMC44MjcsMC0xLjE0bDIuMjg0LTIuMjc4QzQuMzA4LDEuNDE3LDQuODIxLDEuNDE3LDUuMTM1LDEuNzMgIEwxMS40MDUsOGMwLjMxNCwwLjMxNCwwLjgyOCwwLjMxNCwxLjE0MSwwLjAwMWw2LjI3Ni02LjI2N2MwLjMxMi0wLjMxMiwwLjgyNi0wLjMxMiwxLjE0MSwwTDIyLjI0NSw0LjAxNXoiLz48L3N2Zz4="
        }
    }   
   };
  exculsiveGateWayObj.attrs[".label"].text=bpmnShape.text;
  exculsiveGateWayObj.id=bpmnShape.id;
  exculsiveGateWayObj.position.x=bpmnShape.x;
  exculsiveGateWayObj.position.y=bpmnShape.y;
  linkblobJson.cells.push(exculsiveGateWayObj);
  
 }


function createBPMNConnectionLink(connections,blobJson){
     var blobJsonConnection = blobJson
     var connectionKey = connections.keys()
     for(var i=0;i<connectionKey.length;i++){
        var connObj=connections.get(connectionKey[i]);
        if(connObj!=undefined){
            createBPMNLink(blobJsonConnection,connObj,connectionKey[i]);
        }
     }
    return blobJsonConnection; 
}

function createBPMNLink(blobJson,connObj,id){
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
        "z": 8,
        "vertices": [{
            "x": 145,
            "y": 295
        }],
        "labels": [{
            "attrs": {
                "text": {
                    "text": ""
                }
            }
        }],
        "attrs": {},
        "waypoint":{
            "x":1,
            "y":2
        }
    };
componentObj.id = id;
componentObj.source.id = connObj.sourceId;
componentObj.target.id = connObj.targetId;
componentObj.waypoint.x = connObj.x;
componentObj.waypoint.y = connObj.y; 
blobJson.cells.push(componentObj);
}

function findBPMConnectElements(elements, xmlDocument,bpmnshapeIds,bpmnEdges,removedObjectId) {
    var connectFlowElements = elements;
    var bpmnConnections=new HashMap();
    var removeIdFromLink = removedObjectId;
    for(var k=0;k<connectFlowElements.length;k++){
        var nodes = xmlDocument.getElementsByTagName(connectFlowElements[k]);
        for (var i = 0; i < nodes.length; i++) {  
            var connection_id=nodes[i].attributes[0].nodeValue;
            var sourceId;
            var targetId; 
            var x;
            var y;

            for(var index=0;index< nodes[i].attributes.length;index++){
                     var refName = nodes[i].attributes[index].name;
                     if(refName=="sourceRef"){
                        sourceId =nodes[i].attributes[index].nodeValue;
                     }else if(refName=="targetRef"){
                        targetId =nodes[i].attributes[index].nodeValue;
                     }
                
            }

            if(bpmnshapeIds.includes(sourceId) && bpmnshapeIds.includes(targetId))
            { 
                    if(bpmnConnections.get(connection_id)==null) {
                        bpmnConnections.set(connection_id, {
                            sourceId : "",
                            targetId  : "",
                            flowName : connectFlowElements[k],
                            x: "",
                            y: ""

                        });
                    }
                    var valueObj=bpmnConnections.get(connection_id);
                    valueObj.sourceId = sourceId;
                    valueObj.targetId = targetId;
            } 

        }
    }
 // console.log(bpmnConnections);
    for(var index=0;index<bpmnEdges.length;index++){
       var edgeNode =  xmlDocument.getElementsByTagName(bpmnEdges[index]);
        for(var edgeIndex = 0;edgeIndex < edgeNode.length;edgeIndex++){
               for(var edgeNodeIndex=0;edgeNodeIndex<edgeNode[edgeIndex].attributes.length;edgeNodeIndex++)   {
                        if(edgeNode[edgeIndex].attributes[edgeNodeIndex].localName=="bpmnElement"){
                                var bpmnElementId = edgeNode[edgeIndex].attributes[edgeNodeIndex].nodeValue;
                                if(bpmnConnections.get(bpmnElementId)!=undefined){
                                    var conObj = bpmnConnections.get(bpmnElementId);
                                       var edgeChildNodes = edgeNode[edgeIndex].childNodes;
                                       for(var i=0;i<edgeChildNodes.length;i++){
                                                  if(edgeChildNodes[i].nodeType == 1){
                                                       if(edgeChildNodes[i].localName == "waypoint"){
                                                         var childAttr = edgeChildNodes[i].attributes;
                                                         for(var ii=0;ii<childAttr.length;ii++){
                                                            var attrVal = childAttr[ii];
                                                            if(attrVal.nodeName=="x"){
                                                                conObj.x = attrVal.nodeValue;
                                                            }else if(attrVal.nodeName=="y"){
                                                                conObj.y = attrVal.nodeValue
                                                            }
                                                        }
                                                       break; 
                                                    }
                                                  }
                                       }
                                    
                                }    
                        }
               }                   
        }    

    }
  
    var sourceTargetID = new HashMap(); 
     for(var key of bpmnConnections.keys()){
          
         var linkObj = bpmnConnections.get(key);
         for(var i=0;i<removeIdFromLink.length;i++){
              if(linkObj.sourceId==removeIdFromLink[i]){
                sourceTargetID.set(removeIdFromLink[i],linkObj.targetId);
                bpmnConnections.delete(key);
              }    
         }

     }
     
     for(var bpmnkeys of bpmnConnections.keys()){
        var  bpmnObj = bpmnConnections.get(bpmnkeys);
        for(var j=0;j<removeIdFromLink.length;j++){
              if(bpmnObj.targetId === removeIdFromLink[j]){
                bpmnObj.targetId =   sourceTargetID.get(removeIdFromLink[j]);
              }
          }
     }
      

    return bpmnConnections;
}

function findBPMNShapeElements(bpmnShapeEvents,bpmnDocument,bpmnShapeElement,removedObjectId){
    var bpmnShapeEventModels= bpmnShapeEvents;
    var shapes=[];
    var shapeMap = new HashMap();
    for(let k=0;k<bpmnShapeEventModels.length;k++){
        var shapeEventNode = bpmnDocument.getElementsByTagName(bpmnShapeEventModels[k]);
        for(let i=0;i<shapeEventNode.length;i++){
            var shape ={
                id : "",
                name  : "",
                x  : "",
                y  : "",
                text : ""
            };
            shape.name=bpmnShapeEventModels[k];
            var textContent="";
            
            if((shape.name.indexOf("exclusiveGateway")!=-1) || (shape.name.indexOf("textAnnotation")!=-1))
             { 
                textContent =shapeEventNode[i].textContent;
            } 
           
           
            for(var j=0; j<shapeEventNode[i].attributes.length ; j++){ 
                if(shapeEventNode[i].attributes[j].localName == "id"){
                    if(shape.name=="bpmn:intermediateThrowEvent" || shape.name=="intermediateThrowEvent"){
                        removedObjectId.push(shapeEventNode[i].attributes[j].nodeValue);
                    }
                        shape.id=shapeEventNode[i].attributes[j].nodeValue;
                   }
                    if(shapeEventNode[i].attributes[j].localName == "name"){
                    shape.text=shapeEventNode[i].attributes[j].nodeValue+" "+textContent;
                   }else{
                      shape.text=textContent;
                     
                   }      
                      
            }

            shapes.push(shape);
        }
       
      for(var l=0;l<bpmnShapeElement.length;l++){  
        var daigramBounds = bpmnDocument.getElementsByTagName(bpmnShapeElement[l]);  
        
           for(let k=0;k<daigramBounds.length;k++){
               for(let i=0;i<daigramBounds[k].attributes.length;i++){
                   if(daigramBounds[k].attributes[i].localName=="bpmnElement"){
                       var boundId = daigramBounds[k].attributes[i].nodeValue;
                      if(shapeMap.get(boundId)==null){
                          shapeMap.set(boundId,{
                           "x":" ",
                           "y":" "
                          });
                          var boundObj =  shapeMap.get(boundId);
                           var childNodesVal = daigramBounds[k].childNodes;
                           for(var xy =0;xy<childNodesVal.length;xy++){
                                 if(childNodesVal[xy].nodeType == 1){
                                     if(childNodesVal[xy].localName == 'Bounds'){
                                        var childAttr = childNodesVal[xy].attributes;
                                        for(var ii=0;ii<childAttr.length;ii++){
                                                 var attrVal = childAttr[ii];
                                               if(attrVal.nodeName=="x"){
                                                  boundObj.x = attrVal.nodeValue;
                                               }else if(attrVal.nodeName=="y"){
                                                  boundObj.y = attrVal.nodeValue
                                               }
                                           
                                        }
                                     }
                                     
                                 }
                             }
                        
                      }
                      
                   }
                   
                }
            
  
           }
           
      
      
      for(var node_id=0;node_id<shapes.length;node_id++){
          if(shapeMap.get(shapes[node_id].id)!=undefined){
              shapes[node_id].x=  shapeMap.get(shapes[node_id].id).x;
              shapes[node_id].y=  shapeMap.get(shapes[node_id].id).y;
          }
       }  
    } 
   }
  return shapes;
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
};



function findShapeElements(element, xmlDocument) {
    var nodes = xmlDocument.getElementsByTagName(element);
    var shapes=[];
    if (nodes != null) {
        for (var i = 0; i < nodes.length; i++) {
            var shape ={
                id : "",
                name  : "",
                width  : "",
                height  : "",
                text : ""
            };
            for(var j=0; j<nodes[i].attributes.length ; j++){
                if(nodes[i].attributes[j].nodeName==="ID"){
                    shape.id=nodes[i].attributes[j].nodeValue;
                }else if(nodes[i].attributes[j].nodeName==="Name"){
                    shape.name=nodes[i].attributes[j].nodeValue;
                }
            }
            if(nodes[i].getElementsByTagName("Text").length) {
                var textNode = nodes[i].getElementsByTagName("Text")[0];
                shape.text =textNode.textContent;
            }
            shape.width =nodes[i].childNodes[2].attributes[1].nodeValue;
            shape.height =nodes[i].childNodes[3].attributes[1].nodeValue;
            shapes.push(shape);
        }
    }
    return shapes;
}

function findConnectElements(element, xmlDocument) {
    var nodes = xmlDocument.getElementsByTagName(element);
    var shapes=[];
    var connections=new HashMap();
    if (nodes != null) {
        for (var i = 0; i < nodes.length; i++) {
            var id=nodes[i].attributes[0].nodeValue;
            if(connections.get(id)==null) {
                connections.set(id, {
                    sourceId : "",
                    targetId  : ""
                });
            }
            var valueObj=connections.get(id);
            if(nodes[i].attributes[1].nodeValue=="EndX") {
                valueObj.targetId=nodes[i].attributes[3].nodeValue
            }else if (nodes[i].attributes[1].nodeValue=="BeginX"){
                valueObj.sourceId=nodes[i].attributes[3].nodeValue
            }
        }
    }
    return connections;
}

function createModelDiagramJson(blobJson,shapes,connections){
    for (var i = 0; i < shapes.length; i++) {
        var shape=shapes[i];
        if(shape.name.indexOf('Dynamic connector')!=-1){
            var connObj=connections.get(shape.id);
            if(connObj!=undefined){
                createLink(shape,blobJson,connObj);
            }
        }else if (shape.name.indexOf('Decision')!=-1){
            createDecisionNode(shape,blobJson);
        }else if (shape.name.indexOf('Process')!=-1 || shape.name.indexOf('Off-page reference')!=-1){
            createEntityNode(shape,blobJson);
        }else if (shape.name.indexOf('On-page reference')!=-1){
            if(shape.text.indexOf('Start')!=-1){
                createStartNode(shape,blobJson);
            }else if(shape.text.indexOf('Exit')!=-1){
                createEndNode(shape,blobJson);
            }  else{
                createStateNode(shape,blobJson);
            }
        }else if (shape.name.indexOf('Start/End')!=-1){
            if(shape.text.indexOf('Start')!=-1){
                createStartNode(shape,blobJson);
            }else if(shape.text.indexOf('End')!=-1){
                createEndNode(shape,blobJson);
            }  
        }
    }
    return blobJson;
}



function createLink(shape,blobJson,connection) {
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
            "z": 8,
            "vertices": [{
                "x": 145,
                "y": 295
            }],
            "labels": [{
                "attrs": {
                    "text": {
                        "text": ""
                    }
                }
            }],
            "waypoint":{
                "x":1,
                "y":2
            },
            "attrs": {}
        };
    componentObj.id = shape.id;
    componentObj.labels[0].attrs.text.text = shape.text;
    componentObj.source.id = connection.sourceId;
    componentObj.target.id = connection.targetId;
    componentObj.waypoint.x = connection.x;
    componentObj.waypoint.y = connection.y; 
    blobJson.cells.push(componentObj);
}

function createDecisionNode(shape,blobJson){
    var componentObj=
        {
            "type": "erd.Relationship",
            "size": {
                "width": 60,
                "height": 60
            },
            "position": {
                "x": 185,
                "y": 210
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
    componentObj.id=shape.id;
    componentObj.attrs.text.text=shape.text;
    blobJson.cells.push(componentObj);
}
function createEntityNode(shape,blobJson){
    var componentObj=
        {
            "type": "erd.Entity",
            "size": {
                "width": 90,
                "height": 36
            },
            "position": {
                "x": 240,
                "y": 320
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
    componentObj.id=shape.id;
    componentObj.attrs.text.text=shape.text;
    blobJson.cells.push(componentObj);
}

function createStateNode(shape,blobJson){
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
    componentObj.id=shape.id;
    componentObj.attrs.text.text=shape.text;
    blobJson.cells.push(componentObj);
}


function createStartNode(shape,blobJson){
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
    componentObj.id=shape.id;
    blobJson.cells.push(componentObj);
}

function createEndNode(shape,blobJson){
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
    componentObj.id=shape.id;
    blobJson.cells.push(componentObj);
}

function importExcelFile(response, data, userData) {    
    try {        
          var workbook = xlsx.read(data.fileData,{type: 'binary'});
          var versionId=data.versionId;
          //var sheet_name_list = workbook.SheetNames;
          var blobJson = {};
          var headerNames=[];
          //global.appLog.debug(sheet_name_list);
          //sheet_name_list.forEach(function(y) {
              var worksheet = workbook.Sheets["Test Case"];
              var headers = {};
              var data = [];
              var prevRowNum=0;
              for(z in worksheet) {
                  if(z[0] === '!') continue;
                  //parse out the column, row, and value
                  var row = parseInt(z.substring(1));                  
                  if(row < 1) continue;
                 // if(row > 45) break;
                  var col = z.substring(0,1);
                  var value = worksheet[z].v;
                  if(row!=prevRowNum && prevRowNum!=(row-1)){
                    data[row-1]={};
                  }
                  prevRowNum=row;
                  //store header names
                  if(row == 1) {
                      headers[col] = value;
                      headerNames.push(value);
                      continue;
                  }          
                  if(!data[row]) data[row]={};
                  data[row][headers[col]] = value;
              }
              data.shift();
              data.shift();
              //global.appLog.debug(data);
              var count=0;
              var isSIExists=false;
              var isCNExists=false;
              var isCTExists=false;
              for (var index = 0; index < headerNames.length; index++){
                    var colName=headerNames[index];        
                    if(colName=='SCENARIO ID'){
                        isSIExists=true;
                        count++;
                    }else if(colName=='COMPONENT NAME'){
                        isCNExists=true;
                        count++;
                    }else if (colName=='COMPONENT TYPE'){
                        isCTExists=true;
                        count++;
                    }
                    if(count==3) break;
              }              
              if(count<3){
                   var msg='';
                  if(!isSIExists){
                      msg=msg+'\"SCENARIO ID\"';
                  }
                  if(!isCNExists){
                      if(msg!=''){
                          msg=msg+', \"COMPONENT NAME\"';
                      }else{
                          msg=msg+'\"COMPONENT NAME\"';
                      }
                  }
                  if(!isCTExists){
                      if(msg!=''){
                          msg=msg+', \"COMPONENT TYPE\"';
                      }else{
                          msg=msg+'\"COMPONENT TYPE\"';
                      }
                  }
                  if(count==2){
                    msg=msg+"  is ";
                  }else{
                    msg=msg+"  are ";
                  }
                  msg=msg+"required to import the test case. <br/> please update the test case template configuration to include these columns while exporting.";
                  global.appLog.debug(msg);
                  var resp={
                      msg:msg,
                      code:global.errorCodes.errorCode.codes.RESPONSE_FAILURE
                  }
                  response.end(JSON.stringify(resp));
              }else{
                 createBlobAndScenarioPath(response,versionId,data,userData);   
              }           
         // });           
    }catch(e){
        global.appLog.debug(e);
        var resp={
            msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
            code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
        }
        response.end(JSON.stringify(resp));
    }
}

function createBlobAndScenarioPath(response,versionId,inputData,userData){
  var nodeIdMap=new HashMap(); 
  var scenarioId='';
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
 // var joinCount=0;
  for(var i=0;i<inputData.length;i++){
      var item=inputData[i];
      if(JSON.stringify(item) != '{}') {
        var scenarioNodes=[]; 
        var component=checkIfExists('COMPONENT NAME',item);
        var nodeType=checkIfExists('COMPONENT TYPE',item);
        var criticality=checkIfExists('CRITICALITY',item);
        var riskExposure=checkIfExists('RISK EXPOSURE',item);
        var stepIndex=checkIfExists('STEP ID',item);
        var stepDesc=checkIfExists('STEP DESCRIPTION',item); 
        var linkText='';   
        if(nodeType!='' && component!=''){
            if(checkIfExists('SCENARIO ID',item)!=''){
                scenarioNodes=[];
                scenarioId=checkIfExists('SCENARIO ID',item);
                scenarioMap.set(scenarioId,scenarioNodes);
                appendedNodeName='';
                decisionCount=0;
                forkCount=0;
                //joinCount=0;
            }else{
                scenarioNodes=scenarioMap.get(scenarioId);
            }    
            if(nodeType=='Decision' || nodeType=='Fork'){                
                appendedNodeName='';
                if(component.includes(" = ")){
                    var names=component=component.split(' = ');
                    component=names[0];
                    linkText=names[1];
                }
                if(scenarioNodes.length>0){
                    var prevNode=scenarioNodes[scenarioNodes.length-1];
                    if(prevNode.type=='Link'){
                        appendedNodeName=prevNode.name;
                        if(scenarioNodes.length>1){
                            var linkPrevNode=scenarioNodes[scenarioNodes.length-2];
                            if(linkPrevNode.type=='Join'){
                                appendedNodeName=appendedNodeName+linkPrevNode.name;
                                decisionCount=0;
                                forkCount=0;
                            }
                        }
                    }else if(prevNode.type=='Join'){
                        appendedNodeName=prevNode.name;
                        decisionCount=0;
                        forkCount=0;
                    }
                }
                if(nodeType=='Decision')  decisionCount++;
                if(nodeType=='Fork')  forkCount++;
               // if(nodeType=='Join')  joinCount++;
                if(decisionCount>0) appendedNodeName=appendedNodeName+'Decision'+decisionCount+'-';
                if(forkCount>0) appendedNodeName=appendedNodeName+'Fork'+forkCount+'-';
               // if(joinCount>0) appendedNodeName=appendedNodeName+'Join'+joinCount+'-';
                //appendedNodeName=appendedNodeName+component;
            }else {
                if(scenarioNodes.length>1){
                    var prevNode=scenarioNodes[scenarioNodes.length-1];
                    var linkPrevNode=scenarioNodes[scenarioNodes.length-2]
                    if(prevNode.type=='Link' && linkPrevNode.type=='Join'){
                        appendedNodeName=prevNode.name; 
                        appendedNodeName=appendedNodeName+linkPrevNode.name;                       
                    }else if(prevNode.type=='Join'){
                        appendedNodeName=prevNode.name;
                    }
                }
            }
            if(appendedNodeName==''){
                appendedNodeName=component;
            }else{
                appendedNodeName=appendedNodeName+component;
            }        
            var nodeId=appendedNodeName+nodeType;
            if(nodeType=='Join'){
                nodeId=component+nodeType;
            }
            var nodeUUID='';
            if(nodeType!='Link'){    
                if(nodeIdMap.get(nodeId)==undefined) {
                    nodeUUID=uuidv5(nodeId, uuidv1());
                    nodeIdMap.set(nodeId,nodeUUID);
                    nodeNumber++;                                
                    addComponentToBlob(nodeUUID,nodeType,component,blobJson,nodeNumber);
                    if(nodeType=='Fork'){
                        forkMap.set(appendedNodeName,{
                            blobIndex:blobJson.cells.length-1,
                            inPorts:[],
                            inPortsData:[],
                            outPorts:[],
                            outPortsData:[],
                            inLinkIndex:'',
                            outLinkIndex:[]
                        });
                    }else if (nodeType=='Join'){
                        joinMap.set(component,{
                            blobIndex:blobJson.cells.length-1,
                            inPorts:[],
                            inPortsData:[],
                            outPorts:[],
                            outPortsData:[],
                            inLinkIndex:[],
                            outLinkIndex:''
                        });
                    }else if (nodeType=='Decision'){
                        decisionMap.set(appendedNodeName,{
                            blobIndex:blobJson.cells.length-1,                           
                            inLinkIndex:'',
                            inPortsData:[],                            
                            outLinkIndex:[],
                            outPortsData:[],
                        });
                    }                    
                }else{
                    nodeUUID=nodeIdMap.get(nodeId);
                }
            }  
            scenarioNode={
                id: nodeUUID,
                name: component,
                type: nodeType,
                criticality: criticality,
                riskExposure: riskExposure,
                appendedName: appendedNodeName,
                testSteps:[],
                linkTxt:linkText
            }
            if(nodeType=='Join'){
                scenarioNode.appendedName=component;
            }
            scenarioNodes.push(scenarioNode);
            scenarioMap.set(scenarioId,scenarioNodes);       
        } 
        if(stepIndex!='' && stepDesc!=''){
            var addedScenarioNodes=scenarioMap.get(scenarioId);
            var testStepData=addedScenarioNodes[addedScenarioNodes.length-1].testSteps;
            testStepData.push({index: stepIndex,
                desc: stepDesc});
            addedScenarioNodes[addedScenarioNodes.length-1].testSteps=testStepData;
        }
    }else{
        global.appLog.debug('skipped empty Object');
    }
  }
  if(scenarioMap!=null){    
    scenarioMap.forEach(function(value, key) {            
        var scenarioItems=value;
        var nodesLength=scenarioItems.length;
        for (var index = 0; index < nodesLength; index++){
            var nextIndex =index+1; 
            var testStepData=scenarioItems[index].testSteps;
            if(scenarioItems[index].type!='Link'){
                nodeIdTestData.set(scenarioItems[index].id,testStepData);
            }
            var nodeUUID=scenarioItems[index].id;                        
            if(nextIndex<nodesLength){
                if(scenarioItems[nextIndex].type=='Link'){                   
                    continue;                    
                }    
                var nodeId='';
                var isLinkCreated=false;  
                var isEmptyLink=false;              
                if(scenarioItems[index].type=='Link'){
                    nodeId=scenarioItems[index].appendedName+scenarioItems[nextIndex].name;
                    if(nodeIdMap.get(nodeId)==undefined) {
                        nodeUUID=uuidv5(nodeId, uuidv1());
                        nodeIdMap.set(nodeId,nodeUUID);  
                        nodeNumber++;                      
                        createLink1(nodeUUID,scenarioItems[index].name,scenarioItems[index-1].id,scenarioItems[nextIndex].id,blobJson,nodeNumber);
                        isLinkCreated=true;
                    }else{
                        nodeUUID=nodeIdMap.get(nodeId);
                    }
                    nodeIdTestData.set(nodeUUID,testStepData);     
                }else{ 
                    var name='';
                    if(scenarioItems[index].type=='Decision' || scenarioItems[index].type=='Fork'){  
                        name=scenarioItems[index].linkTxt;                                   
                    }              
                    nodeId=scenarioItems[index].appendedName+scenarioItems[nextIndex].name;
                    if(nodeIdMap.get(nodeId)==undefined) {
                        nodeUUID=uuidv5(nodeId, uuidv1());
                        nodeIdMap.set(nodeId,nodeUUID);
                        nodeNumber++;
                        createLink1(nodeUUID,name,scenarioItems[index].id,scenarioItems[nextIndex].id,blobJson,nodeNumber);
                        isLinkCreated=true;
                        isEmptyLink=true;                        
                    }else{
                        nodeUUID=nodeIdMap.get(nodeId);
                    } 
                    nodeIdTestData.set(nodeUUID,[]); 
                }
                if(isLinkCreated){
                    var prevIndex=0;
                    prevIndex=index-1;
                    if(isEmptyLink) prevIndex=index;                    
                      if(scenarioItems[nextIndex].type =='Join'){                        
                        var joinMapEntry=joinMap.get(scenarioItems[nextIndex].appendedName);
                        if(joinMapEntry!=undefined){
                            if(joinMapEntry.inPortsData.indexOf(scenarioItems[nextIndex-1].appendedName)<0){
                                var length=joinMapEntry.inPorts.length;
                                joinMapEntry.inPorts.push('in'+(length+1));
                                joinMapEntry.inPortsData.push(scenarioItems[nextIndex-1].appendedName);
                                joinMapEntry.inLinkIndex.push(blobJson.cells.length-1);
                                joinMap.set(scenarioItems[nextIndex].appendedName,joinMapEntry);
                            }
                        }
                      }
                      if(scenarioItems[prevIndex].type =='Join'){
                        var joinMapEntry=joinMap.get(scenarioItems[prevIndex].appendedName);
                        if(joinMapEntry!=undefined){
                            if(joinMapEntry.outPortsData.indexOf(scenarioItems[prevIndex+1].appendedName)<0){
                                joinMapEntry.outPorts.push('out');
                                joinMapEntry.outPortsData.push(scenarioItems[prevIndex+1].appendedName);
                                joinMapEntry.outLinkIndex=blobJson.cells.length-1;      
                                joinMap.set(scenarioItems[prevIndex].appendedName,joinMapEntry);                              
                            }
                        }
                      }
                      if(scenarioItems[nextIndex].type =='Fork'){
                        var forkMapEntry=forkMap.get(scenarioItems[nextIndex].appendedName);
                        if(forkMapEntry!=undefined){
                            if(forkMapEntry.inPortsData.indexOf(scenarioItems[nextIndex-1].appendedName)<0){
                                forkMapEntry.inPorts.push('in');
                                forkMapEntry.inPortsData.push(scenarioItems[nextIndex-1].appendedName);
                                forkMapEntry.inLinkIndex=blobJson.cells.length-1;
                                forkMap.set(scenarioItems[nextIndex].appendedName,forkMapEntry)                       
                            }
                        }                        
                      }
                      if(scenarioItems[prevIndex].type =='Fork'){
                        var forkMapEntry=forkMap.get(scenarioItems[prevIndex].appendedName);
                        if(forkMapEntry!=undefined){
                            if(forkMapEntry.outPortsData.indexOf(scenarioItems[prevIndex+1].appendedName)<0){
                                var length=forkMapEntry.outPorts.length;                                
                                forkMapEntry.outPorts.push('out'+(length+1));
                                forkMapEntry.outPortsData.push(scenarioItems[prevIndex+1].appendedName);
                                forkMapEntry.outLinkIndex.push(blobJson.cells.length-1);
                                forkMap.set(scenarioItems[prevIndex].appendedName,forkMapEntry); 
                            }                           
                        }
                      }
                      if(scenarioItems[nextIndex].type =='Decision'){
                        var decisionMapEntry=decisionMap.get(scenarioItems[nextIndex].appendedName);
                        if(decisionMapEntry!=undefined){
                            if(decisionMapEntry.inPortsData.indexOf(scenarioItems[nextIndex-1].appendedName)<0){
                                decisionMapEntry.inPortsData.push(scenarioItems[nextIndex-1].appendedName);
                                decisionMapEntry.inLinkIndex=blobJson.cells.length-1;
                                decisionMap.set(scenarioItems[nextIndex].appendedName,decisionMapEntry)                       
                            }
                        }                        
                      }
                      if(scenarioItems[prevIndex].type =='Decision'){
                        var decisionMapEntry=decisionMap.get(scenarioItems[prevIndex].appendedName);
                        if(decisionMapEntry!=undefined){
                            if(decisionMapEntry.outPortsData.indexOf(scenarioItems[prevIndex+1].appendedName)<0){
                                var length=decisionMapEntry.outPortsData.length;                                
                                decisionMapEntry.outPortsData.push(scenarioItems[prevIndex+1].appendedName);
                                decisionMapEntry.outLinkIndex.push(blobJson.cells.length-1);
                                decisionMap.set(scenarioItems[prevIndex].appendedName,decisionMapEntry); 
                            }                           
                        }
                      }
                }
            }   
        } 
    });
    
    forkMap.forEach(function(value, key) {
        var forkEntry=value;
        var forkIndex=forkEntry.blobIndex;
        var outLength=forkEntry.outLinkIndex.length;
        if(outLength<2){
            //change to Entity
            var nodeId= blobJson.cells[forkIndex].id;
            var name=blobJson.cells[forkIndex].attrs['.label'].text;
            var nodeNumber=blobJson.cells[forkIndex].z;
            blobJson.cells[forkIndex]= createEntityObject(nodeId,name,nodeNumber);
        }else{
            blobJson.cells[forkIndex].inPorts=forkEntry.inPorts;
            blobJson.cells[forkIndex].outPorts=forkEntry.outPorts;
            var portCount=3;
            blobJson.cells[forkEntry.inLinkIndex].target.port=forkEntry.inPorts[0];        
            blobJson.cells[forkEntry.inLinkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";     
            for(var count=0;count<outLength;count++){
                var linkIndex=forkEntry.outLinkIndex[count];
                portCount++;
                blobJson.cells[linkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                blobJson.cells[linkIndex].source.port=forkEntry.outPorts[count];            
            }
        }
    });

    joinMap.forEach(function(value, key) {
        var joinEntry=value;
        var joinIndex=joinEntry.blobIndex;        
        var inLength=joinEntry.inLinkIndex.length;
        if(inLength<2){
              //change to Entity
              var nodeId= blobJson.cells[joinIndex].id;
              var name=blobJson.cells[joinIndex].attrs['.label'].text;
              var nodeNumber=blobJson.cells[joinIndex].z;
              blobJson.cells[joinIndex]= createEntityObject(nodeId,name,nodeNumber);
        }else{
            blobJson.cells[joinIndex].inPorts=joinEntry.inPorts;
            blobJson.cells[joinIndex].outPorts=joinEntry.outPorts;
            var portCount=3;
            for(var count=0;count<inLength;count++){
                var linkIndex=joinEntry.inLinkIndex[count];
                blobJson.cells[linkIndex].target.port=joinEntry.inPorts[count];
                blobJson.cells[linkIndex].target.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
                portCount++;
            }
            blobJson.cells[joinEntry.outLinkIndex].source.port=joinEntry.outPorts[0];   
            blobJson.cells[joinEntry.outLinkIndex].source.selector="g:nth-child(1) > g:nth-child("+portCount+") > circle:nth-child(1)";
        }
    });

   decisionMap.forEach(function(value, key) {
    var decisionEntry=value;
    var decisionIndex=decisionEntry.blobIndex;
    var outLength=decisionEntry.outPortsData.length;
    if(outLength<2){
        //change to Entity
        var nodeId= blobJson.cells[decisionIndex].id;
        var name=blobJson.cells[decisionIndex].attrs.text.text;
        var nodeNumber=blobJson.cells[decisionIndex].z;
        blobJson.cells[decisionIndex]= createEntityObject(nodeId,name,nodeNumber);
    }  
});


    
    /*nodeIdMap.forEach(function(value, key) { 
        global.appLog.debug(key+": "+value);
    });*/
    updateVersionScenarioAndTestData(response,versionId,blobJson,nodeIdTestData,userData);
    /*nodeIdTestData.forEach(function(value, key) { 
        global.appLog.debug(key+": "+value);
    });*/
  }
}

function updateVersionScenarioAndTestData(response,versionId,blobJson,nodeIdTestData,userData){
    var msg = '';
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
                                        var nodeSteps=[];
                                        nodeIdTestData.forEach(function(testSteps, nodeId) { 
                                            if(testSteps.length>0){
                                                testSteps.forEach(function(stepData) {
                                                var stepObject={
                                                    test_step_number: stepData.index.replace("Step",""),
                                                    description:stepData.desc,
                                                    action:'',
                                                    target_type:'',
                                                    target:'',
                                                    tst_step_data:'',
                                                    node_id: nodeId,
                                                    version_id:versionId                                        
                                                }
                                                getTestConditionDetails(stepObject);
                                                nodeSteps.push(stepObject);
                                                });
                                            }                               
                                        });
                                        //DELETE Existing Test Condition data
                                        global.appConstants.dbConstants.tableObj.testCondition.find({version_id:versionId}).remove(function(err) {
                                            if(err) {
                                                global.errorLog.error(err);
                                                msg=global.errorDescs.errorDesc.desc.DB_IO_ERROR;
                                            }else{
                                                if(nodeSteps.length>0){
                                                    //INSERT Test Condition data
                                                    global.appConstants.dbConstants.tableObj.testCondition.create(nodeSteps, function (err, items) {                                
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
                                                }else{
                                                    var resp={
                                                        msg:global.errorDescs.errorDesc.desc.SUCCESS,
                                                        code:"200",
                                                        data:blobJson
                                                    }
                                                    response.end(JSON.stringify(resp));
                                                }
                                            }
                                        });
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

function addComponentToBlob(id,type,name,blobJson,nodeNumber){
     if(type.indexOf('Decision')!=-1){
        createDecisionNode1(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Start')!=-1){
        createStartNode1(id,blobJson,nodeNumber);
     }else if(type.indexOf('State')!=-1){
        createStateNode1(id,"",blobJson,nodeNumber);
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
     }else if(type.indexOf('Gateway')!=-1){
        createGatewayNode(id,name,type,blobJson,nodeNumber);
     }else if(type.indexOf('Event')!=-1){
        createEventNode(id,name,type,blobJson,nodeNumber);
     }else if(type.indexOf('DataObject')!=-1){
        createDataObjectNode(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Conversation')!=-1){
        createConversationNode(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Annotation')!=-1){
        createAnnotationNode(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Message')!=-1){
        createMessageNode(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Choreography')!=-1){
        createChoreographyNode(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Group')!=-1){
        createGroupNode(id,name,blobJson,nodeNumber);
     }else if(type.indexOf('Activity')!=-1){
        createActivityNode(id,name,blobJson,nodeNumber);
     }
}

function createGatewayNode(id,name,type,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.Gateway",
		"size": {
			"width": 60,
			"height": 60
		},
		"position": {
			"x": 228.5000000000001,
			"y": 335
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"icon": "plus",
		"attrs": {
			".body": {
				"fill": "#3CB371"
			},
			".label": {
				"text": ""
			},
			"image": {
				"xlink:href": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIyLjUsMTRIMTR2OC41YzAsMC4yNzYtMC4yMjQsMC41LTAuNSwwLjVoLTRDOS4yMjQsMjMsOSwyMi43NzYsOSwyMi41VjE0SDAuNSAgQzAuMjI0LDE0LDAsMTMuNzc2LDAsMTMuNXYtNEMwLDkuMjI0LDAuMjI0LDksMC41LDlIOVYwLjVDOSwwLjIyNCw5LjIyNCwwLDkuNSwwaDRDMTMuNzc2LDAsMTQsMC4yMjQsMTQsMC41VjloOC41ICBDMjIuNzc2LDksMjMsOS4yMjQsMjMsOS41djRDMjMsMTMuNzc2LDIyLjc3NiwxNCwyMi41LDE0eiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+"
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			"path": {
				"fill": "#3CB371"
			}
		}
    }
    if(type.indexOf('Inclusive')!=-1){
        componentObj.icon='circle';
        componentObj.attrs.image["xlink:href"]='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gULEBE3DEP64QAAAwlJREFUaN7dmktrU0EUx38ZmmBbfEIL2hSjkYKC1EW6EDFudC+404/gE6WKSvGxERQfIH4AX1T9EOKrCrYurVrbgsZWoaBVixDbpC6ci+Fyz9ybZG478cBs7syc+Z+5c86c+c8ksCPrgW1ADtgEbARafG1+AW+AYWAIGADGWUTZAJwHxoD5GssocA7ILiTwLcADoFQHcH8pAfeB7jiBtwO3gLJF4P5S1mO02wa/C5iMEbi/TAI7bYE/Y3m5VLOs+sLAJULqrgKHIxhZBp4DT4FX2jkLGoinq1M7fg7YDmwFVATd14CjFboiy5UIs/QBOAmka/izaeCU1hE2zuVqlZ8IUfgVOAA0WViiTcBBrdM0Zm9UhTuAOYOiRzXOeJh0Ak8M484B+TAlK4BPBiU3gWSMoTqpw6g0fgFYblJww9D5dojT25IEcMeA47rUsdsQLp9FmPmURSNSOqpJS2lzUKd+ocN3IBNx5mz+oXXADwHTXX/jjMFxjy1iwtgrYJoF1lY27BMafozZaaMspYKA7XRlw7f1xt4Y5biA7bXXIGv4TW0OGNCmsQRhzCidlwTJADDlgAFTwAuhLq+AHqHyMe6IhKVHAV1C5ZBDBkhYupThPPreIQNGJTJBGXKLLw4Z8NmQu/Fb8PCkQwakBIxFRWPLvAJmhMpWh4AuFb7PKGBaqFzjkAGrhe/TSjNrQZJ1yAAJy5gCRoTKnEMGSFhGFDBoOBu7IhKWQe8wLRFLHQ6A7zCcFNNK59vvAjoqYK8DBuwTCLBhTUD8Hweahj9S2jjU297VqzrU26BVmi2yEjXRKg1PbHnpqYla7AeWxAi+GbhHHdSit2mYyN2XQQ5kQTJ6Y6qL3PUkCr2+H7v0+jcs0eueRLngGNeKa9mxY73g8JzpEtHusorAQ/7e+e7WUWIl//jSVTrK7QEu6KgW9d7tYr3B44iBWPJfkZZ8pZ4r2VngkC0HywMTLNwN5YSBcKtZWoGzernEBbyox2iJc6Np2KcGfnHisYet1CDouc2yCjbhp07MrD+3+QNxi4JkAscRswAAAABJRU5ErkJggg==';
    }else if(type.indexOf('Exclusive')!=-1){
        componentObj.icon='cross';
        componentObj.attrs.image["xlink:href"]='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik0yMi4yNDUsNC4wMTVjMC4zMTMsMC4zMTMsMC4zMTMsMC44MjYsMCwxLjEzOWwtNi4yNzYsNi4yN2MtMC4zMTMsMC4zMTItMC4zMTMsMC44MjYsMCwxLjE0bDYuMjczLDYuMjcyICBjMC4zMTMsMC4zMTMsMC4zMTMsMC44MjYsMCwxLjE0bC0yLjI4NSwyLjI3N2MtMC4zMTQsMC4zMTItMC44MjgsMC4zMTItMS4xNDIsMGwtNi4yNzEtNi4yNzFjLTAuMzEzLTAuMzEzLTAuODI4LTAuMzEzLTEuMTQxLDAgIGwtNi4yNzYsNi4yNjdjLTAuMzEzLDAuMzEzLTAuODI4LDAuMzEzLTEuMTQxLDBsLTIuMjgyLTIuMjhjLTAuMzEzLTAuMzEzLTAuMzEzLTAuODI2LDAtMS4xNGw2LjI3OC02LjI2OSAgYzAuMzEzLTAuMzEyLDAuMzEzLTAuODI2LDAtMS4xNEwxLjcwOSw1LjE0N2MtMC4zMTQtMC4zMTMtMC4zMTQtMC44MjcsMC0xLjE0bDIuMjg0LTIuMjc4QzQuMzA4LDEuNDE3LDQuODIxLDEuNDE3LDUuMTM1LDEuNzMgIEwxMS40MDUsOGMwLjMxNCwwLjMxNCwwLjgyOCwwLjMxNCwxLjE0MSwwLjAwMWw2LjI3Ni02LjI2N2MwLjMxMi0wLjMxMiwwLjgyNi0wLjMxMiwxLjE0MSwwTDIyLjI0NSw0LjAxNXoiLz48L3N2Zz4=';
    }    
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.label'].text = name;
    blobJson.cells.push(componentObj);
}

function createEventNode(id,name,type,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.Event",
		"size": {
			"width": 62.49999999999997,
			"height": 60
		},
		"eventType": "intermediate",
		"position": {
			"x": 227.2500000000001,
			"y": 445
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"icon": "message",
		"attrs": {
			".body": {
				"fill": "#3CB371"
			},
			".inner": {
				"visibility": "visible"
			},
			"image": {
				"xlink:href": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUxMiA1MTIiIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik00NzkuOTk4LDY0SDMyQzE0LjMyOSw2NCwwLDc4LjMxMiwwLDk2djMyMGMwLDE3LjY4OCwxNC4zMjksMzIsMzIsMzJoNDQ3Ljk5OEM0OTcuNjcxLDQ0OCw1MTIsNDMzLjY4OCw1MTIsNDE2Vjk2ICBDNTEyLDc4LjMxMiw0OTcuNjcxLDY0LDQ3OS45OTgsNjR6IE00MTYsMTI4TDI1NiwyNTZMOTYsMTI4SDQxNnogTTQ0OCwzODRINjRWMTYwbDE5MiwxNjBsMTkyLTE2MFYzODR6Ii8+PC9zdmc+"
			},
			".label": {
				"text": ""
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			"path": {
				"fill": "#3CB371"
			}
		}
    }
    if(type.indexOf('Start')!=-1){
        componentObj.eventType= 'start';
    }else if(type.indexOf('End')!=-1){
        componentObj.eventType= 'end';
    }
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.label'].text = name;
    blobJson.cells.push(componentObj);
}

function createDataObjectNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.DataObject",
		"size": {
			"width": 205.625,
			"height": 60
		},
		"position": {
			"x": 155.6875000000001,
			"y": 555
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"attrs": {
			".body": {
				"fill": "#3CB371"
			},
			".label": {
				"text": ""
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			"path": {
				"fill": "#3CB371"
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.label'].text = name;
    blobJson.cells.push(componentObj);
}

function createConversationNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.Conversation",
		"size": {
			"width": 100,
			"height": 75.00000000000003
		},
		"conversationType": "conversation",
		"position": {
			"x": 298.5000000000001,
			"y": 667.5
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"subProcess": false,
		"attrs": {
			".body": {
				"fill": "#6b6c8a"
			},
			".label": {
				"text": "coversation"
			},
			"path": {
				"fill": "#6b6c8a"
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			".sub-process": {
				"visibility": "hidden",
				"data-sub-process": ""
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.label'].text = name;
    blobJson.cells.push(componentObj);
}

function createAnnotationNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"size": {
			"width": 240,
			"height": 129.99999999999986
		},
		"type": "bpmn.Annotation",
		"wingLength": 20,
		"content": "",
		"position": {
			"x": 228.5000000000001,
			"y": 795
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"attrs": {
			".body": {
				"fill-opacity": 0.3,
				"fill": "#6b6c8a"
			},
			".stroke": {
				"fill": "#61549C",
				"d": "M 20 0 L 0 0 0 129.99999999999986 20 129.99999999999986"
			},
			".content": {
				"html": ""
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			".fobj": {
				"width": 240,
				"height": 129.99999999999986
			},
			"div": {
				"style": {
					"width": 240,
					"height": 129.99999999999986
				}
			},
			"path": {
				"fill": "#6b6c8a"
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.content'].html = name;
    componentObj.content = name;
    blobJson.cells.push(componentObj);
}

function createMessageNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.Message",
		"size": {
			"width": 72.5,
			"height": 40
		},
		"position": {
			"x": 312.2500000000001,
			"y": 974.9999999999999
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"attrs": {
			".body": {
				"fill": "#6b6c8a"
			},
			".label": {
				"text": "test email"
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			"path": {
				"fill": "#6b6c8a"
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.label'].text = name;
    blobJson.cells.push(componentObj);
}

function createChoreographyNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.Choreography",
		"size": {
			"width": 137.00000000000028,
			"height": 80
		},
		"participants": [],
		"initiatingParticipant": null,
		"content": "active object",
		"position": {
			"x": 99.99999999999997,
			"y": 665
		},
		"angle": 0,
		"id": "",
		"z": 23,
		"subProcess": false,
		"attrs": {
			".body": {
				"fill": "#3CB371"
			},
			".sub-process": {
				"visibility": "hidden",
				"data-sub-process": ""
			},
			".content": {
				"html": "active object"
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			".fobj": {
				"width": 137.00000000000028,
				"height": 80
			},
			"div": {
				"style": {
					"width": 137.00000000000028,
					"height": 80
				}
			},
			"path": {
				"fill": "#3CB371"
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.content'].html = name;
    blobJson.cells.push(componentObj);
}

function createGroupNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "bpmn.Group",
		"size": {
			"width": 334.99999999999795,
			"height": 185
		},
		"position": {
			"x": 181.00000000000114,
			"y": 320
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"attrs": {
			".label-rect": {
				"ref-y": -15
			},
			".label-group": {
				"ref-y": 10
			},
			".label": {
				"text": "Group1"
			},
			".": {
				"data-tooltip-position": "bottom"
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.label'].text = name;
    blobJson.cells.push(componentObj);
}

function createActivityNode(id,name,blobJson,nodeNumber){
    var componentObj=
    {
		"size": {
			"width": 80,
			"height": 40
		},
		"type": "bpmn.Activity",
		"activityType": "task",
		"subProcess": false,
		"content": "",
		"position": {
			"x": 374,
			"y": 110
		},
		"angle": 0,
		"id": "",
		"z": 0,
		"icon": "user",
		"attrs": {
			".body": {
				"fill": "#FF0000"
			},
			".inner": {
				"visibility": "hidden"
			},
			"path": {
				"ref": ".outer"
			},
			"image": {
				"ref": ".outer",
				"ref-dy": "",
				"ref-y": 5,
				"xlink:href": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIyLDIwLjk5OGgtMWMwLDAtMSwwLTEtMVYxNy41YzAtMC4yNzctMC4yMjQtMC41LTAuNS0wLjVTMTksMTcuMjIzLDE5LDE3LjUgIGwtMC4wMDgsNC4yOTVjMCwwLjYwOS0yLjAxLDIuMjA1LTYuNDkyLDIuMjA1cy02LjQ5Mi0xLjU5Ni02LjQ5Mi0yLjIwNUw2LDE3LjVDNiwxNy4yMjMsNS43NzYsMTcsNS41LDE3UzUsMTcuMjIzLDUsMTcuNXYyLjQ5OCAgYzAsMS0xLDEtMSwxSDNjMCwwLTEsMC0xLTFWMTUuNzVjMC0yLjkyMiwyLjg5Mi01LjQwMSw2LjkzLTYuMzQxYzAsMCwxLjIzNCwxLjEwNywzLjU3LDEuMTA3czMuNTctMS4xMDcsMy41Ny0xLjEwNyAgYzQuMDM4LDAuOTQsNi45MywzLjQxOSw2LjkzLDYuMzQxdjQuMjQ4QzIzLDIwLjk5OCwyMiwyMC45OTgsMjIsMjAuOTk4eiBNMTIuNDc3LDljLTIuNDg1LDAtNC41LTIuMDE1LTQuNS00LjVTOS45OTEsMCwxMi40NzcsMCAgczQuNSwyLjAxNSw0LjUsNC41UzE0Ljk2Miw5LDEyLjQ3Nyw5eiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+"
			},
			"text": {
				"ref-y": 0.5
			},
			".content": {
				"html": ""
			},
			".": {
				"data-tooltip-position": "bottom"
			},
			".fobj": {
				"width": 80,
				"height": 40
			},
			"div": {
				"style": {
					"width": 80,
					"height": 40
				}
			},
			".fobj div": {
				"style": {
					"verticalAlign": "middle",
					"paddingTop": 0
				}
			},
			".outer": {
				"stroke-width": 1,
				"stroke-dasharray": "none"
			},
			".sub-process": {
				"visibility": "hidden",
				"data-sub-process": ""
			}
		}
	}
    componentObj.id = id;
    componentObj.z = nodeNumber;
    componentObj.attrs['.content'].html = name;
    componentObj.content = name;
    blobJson.cells.push(componentObj);
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

function createDecisionNode1(id,name,blobJson,nodeNumber){
    var componentObj=
        {
            "type": "erd.Relationship",
            "size": {
                "width": 60,
                "height": 60
            },
            "position": {
                "x": 185,
                "y": 210
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
    blobJson.cells.push(componentObj);
}
function createEntityNode1(id,name,blobJson,nodeNumber){
    blobJson.cells.push(createEntityObject(id,name,nodeNumber));
}

function createEntityObject(id,name,nodeNumber){
    var componentObj=
    {
        "type": "erd.Entity",
        "size": {
            "width": 90,
            "height": 36
        },
        "position": {
            "x": 240,
            "y": 320
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

function createForkNode(id,name,blobJson,nodeNumber){
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
            "width": 90,
            "height": 45
        },
        position: {
			"x": 330,
			"y": 1190
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
    blobJson.cells.push(componentObj);
}

function createJoinNode(id,name,blobJson,nodeNumber){
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
            "width": 90,
            "height": 45
        },
        position: {
			"x": 330,
			"y": 1190
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
    blobJson.cells.push(componentObj);
}

function createSendSignal(id,blobJson,nodeNumber){
    var componentObj=
    {
		"type": "basic.Path",
		"size": {
			"width": 90,
			"height": 36
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
    var componentObj=
    {
		"type": "basic.Path",
		"size": {
			"width": 90,
			"height": 36
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


function getTestConditionDetails(stepObject){
    var desc=stepObject.description;
    if(desc.startsWith('Activate')){
        stepObject.action='Activate';
        if(desc.startsWith('Activate the ')){
            if(desc.endsWith(' Browser')){
                stepObject.target_type='Browser';
                stepObject.target=dataBetweenStrings('Activate the ',' Browser',desc);
            }else if(desc.endsWith(' dialog window')){
                stepObject.target_type='JavaDialog';
                stepObject.target=dataBetweenStrings('Activate the ',' dialog window',desc);
            }else if(desc.endsWith(' dialogbox')){
                stepObject.target_type='Dialog';
                stepObject.target=dataBetweenStrings('Activate the ',' dialogbox',desc);
            }else{
                stepObject.target_type='Window';
                stepObject.target=dataBetweenStrings('Activate the ',' window',desc);
            } 
        }else{
            if(desc.endsWith(' for $data')){
                stepObject.action='ActivateRecord';
                stepObject.target_type='OracleList'; 
                stepObject.target=dataBetweenStrings('Activate ',' for $data',desc);
            }else{
                stepObject.target=desc.replace('Activate ','');
                stepObject.target_type='OracleFormWindow';                
            }
        }
    }else if(desc.startsWith('Take screenshot of ')){
        stepObject.action='CaptureScreen';
        if(desc.endsWith(' Browser')){
            stepObject.target_type='Browser';
            stepObject.target=dataBetweenStrings('Take screenshot of ',' Browser',desc);
        }else  if(desc.endsWith(' Screen')){
            stepObject.target_type='TeScreen';
            stepObject.target=dataBetweenStrings('Take screenshot of ',' Screen',desc);
        }else  if(desc.endsWith(' Window')){
            stepObject.target_type='JavaWindow';
            stepObject.target=dataBetweenStrings('Take screenshot of ',' Window',desc);
        }else 
        {
            stepObject.target_type='SAPGuiWindow';
            stepObject.target=dataBetweenStrings('Take screenshot of ',' SAPGuiWindow',desc);
        }
    }else if (desc.startsWith('Call using ')){
        stepObject.action='Call';
        stepObject.target_type='LaunchBrowser';
        stepObject.tst_step_data=desc.replace('Call using ','');
    }else if (desc.startsWith('ClearData ')){
        stepObject.action='ClearData';
        stepObject.target_type='OracleCheckbox';
        stepObject.target=desc.replace('Clear Data from ','');
    }else if (desc.startsWith('Click on ')){
        stepObject.action='Click';
        if(desc.endsWith(' image')){
            stepObject.target_type='Image';
            stepObject.target=dataBetweenStrings('Click on ',' image',desc);
        }else if(desc.endsWith(' button')){
            stepObject.target_type='JavaButton';
            stepObject.target=dataBetweenStrings('Click on ',' button',desc);
        }else if(desc.endsWith(' tab')){
            stepObject.target_type='JavaTab';
            stepObject.target=dataBetweenStrings('Click on ',' tab',desc);
        }else if(desc.endsWith(' Link')){
            stepObject.target_type='Link';
            stepObject.target=dataBetweenStrings('Click on ',' Link',desc);
        }else if(desc.endsWith(' Tab')){
            stepObject.target_type='SwfTab';
            stepObject.target=dataBetweenStrings('Click on ',' Tab',desc);
        }else if(desc.endsWith(' WebElement')){
            stepObject.target_type='WebElement';
            stepObject.target=dataBetweenStrings('Click on ',' WebElement',desc);
        }else if(desc.endsWith(' Object')){
            stepObject.target_type='SwfObject';
            stepObject.target=dataBetweenStrings('Click on ',' Object',desc);
        }else if(desc.endsWith(' window')){
            stepObject.target_type='OracleFormWindow';
            stepObject.target=dataBetweenStrings('Click on ',' window',desc);
        }else if(desc.endsWith('table')){
            stepObject.target_type='SAPGuiTable';
            stepObject.target=dataBetweenStrings('Click on ',' table',desc);
        }else{
            stepObject.target_type='OracleTextField';
            stepObject.target=desc.replace('Click on ','');
        }
    }else if(desc.startsWith('Click')){
            stepObject.action='Click';
            stepObject.target_type='SAPGuiButton';
            stepObject.target=dataBetweenStrings('Click ',desc);
    }else if (desc.startsWith('Click on  ') && desc.endsWith('link in the table')){
        stepObject.action='ClickLinkInTable';
        stepObject.target_type='JavaTable';
        stepObject.target=dataBetweenStrings('Click on ',' link in the table',desc);
    }else if (desc.startsWith('Close ')){
        stepObject.action='Close'; 
        if(desc.endsWith('Browser')){
            stepObject.target_type='Browser';
            stepObject.target=dataBetweenStrings('Close ','Browser',desc);
        }else if(desc.endsWith(' formwindow')){
            stepObject.target_type='OracleFormWindow';
            stepObject.target=dataBetweenStrings('Close ',' formwindow',desc);
        }else if(desc.endsWith(' window')){
            stepObject.target_type='Window';
            stepObject.target=dataBetweenStrings('Close ',' window',desc);
        }else if(desc.startsWith('Close the page ')){
            stepObject.target_type='Page';
            stepObject.target=desc.replace('Close the page ','');
        }else if (desc.endsWith(' Logon')){
             stepObject.target_type='OracleLogon';
             stepObject.target=dataBetweenStrings('Close ',' Logon');
        }else if (desc.endsWith(' navigator')){
            stepObject.target_type='OracleNavigator';
            stepObject.target=dataBetweenStrings('Close ',' navigator');
        }else{
            stepObject.target_type='SAPGuiWindow';
            stepObject.target=desc.replace('Close ','');
        }     
    }else if (desc.startsWith('Close the ') && desc.endsWith(' tree view')){
        stepObject.action='Collapse';
        stepObject.target_type='SwfTreeView';
        stepObject.target=dataBetweenStrings('Close the ',' tree view',desc);
    }else if (desc.startsWith('get Column Count from') && desc.endsWith('table')){
        stepObject.action='ColumnCount';
        stepObject.target_type='OracleTable';
        stepObject.target=dataBetweenStrings('get Column Count from ',' table',desc);
    }else if (desc.startsWith('Get Column Count from')){
        stepObject.action='ColumnCount';
        stepObject.target_type='SAPGuiTable';
        stepObject.target=desc.replace('Get Column Count from ','');
    }else if (desc.startsWith('Double Click on ')){
        stepObject.action='DoubleClick';
        if(desc.endsWith(' in a tree hierarchy')){
            stepObject.target_type='JavaTree';
            stepObject.target=dataBetweenStrings('Double Click on ',' in a tree hierarchy',desc);
        }else  if(desc.endsWith(' in the list')){
            stepObject.target_type='WebList';
            stepObject.target=dataBetweenStrings('Double Click on ',' in the list',desc);
        }else  if(desc.endsWith(' in the table')){
            stepObject.target_type='WebTable';
            stepObject.target=dataBetweenStrings('Double Click on ',' in the table',desc);
        }else  if(desc.endsWith(' object')){
            stepObject.target_type='SwfObject';
            stepObject.target=dataBetweenStrings('Double Click on ',' object',desc);
        }else{
            stepObject.target_type='WebElement';
            stepObject.target=desc.replace('Double Click on ','');
        }
    }else if(desc.startsWith('DoubleClick on')){
            stepObject.action='DoubleClick';
            stepObject.target_type='SAPGuiTextArea';
            stepObject.target=desc.replace('DoubleClick on ','');
    }else if (desc.startsWith('DragAndDrop ')){
        stepObject.action='DragAndDrop';
        stepObject.target_type='Page';
        stepObject.target=dataBetweenStrings('DragAndDrop ',' target',desc);        
    }else if (desc.startsWith('Verify whether ') && desc.endsWith(' exists')){
        stepObject.action='Exists';
        if(desc.endsWith(' Browser exists')){
            stepObject.target_type='Browser';
            stepObject.target=dataBetweenStrings('Verify whether ',' Browser exists',desc);   
        }else if(desc.endsWith(' dialog box exists')){
            stepObject.target_type='Dialog';
            stepObject.target=dataBetweenStrings('Verify whether ',' dialog box exists',desc);   
        }else if(desc.endsWith(' button exists')){
            stepObject.target_type='JavaButton';
            stepObject.target=dataBetweenStrings('Verify whether ',' button exists',desc);   
        }else if(desc.endsWith(' Checkbox exists')){
            stepObject.target_type='JavaCheckBox';
            stepObject.target=dataBetweenStrings('Verify whether ',' Checkbox exists',desc);   
        }else if(desc.endsWith(' text box exists')){
            stepObject.target_type='JavaEdit';
            stepObject.target=dataBetweenStrings('Verify whether ',' text box exists',desc);   
        }else if(desc.endsWith(' Menu exists')){
            stepObject.target_type='JavaMenu';
            stepObject.target=dataBetweenStrings('Verify whether ',' Menu exists',desc);   
        }else if(desc.endsWith(' radio group exists')){
            stepObject.target_type='JavaRadioButton';
            stepObject.target=dataBetweenStrings('Verify whether ',' radio group exists',desc);   
        }else if(desc.endsWith(' tab exists')){
            stepObject.target_type='JavaTab';
            stepObject.target=dataBetweenStrings('Verify whether ',' tab exists',desc);   
        }else if(desc.endsWith(' tree hierarchy exists')){
            stepObject.target_type='JavaTree';
            stepObject.target=dataBetweenStrings('Verify whether ',' tree hierarchy exists',desc);   
        }else if(desc.endsWith(' window exists')){
            stepObject.target_type='JavaWindow';
            stepObject.target=dataBetweenStrings('Verify whether ',' window exists',desc);   
        }else if(desc.endsWith(' link exists')){
            stepObject.target_type='Link';
            stepObject.target=dataBetweenStrings('Verify whether ',' link exists',desc);   
        }else if(desc.endsWith(' Page exists')){
            stepObject.target_type='Page';
            stepObject.target=dataBetweenStrings('Verify whether ',' Page exists',desc);   
        }else if(desc.endsWith(' calendar exists')){
            stepObject.target_type='SwfCalendar';
            stepObject.target=dataBetweenStrings('Verify whether ',' calendar exists',desc);   
        }else if(desc.endsWith(' check box exists')){
            stepObject.target_type='SwfCheckBox';
            stepObject.target=dataBetweenStrings('Verify whether ',' check box exists',desc);   
        }else if(desc.endsWith(' combo box exists')){
            stepObject.target_type='SwfComboBox';
            stepObject.target=dataBetweenStrings('Verify whether ',' combo box exists');   
        }else if(desc.endsWith(' list exists')){
            stepObject.target_type='SwfList';
            stepObject.target=dataBetweenStrings('Verify whether ',' list exists',desc);   
        }else if(desc.endsWith(' table exists')){
            stepObject.target_type='SwfTable';
            stepObject.target=dataBetweenStrings('Verify whether ',' table exists',desc);   
        }else if(desc.endsWith(' Tree hierarchy exists')){
            stepObject.target_type='SwfTreeView';
            stepObject.target=dataBetweenStrings('Verify whether ',' Tree hierarchy exists',desc);   
        }else if(desc.endsWith(' field exists')){
            stepObject.target_type='TeField';
            stepObject.target=dataBetweenStrings('Verify whether ',' field exists',desc);   
        }else if(desc.endsWith(' screen exists')){
            stepObject.target_type='TeScreen';
            stepObject.target=dataBetweenStrings('Verify whether ',' screen exists',desc);   
        }else if(desc.endsWith(' OracleTable exists')){
            stepObject.target_type='OracleTable';
            stepObject.target=dataBetweenStrings('Verify whether ',' OracleTable exists',desc);   
        }else if(desc.endsWith(' OracleRadioGroup exists')){
            stepObject.target_type='OracleRadioGroup';
            stepObject.target=dataBetweenStrings('Verify whether ',' OracleRadioGroup exists',desc);   
        }else if(desc.endsWith(' OracleList exists')){
            stepObject.target_type='OracleList';
            stepObject.target=dataBetweenStrings('Verify whether ',' OracleList exists',desc);   
        }else if(desc.endsWith(' OracleFormWindow exists')){
            stepObject.target_type='OracleFormWindow';
            stepObject.target=dataBetweenStrings('Verify whether ',' OracleFormWindow exists',desc);   
        }else if(desc.endsWith(' OracleCheckbox exists')){
            stepObject.target_type='OracleCheckbox';
            stepObject.target=dataBetweenStrings('Verify whether ',' OracleCheckbox exists',desc);   
        }else if(desc.endsWith(' OracleButton exists')){
            stepObject.target_type='OracleButton';
            stepObject.target=dataBetweenStrings('Verify whether ',' OracleButton exists',desc);   
        }
    }else if (desc.startsWith('Expand the complete ')){
        stepObject.action='ExpandAll';
        stepObject.target_type='SwfTreeView';
        stepObject.target=dataBetweenStrings('Expand the complete ',' Tree hierarchy',desc);   
    }else if (desc.startsWith('Expand ')){
        stepObject.action='Expand';
        stepObject.target_type='SwfTreeView';
        stepObject.tst_step_data=dataBetweenStrings('Expand ',' node of the',desc);   
        stepObject.target=dataBetweenStrings('node of the ',' Tree',desc);   
    }else if (desc.startsWith('Find the row by search text in ')){
        stepObject.action='FindRowByText';
        stepObject.target_type='TeScreen';
        stepObject.target=dataBetweenStrings('Find the row by search text in ',' screen',desc); 
    }else if (desc.startsWith('GetElement')){
        stepObject.action='GetElement';
        stepObject.target_type='Browser';
    }else if (desc.startsWith('Read the value from ') || desc.startsWith('GetValue ')){
        stepObject.action='GetValue';
        if(desc.endsWith(' variable')){
            stepObject.target_type='JavaObject';
            stepObject.target=dataBetweenStrings('Read the value from ',' field and store in',desc); 
            stepObject.tst_step_data=dataBetweenStrings('field and store in ',' variable',desc);   
        }else if(desc.endsWith(' screen at given x, y co-ordinates and store in the given variable')){
            stepObject.target_type='TeScreen';
            stepObject.target=dataBetweenStrings('Read the value from the ',' screen at given x, y co-ordinates and store in the given variable',desc); 
        }else{
            stepObject.target_type='OracleTextField';
            stepObject.target=desc.replace('GetValue ',''); 
        }        
    }else if (desc.startsWith('Read the $property value from ') && desc.endsWith(' field and store in $data variable')){
        stepObject.action='GetValue';
        stepObject.target_type='SAPGuiWindow';
        var partialdesc=desc.replace('Read the $property value from ','');
        partialdesc=partialdesc.replace(' field and store in $data variable',''); 
        stepObject.target=partialdesc;
    }else if (desc.startsWith('GetValuefromXY using ')){
        stepObject.action='GetValuefromXY';
        stepObject.target_type='OracleNotification';
        stepObject.tst_step_data=desc.replace('GetValuefromXY using ',''); 
    }else if (desc.startsWith('Launch the ')){
        stepObject.action='LaunchBrowser';
        stepObject.tst_step_data=dataBetweenStrings('Launch the ',' browser and navigate to',desc); 
    }else if (desc.startsWith('Maximize the ')){
        stepObject.action='Maximize';
        if(desc.endsWith(' Browser')){
            stepObject.target_type=' Browser';
            stepObject.target=dataBetweenStrings('Maximize the ',' Browser',desc); 
        }else{
            stepObject.target_type=' Window';
            stepObject.target=dataBetweenStrings('Maximize the ',' Window',desc); 
        }
    }else if (desc.startsWith('Minimize the ')){
        stepObject.action='Minimize';
        if(desc.endsWith(' Browser')){
            stepObject.target_type=' Browser';
            stepObject.target=dataBetweenStrings('Minimize the ',' Browser',desc); 
        }else{
            stepObject.target_type=' Window';
            stepObject.target=dataBetweenStrings('Minimize the ',' Window',desc); 
        }
    }else if (desc.startsWith('Navigate to ') && desc.endsWith(' browser')){
        stepObject.action='Navigate';
        stepObject.target_type='Browser';
        stepObject.target=dataBetweenStrings('URL using ',' browser',desc); 
        stepObject.tst_step_data=dataBetweenStrings('Navigate to ',' URL using',desc);
    }else if (desc.startsWith('Open $ApplicationPath')){
        stepObject.action='OpenApplication';
    }else if (desc.startsWith('Output the ')){
        stepObject.action='OutputValuetoExcel';
        stepObject.target_type='JavaObject';
        stepObject.target=dataBetweenStrings('Output the ',' field value to excel',desc); 
    }else if (desc.startsWith('PressFunctionKeys ')){
        stepObject.action='PressFunctionKeys';
        stepObject.target_type='OracleFormWindow';
        stepObject.target=desc.replace('PressFunctionKeys ','');
    }else if (desc.startsWith('Press ')){
        if(desc.indexOf('Function Key on')!=-1){
            stepObject.action='PressFunctionKeys';
            stepObject.target_type='TeScreen';            
            stepObject.target=dataBetweenStrings('Function Key on ','screen',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Press ',' Function Key on',desc);
        }else if(desc.indexOf('Key on')!=-1){
            stepObject.action='PressSpecialKeys';
            stepObject.target_type='TeScreen';            
            stepObject.target=dataBetweenStrings('Key on ','screen',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Press ',' Key on',desc);
        }else if(desc.startsWith('Search ')!=-1){
            stepObject.action='SearchDataInTable';
            stepObject.target_type='OracleTable';            
            stepObject.target=dataBetweenStrings('Data ',' In Table',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Search ',' Data ',desc);
        }
    }else if (desc.startsWith('Select $data for the ')){
        stepObject.action='Type';
        if(desc.endsWith(' radio group')){           
            stepObject.target_type='OracleRadioGroup';
            stepObject.target=dataBetweenStrings('Select $data for the ',' radio group',desc);             
        }else{
            stepObject.target_type='OracleListOfValues';
            stepObject.target=desc.replace('Select $data for the ',''); 
        }
    }else if (desc.startsWith('Select ')){
        stepObject.action='Select';
        if(desc.endsWith(' Checkbox')){           
            stepObject.target_type='JavaCheckBox';            
            stepObject.target=dataBetweenStrings('Function Key on ','screen',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Press ',' Function Key on',desc);
        }else if(desc.endsWith(' list')){    
            stepObject.target_type='JavaList';            
            stepObject.target=dataBetweenStrings('from ',' list',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' from',desc);
        }else if(desc.endsWith(' Menu')){    
            stepObject.target_type='JavaMenu';            
            stepObject.target=dataBetweenStrings('Select ',' Menu',desc); 
        }else if(desc.endsWith(' Radio Button')){    
            stepObject.target_type='JavaRadioButton';            
            stepObject.target=dataBetweenStrings('Select ',' Radio Button',desc); 
        }else if(desc.endsWith(' in tree hierarchy')){    
            stepObject.target_type='JavaTree';            
            stepObject.target=dataBetweenStrings('Select ',' in tree hierarchy',desc);
        }else if(desc.endsWith('  radio button')){    
            stepObject.target_type='SwdRadioButton';            
            stepObject.target=dataBetweenStrings('Select ','  radio button',desc); 
        }else if(desc.endsWith(' checkbox')){    
            stepObject.target_type='SwfCheckBox';            
            stepObject.target=dataBetweenStrings('Select ',' checkbox',desc); 
        }else if(desc.endsWith(' combo box')){    
            stepObject.target_type='SwfComboBox';            
            stepObject.target=dataBetweenStrings('Select ',' combo box',desc); 
        }else if(desc.endsWith(' checkbox')){    
            stepObject.target_type='WebCheckBox';            
            stepObject.target=dataBetweenStrings('Select ',' checkbox',desc); 
        }else if(desc.endsWith(' OracleTabbedRegion')){    
            stepObject.target_type='OracleTabbedRegion';            
            stepObject.target=dataBetweenStrings('Select ',' OracleTabbedRegion',desc); 
        }else if(desc.indexOf('from the')!=-1){    
            stepObject.target_type='WebList';    
            stepObject.target=dataBetweenStrings('from the ',' list',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' from the ',desc);  
        }else if(desc.endsWith(' Radio Button from the list')){    
            stepObject.target_type='WebRadioGroup';            
            stepObject.target=dataBetweenStrings('Select $value from ',' Radio Button from the list',desc); 
        }else if(desc.indexOf('option from')!=-1){    
            stepObject.action='SelectMenuItem';
            stepObject.target_type='SwfToolBar';    
            stepObject.target=dataBetweenStrings('option from ',' Menu list',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' option from ',desc);   
        }else if(desc.indexOf('values from')!=-1){   
            stepObject.action='SelectMultipleValue';            
            stepObject.target_type='JavaList';    
            stepObject.target=dataBetweenStrings('values from ',' list',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' values from ',desc);   
        }else if(desc.indexOf('row from the')!=-1){   
            stepObject.action='SelectMultipleValue';            
            stepObject.target_type='WebList';
            stepObject.target=dataBetweenStrings('row from the ',' table',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' row from the ',desc);   
        }else{
            stepObject.target_type='OracleListofValues';   
            stepObject.target=desc.replace('Select the ','');  
        }
    }else if (desc.startsWith('Set cursor positions at ')){
        stepObject.action='SetCursorPosition';
        stepObject.target_type='TeScreen'; 
        stepObject.target=dataBetweenStrings('on ',' screen',desc); 
        stepObject.tst_step_data=dataBetweenStrings('Set cursor positions at ',' on ',desc);    
    }else if (desc.startsWith('Set ')){
        stepObject.action='Select';
        if(desc.endsWith(' radio box')){    
            stepObject.target_type='OracleCheckbox';    
            stepObject.target=dataBetweenStrings('for the ',' radio box',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' for the ',desc);   
        }else if(desc.endsWith(' check box')){    
            stepObject.target_type='OracleRadioGroup';    
            stepObject.target=dataBetweenStrings('for the ',' check box',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Select ',' for the ',desc);    
        }else if(desc.endsWith(' field')){    
            stepObject.action='Type';
            stepObject.target_type='JavaEdit';    
            stepObject.target=dataBetweenStrings('in ',' field',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Set ',' in ',desc);    
        }
    }else if (desc.startsWith('SelectMenuItem $data for ')){
        stepObject.action='SelectMenuItem';
        stepObject.target_type='OracleFormWindow';    
        stepObject.target=desc.replace('SelectMenuItem $data for ','');
    }else if (desc.startsWith('SelectMenuItem ')){
        stepObject.action='SelectMenuItem';
        stepObject.target_type='OracleFormWindow';    
        stepObject.target=desc.replace('SelectMenuItem ',''); 
    }else if (desc.startsWith('SelectRow ')){
        stepObject.action='SelectRow';
        stepObject.target_type='OracleTable';    
        stepObject.target=desc.replace('SelectRow ',''); 
    }else if (desc.startsWith('Wait till the ')){
        stepObject.action='Sync';
        if(desc.endsWith(' screen is loaded sucessfully')){
            stepObject.target_type='TeScreen';    
            stepObject.target=dataBetweenStrings('Wait till the ',' screen is loaded sucessfully',desc); 
        }else if(desc.endsWith(' page is loaded sucessfully')){
            stepObject.target_type='Page';    
            stepObject.target=dataBetweenStrings('Wait till the ',' page is loaded sucessfully',desc);
        }else if(desc.endsWith(' browser is loaded sucessfully')){
            stepObject.target_type='Browser';    
            stepObject.target=dataBetweenStrings('Wait till the ',' browser is loaded sucessfully',desc);
        }else{
            stepObject.target_type='OracleApplications'; 
            stepObject.target=dataBetweenStrings('Wait till the ',' application is loaded sucessfully',desc);  
        }
    }else if (desc.startsWith('SetFocus ')){
         if(desc.startsWith('SetFocus on ')){
             if(desc.endsWith('using $row and $col')){
                stepObject.action='SetFocus';
                stepObject.target_type='OracleTable';    
                stepObject.target=dataBetweenStrings('iSetFocus on ',' using $row and $col',desc); 
             }else{
                stepObject.action='SetFocus';
                stepObject.target_type='OracleCheckbox';    
                stepObject.target=desc.replace('SetFocus on ',''); 
             }
         }else{
            stepObject.action='SetFocus';
            stepObject.target_type='OracleTable';    
            stepObject.target=desc.replace('SetFocus ',''); 
         }       
    }else if (desc.startsWith('Type ')){
        stepObject.action='Type';
        if(desc.endsWith(' field')){    
            stepObject.target_type='SwfEdit';    
            stepObject.target=dataBetweenStrings('in ',' field',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Type ',' in ',desc);    
        }else{
            stepObject.target_type='WebElement';
            try{
                var n = desc.lastIndexOf(" ");    
                stepObject.target=desc.substring(5, n);    
            }catch(e){ stepObject.target='';};
            stepObject.tst_step_data=desc.replace('Type '+stepObject.target+' ',''); 
        }
    }else if (desc.startsWith('Type the text at given co-ordinates in ')){
        stepObject.action='TeScreen';
        stepObject.target_type='SwfEdit';    
        stepObject.target=dataBetweenStrings('Type the text at given co-ordinates in ',' screen',desc); 
    }else if (desc.startsWith('Verify whether the ')){
        if(desc.indexOf('item is selected in')!=-1 && desc.endsWith(' tree hierarchy')){
            stepObject.action='VerifyItemSelected';
            stepObject.target_type='JavaTree';
            stepObject.target=dataBetweenStrings('item is selected in ',' tree hierarchy',desc);
            stepObject.tst_step_data=dataBetweenStrings('Verify whether the ',' item is selected in ',desc);               
        }else if(desc.indexOf('value is selected in')!=-1){
            if(desc.endsWith(' tree hierarchy')){
                stepObject.action='VerifyItemSelected';
                stepObject.target_type='SwfTreeView';
                stepObject.target=dataBetweenStrings('value is selected in ',' tree hierarchy',desc);  
                stepObject.tst_step_data=dataBetweenStrings('Verify whether the ',' value is selected in ',desc);             
            }else{
                stepObject.action='VerifyItemSelected';
                stepObject.target_type='SwfTable';
                stepObject.target=dataBetweenStrings('value is selected in ',' table'); 
                stepObject.tst_step_data=dataBetweenStrings('Verify whether the ',' value is selected in ',desc); 
            }
        }else if(desc.endsWith('is present')){
            stepObject.action='VerifyPresent';
            if(desc.endsWith('Browser is present')){
                stepObject.target_type='Browser';
                stepObject.target=dataBetweenStrings('Verify whether the ',' Browser is present',desc); 
            }else if(desc.endsWith('WebTable is present')){
                stepObject.target_type='WebTable';
                stepObject.target=dataBetweenStrings('Verify whether the ',' WebTable is present',desc); 
            }else if(desc.endsWith('Window is present')){
                stepObject.target_type='Window';
                stepObject.target=dataBetweenStrings('Verify whether the ',' Window is present',desc); 
            }else if(desc.endsWith('menu is present')){
                stepObject.target_type='JavaMenu';
                stepObject.target=dataBetweenStrings('Verify whether the ',' menu is present',desc); 
            }else if(desc.endsWith('tab is present')){
                stepObject.target_type='JavaTab';
                stepObject.target=dataBetweenStrings('Verify whether the ',' tab is present',desc); 
            }else if(desc.endsWith('link is present')){
                stepObject.target_type='Link';
                stepObject.target=dataBetweenStrings('Verify whether the ',' link is present',desc); 
            }else if(desc.endsWith('button is present')){
                stepObject.target_type='WebButton';
                stepObject.target=dataBetweenStrings('Verify whether the ',' button is present',desc); 
            }else if(desc.endsWith('checkbox is present')){
                stepObject.target_type='WebCheckBox';
                stepObject.target=dataBetweenStrings('Verify whether the ',' checkbox is present',desc); 
            }else if(desc.endsWith('field is present')){
                stepObject.target_type='WebEdit';
                stepObject.target=dataBetweenStrings('Verify whether the ',' field is present',desc); 
            }  
        }else if(desc.endsWith('screen present')){
            stepObject.action='VerifyScreen';
            stepObject.target_type='TeScreen';
            stepObject.target=dataBetweenStrings('Verify whether the ',' screen present',desc); 
        }else if(desc.endsWith('element present')){
            stepObject.action='VerifyPresent';
            stepObject.target_type='WebElement'; 
            stepObject.target=dataBetweenStrings('Verify whether the ',' element present',desc); 
        }else if(desc.endsWith('is selected')){
            stepObject.action='VerifySelected';
            if(desc.endsWith('checkbox is selected')){
                stepObject.target_type='JavaCheckBox';
                stepObject.target=dataBetweenStrings('Verify whether the ',' checkbox is selected',desc); 
            }else if(desc.endsWith('radio button is selected')){
                stepObject.target_type='JavaRadioButton';
                stepObject.target=dataBetweenStrings('Verify whether the ',' radio button is selected',desc); 
            }else if(desc.endsWith('check box is selected')){
                stepObject.target_type='SwfCheckBox';
                stepObject.target=dataBetweenStrings('Verify whether the ',' check box is selected',desc); 
            }
        } 
    }else if (desc.startsWith('Verify whether ')){
        if(desc.endsWith(' calendar')){
            stepObject.action='VerifyItemPresent';
            stepObject.target_type='SwfCalendar';
            stepObject.target=dataBetweenStrings('is present in ',' calendar',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Verify whether ',' is present in ',desc);            
        }else if(desc.endsWith(' dialog is displayed')){
            stepObject.action='VerifyDialog';
            stepObject.target_type='JavaDialog';
            stepObject.target=dataBetweenStrings('Verify whether ',' dialog is displayed',desc); 
        }else if(desc.endsWith(' window is displayed with $data title')){
            stepObject.action='VerifyWindow';
            stepObject.target_type='OracleFlexWindow';
            stepObject.target=dataBetweenStrings('Verify whether ',' window is displayed with $data title',desc); 
        }else if(desc.endsWith(' window is displayed')){
            stepObject.action='VerifyWindow';
            stepObject.target_type='SwfWindow';
            stepObject.target=dataBetweenStrings('Verify whether ',' window is displayed',desc); 
        }else if(desc.endsWith(' page is displayed')){
            stepObject.action='VerifyPage';
            stepObject.target_type='Page';
            stepObject.target=dataBetweenStrings('Verify whether ',' page is displayed',desc); 
        }else{
            stepObject.action='VerifyOption';
            stepObject.target_type='OracleList';
            stepObject.target=desc.replace("Verify whether $data is present in ","");
        }
    }else if (desc.startsWith('Verify the text ')){
        stepObject.action='VerifyText';
        if(desc.endsWith(' field')){
            stepObject.target_type='WebEdit';
            stepObject.target=dataBetweenStrings('in the ',' field',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Verify the text ',' in the ',desc);    
        }else if(desc.endsWith(' list')){
            stepObject.target_type='WebList';
            stepObject.target=dataBetweenStrings('in the ',' list',desc); 
            stepObject.tst_step_data=dataBetweenStrings('Verify the text ',' in the ',desc);     
        }
    }else if (desc.startsWith('Verify the text is available at given co-ordinates in the ')){
        stepObject.action='VerifyTextfromXY';
        stepObject.target_type='TeScreen';
        stepObject.target=dataBetweenStrings('Verify the text is available at given co-ordinates in the ',' screen',desc); 
    }else if (desc.startsWith('Verify ')){
        if(desc.endsWith('with $data')){
            stepObject.action='Verify';
            stepObject.target_type='OracleTable';   
            stepObject.target=dataBetweenStrings('Verify ',' with $data',desc); 
        }else  if(desc.endsWith('is enabled')){
            stepObject.action='IsEnabled';
            stepObject.target_type='OracleButton';   
            stepObject.target=dataBetweenStrings('Verify ',' is enabled',desc); 
        }else  if(desc.endsWith('is disabled')){
            stepObject.action='IsDisabled';
            stepObject.target_type='OracleButton';   
            stepObject.target=dataBetweenStrings('Verify ',' is disabled',desc); 
        }else{
            stepObject.action='Verify';
            stepObject.target_type='OracleTable';   
            stepObject.target=desc.replace('Verify ','');    
        }
    }else if (desc.startsWith('Wait for the ')){
        stepObject.action='Wait';
        stepObject.target_type='Page';
        stepObject.target=dataBetweenStrings('Wait for the ',' page',desc); 
    }else if (desc.startsWith('Search $Parama data in ')){
        stepObject.action='SearchDataInTable';
        stepObject.target_type='OracleTree';
        stepObject.target=dataBetweenStrings('Search $Parama data in ',' table',desc);
    }else if (desc.startsWith('Approve ')){
        stepObject.action='Approve';        
        if(desc.endsWith('notification')){
            stepObject.target_type='OracleNotification';
            stepObject.target=dataBetweenStrings('Approve ',' notification',desc);
        }else{
            stepObject.target_type='OracleFlexWindow';
            stepObject.target=dataBetweenStrings('Approve ',' window',desc);
        }      
    } else if (desc.startsWith('Decline ')){
        stepObject.action='Decline';   
        stepObject.target_type='OracleNotification';
        stepObject.target=dataBetweenStrings('Decline ',' notification',desc);
    } else if (desc.startsWith('Find cell $rownumber, $ColumnName and set $data for ')){
        stepObject.action='SetCellData';   
        stepObject.target_type='OracleTable';
        stepObject.target=dataBetweenStrings('Find cell $rownumber, $ColumnName and set $data for ',' table',desc);
    } else if (desc.startsWith('Get celldata of $row,$col from ')){
        stepObject.action='GetCellData';   
        stepObject.target_type='OracleTable';
        stepObject.target=desc.replace('Get celldata of $row,$col from ','');
    } else if (desc.startsWith('Deselect ')){
        stepObject.action='Deselect';   
        stepObject.target_type='OraclePicklist';
        stepObject.tst_step_data=dataBetweenStrings('Deselect ',' from',desc); 
        stepObject.target=dataBetweenStrings('from',' picklist',desc);   
    } else if (desc.startsWith('Check whether ')){
        stepObject.action='IsChecked';   
        if (desc.endsWith('checkbox is selected or not')){
            stepObject.target_type='OracleCheckbox';
            stepObject.target=dataBetweenStrings('Check whether ',' checkbox is selected or not',desc);  
        }else{
            stepObject.target_type='OracleRadioGroup';
            stepObject.target=dataBetweenStrings('Check whether ',' radiogroup is selected or not',desc);   
        }
    } else if (desc.startsWith('CaptureScreen for ')){
        stepObject.action='CaptureScreen';   
        stepObject.target_type='OracleApplications';
        stepObject.target=desc.replace('CaptureScreen for ','');   
    } else if (desc.startsWith('Close the $data node of ')){
        stepObject.action='Collapse';   
        stepObject.target_type='OracleTree';
        stepObject.target=dataBetweenStrings('Close the $data node of ',' tree view',desc); 
    }  else if (desc.startsWith('Expand $data node of the ')){
        stepObject.action='Expand';   
        stepObject.target_type='OracleTree';
        stepObject.target=dataBetweenStrings('Expand $data node of the ',' tree view',desc); 
    } else if (desc.startsWith('Press $data key on ')){
        stepObject.action='PressSpecialKeys';   
        stepObject.target_type='OracleApplications';
        stepObject.target=desc.replace('Press $data key on ',''); 
    } else if (desc.startsWith('SelectContextMenuItem $data for ')){
        stepObject.action='SelectContextMenuItem';   
        stepObject.target_type='OracleApplications';
        stepObject.target=desc.replace('SelectContextMenuItem $data for ',''); 
    } else if (desc.startsWith('SelectFunction $data for ')){
        stepObject.action='SelectFunction';   
        stepObject.target_type='OracleNavigator';
        stepObject.target=desc.replace('SelectFunction $data for ',''); 
    }  else if (desc.startsWith('Opens a specified record field\'s associated dialog box for ')){
        stepObject.action='OpenDialog';   
        stepObject.target_type='OracleTable';
        stepObject.target=dataBetweenStrings('Opens a specified record field\'s associated dialog box for ',' using  $recordNo and $col',desc);  
    } else if (desc.startsWith('Opens the field\'s associated dialog box for ')){
        stepObject.action='OpenDialog';   
        stepObject.target_type='OracleTextField';
        stepObject.target=desc.replace('Opens the field\'s associated dialog box for ',''); 
    } else if (desc.startsWith('Presses a $button toolbar button for ')){
        stepObject.action='PressToolbarButton';   
        stepObject.target_type='OracleFormWindow';
        stepObject.target=desc.replace('Presses a $button toolbar button for ',''); 
    } else if (desc.startsWith('Refesh ')){
        stepObject.action='RefreshObject';   
        stepObject.target_type='OracleApplications';
        stepObject.target=dataBetweenStrings('Refesh ',' object',desc);   
    } 
}

function dataBetweenStrings(startsWith,endsWith,desc)
{    
    try{
        var regExString = new RegExp("(?:"+startsWith+")(.*?)(?:"+endsWith+")", "ig");
        var testRE = regExString.exec(desc);

        if (testRE && testRE.length > 1)
        {  
        return testRE[1]; 
        }
    }catch(err){};
    return "";
}



module.exports.service = {
    import:importFile,
};