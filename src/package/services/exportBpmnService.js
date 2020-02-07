var builder = require('xmlbuilder');

function exportBpmnService(response, data, userData){
    global.appConstants.dbConstants.tableObj.modelVersion.find({id: data.daigram_id}, function(err, modelVersionObj) {  
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else if(modelVersionObj.length == 1){
                var daigramJson = JSON.stringify(modelVersionObj[0].diagram_data);
                var blobdaigramParsed = JSON.parse(daigramJson);
                var blobdaiData = blobdaigramParsed.cells;
                if(validateBpmnDaigram(blobdaiData)){
                    var respBody = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        status: 1
                    }
                    global.appLog.debug("console:" + JSON.stringify(respBody));
                    response.end(JSON.stringify(respBody));
                                
                }else{
                    var bpmnXMLData = convertDaigramToBpmnXml(daigramJson)
                    var respBody = {
                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                        code: "200",
                        data: bpmnXMLData,
                        daigramName:modelVersionObj[0].diagram.name+"_"+modelVersionObj[0].description
                    }
                    global.appLog.debug("console:" + JSON.stringify(respBody));
                    response.end(JSON.stringify(respBody));
                                
                }
                
        }else{
            var respBodys = {
                msg: global.errorDescs.errorDesc.desc.SUCCESS,
                code: "200",
                data: "Daigram Not exist"
            }
            global.appLog.debug("console:" + JSON.stringify(respBodys));
            response.end(JSON.stringify(respBody));
        }

   });
  
   
}

function convertDaigramToBpmnXml(diagramJson){
    var blobdaigram = JSON.parse(diagramJson);
    var blobdaigramData = blobdaigram.cells;
    var root = builder.create('bpmn:definitions').att("exporter","Mega")
     .att("targetNamespace","http://www.mega.com/bpmn20")
     .att("xmlns:bpmn","http://www.omg.org/spec/BPMN/20100524/MODEL")
     .att("xmlns:bpmndi","http://www.omg.org/spec/BPMN/20100524/DI")
     .att("xmlns:dc","http://www.omg.org/spec/DD/20100524/DC")
     .att("xmlns:di","http://www.omg.org/spec/DD/20100524/DI")
     .att("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance")
    var processRoot = root.ele("bpmn:process");
    var shapeRoot = root.ele("bpmndi:BPMNDiagram").ele("bpmndi:BPMNPlane");
    for(var i=0;i<blobdaigramData.length;i++){
       createBPMN(blobdaigramData[i],processRoot,shapeRoot);
    } 
    var xml = root.end({ pretty: true});
    return xml;
  }
  
  function createBPMN(blobdaigramData,processRoot,shapeRoot){

  if(blobdaigramData!=undefined){
    var type = blobdaigramData.type;
    
    if(type!='app.Link'){
        var id= addIdIsString(blobdaigramData.id);
        createprocess(type,id,processRoot,blobdaigramData);
        createshape(id,shapeRoot,blobdaigramData)
      
     }else if(type=='app.Link'){
        var id= addIdIsString(blobdaigramData.id);
        var sourceId=addIdIsString(blobdaigramData.source.id);
         var targetId=addIdIsString(blobdaigramData.target.id);
         createLinkprocess(id,sourceId,targetId,processRoot);
         createshape(id,shapeRoot,blobdaigramData)
     }   
}
       
} 
 
function  createshape(id,shapeRoot,blobdaigramData){
   if(blobdaigramData.type!="app.Link"){ 
        var i=0;
        var shapeRoot= shapeRoot.ele("bpmndi:BPMNShape").att("id",id+i++).att("bpmnElement",id);
        shapeRoot.ele("dc:Bounds").att("width",blobdaigramData.size.width).att("height",blobdaigramData.size.height)
        .att("x",blobdaigramData.position.x).att("y",blobdaigramData.position.y);
    }else{
        var j=0;
       var shapeRoot = shapeRoot.ele("bpmndi:BPMNEdge").att("id",id+j++).att("bpmnElement",id);
       if(blobdaigramData.hasOwnProperty("waypoint")){
        shapeRoot.ele("di:waypoint").att("x",blobdaigramData.waypoint.x).att("y",blobdaigramData.waypoint.y);
       }else{
        shapeRoot.ele("di:waypoint").att("x",blobdaigramData.vertices[0].x).att("y",blobdaigramData.vertices[0].y);
       }
        
    } 
}

 function  createLinkprocess(id,sourceId,targetId,processRoot){
    processRoot.ele("bpmn:sequenceFlow").att("id",id).att("sourceRef",sourceId).att("targetRef",targetId);
 }
 function createprocess(type,id,processRoot,blobdaigramData){   
    
    if(type=="fsa.StartState" || type=="fsa.State"){
        processRoot.ele("bpmn:startEvent").att("id",id);
     }else if (type=="fsa.EndState"){
        processRoot.ele("bpmn:endEvent").att("id",id);
     }else if(type=="bpmn.Activity"){
         if(blobdaigramData.hasOwnProperty("content")){
            textName = blobdaigramData.content;
         }else{
            textName = "";
         }

        processRoot.ele("bpmn:task").att("id",id).att("name",textName);

     }else if(type=="bpmn.Gateway"){
        if(blobdaigramData.hasOwnProperty(".label")){
            name=blobdaigramData.attrs[".label"].text;
        }else{
            name="";
        } 
        processRoot.ele("bpmn:exclusiveGateway").att("id",id).att("name",name);
     }else if(type=="bpmn.Event"){
        if(blobdaigramData.hasOwnProperty(".label")){
            name=blobdaigramData.attrs[".label"].text;
        }else{
            name="";
        } 
        processRoot.ele("bpmn:intermediateThrowEvent").att("id",id).att("name",name);
     }else if(type == "bpmn.Group"){
        if(blobdaigramData.hasOwnProperty(".label")){
            name=blobdaigramData.attrs[".label"].text;
        }else{
            name="";
        } 
        processRoot.ele("bpmn:group").att("id",id).att("name",name);
     }else if(type== "bpmn.DataObject"){
        if(blobdaigramData.hasOwnProperty(".label")){
            name=blobdaigramData.attrs[".label"].text;
        }else{
            name="";
        } 
        processRoot.ele("bpmn:dataObjectReference").att("id",id).att("name",name);
     }else if(type== "bpmn.Conversation"){
        if(blobdaigramData.hasOwnProperty(".label")){
            name=blobdaigramData.attrs[".label"].text;
        }else{
            name="";
        } 
        processRoot.ele("bpmn:conversation").att("id",id).att("name",name);
    }else if(type == "bpmn.Annotation"){
        if(blobdaigramData.hasOwnProperty("content")){
            name=blobdaigramData.content;
        }else{
            name="";
        } 
        processRoot.ele("bpmn:participant").att("id",id).att("name",name);
    }   
}   

function validateBpmnDaigram(blobdaiData){
    var isValid=false;
    var type;
    for(var i=0;i<blobdaiData.length;i++){
        type=blobdaiData[i].type;
        if(type == "app.RectangularModel" || type == "erd.Relationship" || type == "erd.Entity" || type == "basic.Path"){
            isValid=true;
            break;
        }
    } 

    return isValid;
}

function addIdIsString(id){
   return "Id"+"_"+id;
}

module.exports.service = {
    exportBpmnService :exportBpmnService
}