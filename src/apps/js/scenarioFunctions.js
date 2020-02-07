var flow = new Array();
var flowIds=new Array();
var scnerios = new Array();
var scenariosDataDB = new Array();
var existingflow = new Array();
var balance =new Array();
var baseFlow = {};
var mm ;
var previousScenario;
var noOfScenariosAdded=0;
var noOfScenariosDeleted=0;
var noOfScenariosModified=0;

var primaryIds= new Array();
var sanityIds= new Array();
var normalIds= new Array();
var alternateIds= new Array();
var exceptionIds= new Array();
var allIds= new Array();
var appGraph;
var scneriosOld;
var componentarr=new Array();
var scenariotestsuiteDB = new Array();
var componentversionId;
var componentnodeId = new Array();
var seletectedscenariosId = new Array();
var selectednodeId=[];
var selectedSecIndex=-1;
var pathCoverageSelectedFlag=false;
var selectedNodes= new Array();
var havingLoopsInGenSce=false;

var columns= [
    { title: "<input type='checkbox' name='sceIdCheck' id='sceIdCheck_All' value='All' />"},
    { title: "<img src='images/risk.gif'/>"},
    { title: "SI" },
    { title: "Id" },
    { title: "Name" },
    { title: "Criticality" },
    { title: "Severity" },
    { title: "Risk Index" },
    { title: "Defects" },
    { title: "Frequency" }
]
 
function generateScenarios(path,graph) {
    //  $("#scenDrop").html(' <select class="joint-theme-modern joint-widget" id="btn-scenario" name="btn-scenario"  style="float:right;height: 30px;"  data-tooltip-position="top" data-tooltip-position-selector=".toolbar-container" data-type="select" data-name="0"> <option>Please Generate Scenario</option>    </select> ');
    appGraph=graph;
    $(".flowScen").remove();
    scnerios = new Array();
    flow = new Array();
    flowIds=new Array();
    havingLoopsInGenSce=false;
    $(this).css("background-color",$(this).data('color'));
    $(this).css("border",'');
    var rootIndex = 0;        
    var found = false;
    var rootNode = appGraph.getElements()[rootIndex];
    var totalNodes = appGraph.getElements();
    for(var i=0;i<totalNodes.length;i++){
        if(appGraph.isSource(appGraph.getElements()[i]) == true){
            if(found == false){
                rootNode = appGraph.getElements()[i];
                rootIndex = i;
                found = true;
            }
        }
        if(i == totalNodes.length-1){
            setTimeout(function(){

                proceedAfterRetrievingRoot();
            },100);
        }
    }
    
    function proceedAfterRetrievingRoot(){
        var count = appGraph.getConnectedLinks(rootNode, { outbound: true })[0];
        flow.push(rootNode);
        flowIds.push(rootNode.id);
        //rootNode.attr({circle: { fill: '#3CB371' }, 	});
        checkForCycleExistence(count);
        //$('select[name=btn-scenario] > option:first-child').text('Please Select Scenarios');
        if(!havingLoopsInGenSce){
            if(path=='toolbar'){
                //store scenarios in database
                if(scnerios.length > 0) {     
                  saveScenarios(scnerios);    
                  $('#btn-png-scenario1').removeClass('icon-btn-disable');                 
                }
            }else{
                //clearHighlightedScenarios();
                scneriosOld=new Array();
                scneriosOld= JSON.parse(JSON.stringify(scnerios));
                if(scnerios.length >0){
                    $('#filterScenarioDiv').show();
                }
            }
        }else{
            $('#bodyoverlay').removeClass('overlay'); 
            $("#modal-bg").removeClass('bgopacity');
            $('#btn-publish-version').addClass('icon-btn-disable');
            dailogmsg("Having Loops in Model diagram.Scenario's cannot be generated");
        }
    }
}

var tempBaseFlow=new Array();
function checkForCycleExistence(count) {
    if(isElementExists(flowIds,count.id)){
          scnerios=[];
          balance=[];
          tempBaseFlow=[];
          havingLoopsInGenSce=true;
          return;
    }else{
        flow.push(count);
        flowIds.push(count.id);        
    }
    var targets =  getElements(count.getTargetElement());
    //console.log(targets.length);
    if(targets.length > 1){

        var elem =targets[0];
        targets.shift();
        for(var i=0;i<targets.length;i++){
            balance.unshift(targets[i]);
        }
        for(var j=0;j<flow.length;j++){
            tempBaseFlow.push(flow[j]);
        }
        checkForCycleExistence(elem);
    }else{
        if(targets[0] != undefined){
            checkForCycleExistence(targets[0]);
        }else{
            scnerios.push(flow);
            flow = new Array();
            flowIds = new Array();
            for(var i=0;i<tempBaseFlow.length;i++){
                // flow.push(tempBaseFlow[i]);
            }

            if(balance.length != 0 ){

                var sec = balance[0];

                var lastflow = scnerios[scnerios.length-1];
                var lastIndex;
                for(var j=0;j<lastflow.length;j++){
                    if(sec.getSourceElement().id.toString() == lastflow[j].id.toString()){
                        lastIndex = j;

                    }
                }

                copyBaseElements(flow,lastflow,lastIndex);
                balance.shift();
                checkForCycleExistence(sec);

            }
        }
    }

}
function copyBaseElements(flow,lastflow,lastIndex){
    for(var i=0;i<=lastIndex;i++){
        flow.push(lastflow[i]);
        flowIds.push(lastflow[i].id);
    }
}
function getElements(link){
    try{
        flow.push(link);
        flowIds.push(link.id);
        return appGraph.getConnectedLinks(link, { outbound: true });
    }catch(err){
        console.log(err);   
        return ['RangeError'];     
    }    
}

function applyColorforFlow(){
   $("#scenarioDataDiv").append('<table id="scenariosTable" class="display" width="100%"></table>');
   //var scenes = '<ul>';
    var dataSet = [];
    var criticaldata =[];
    var criticalcountlen=0;
    $(".matricsAccordion").css("display","block");
       
    sanityIds.clear();normalIds.clear();exceptionIds.clear();primaryIds.clear();alternateIds.clear();allIds.clear();
    for(var i=0;i<scenariosDataDB.length; i++){
        //$('select').append( '<option value="'+(i+1)+'" class=flowScen>' + 'Scenario '+ (i+1) + '</option>' );
       // scenes += '<li data-val="'+(i+1)+'" value="'+scenariosDataDB[i].id+'">Scenario '+scenariosDataDB[i].scenario_index+'</li>';
      /*  if(i == scenariosDataDB.length-1){
            $(".scenarioContainer").append(scenes+'</ul>');
        }*/
        var checkboxStr='<input type="checkbox" name="sceIdCheck" id="sceIdCheck_'+scenariosDataDB[i].scenario_index+'" value=\"'+scenariosDataDB[i].scenario_index+'\">';
        var riskImageStr='';
        if(scenariosDataDB[i].risk_exposer=='High'){
            riskImageStr="<img src='images/highrisk.gif' style='height:12px;'/>";
        }else if (scenariosDataDB[i].risk_exposer=='Medium'){
            riskImageStr="<img src='images/mediumrisk.gif'  style='height:12px;'/>";
        }else{
            riskImageStr="<img src='images/lowrisk.gif'  style='height:12px;'/>";
        }
        var sceName=scenariosDataDB[i].name;
        sceName=(sceName.length>12)?sceName.substring(0,10)+"...":sceName;
        var rowData=[checkboxStr,riskImageStr,(i+1),'Scenario'+scenariosDataDB[i].scenario_index,sceName,scenariosDataDB[i].criticality,scenariosDataDB[i].severity,scenariosDataDB[i].risk,scenariosDataDB[i].defects,scenariosDataDB[i].frequency];
        dataSet.push(rowData);
        if(scenariosDataDB[i].criticality==5){
            sanityIds.push(rowData);
        }
        if (scenariosDataDB[i].exception==0){
            normalIds.push(rowData);
        }
        if (scenariosDataDB[i].exception==1){
            exceptionIds.push(rowData);
        }
        if (scenariosDataDB[i].primary_flow==1){
            primaryIds.push(rowData);
        }
        if (scenariosDataDB[i].primary_flow==0 && scenariosDataDB[i].exception==0){
            alternateIds.push(rowData);
        }
        allIds.push(rowData);
        criticaldata.push(scenariosDataDB[i].criticality);
        
    }
      var maxCritical =  Math.max.apply(null, criticaldata);
     for(var i=0;i<criticaldata.length;i++){
         if(criticaldata[i]==maxCritical){
            criticalcountlen++;
         }
     }
    $("#modelscenarioId").text(scenariosDataDB.length);
    $("#modelSanity").text(sanityIds.length);
    $("#modelNormal").text(normalIds.length);
    $("#modelException").text(exceptionIds.length); 
    $("#modelCriticality").text(criticalcountlen);
    callDataTable('scenariosTable',dataSet,columns);
    $('td.dataTables_empty').text(labelObj.noDataText);
    criticalcountlen=0;
}

function filterScenarios(value) {
    if (value == 1) {
       
        updateDataTableData('scenariosTable',sanityIds);
    } else if (value == 2) {
        updateDataTableData('scenariosTable',normalIds);
    } else if (value == 3) {
        updateDataTableData('scenariosTable',primaryIds);
    } else if (value == 4) {
        updateDataTableData('scenariosTable',alternateIds);
    } else if (value == 5) {
        updateDataTableData('scenariosTable',exceptionIds);
    } else {
        updateDataTableData('scenariosTable',allIds);
    }
}

/*  function filterScenarios(value){
    if(value==1){
        displayScenarios(sanityIds);
    }else if(value==2){
        displayScenarios(normalIds);
    }else if(value==3){
        displayScenarios(primaryIds);
    }else if(value==4){
        displayScenarios(alternateIds);
    }else if(value==5){
        displayScenarios(exceptionIds);
    }else{
        displayScenarios(new Array());
    }
  function displayScenarios(input){
        if(input.length>0){
            $('.scenarioContainer ul li').hide();
            $.each(input, function (index, scnerioId) {
                $('.scenarioContainer ul li').each(function() {
                    if($(this).val()==scnerioId){
                        $(this).show();
                    }
                });
            });
        }else{
            $('.scenarioContainer ul li').show();
        }
    }
}*/
function bindChangeEventToScenarios(thisObj){
    //$('#btn-scenario').change(function() {
        //value 'scen_det' will be changed according to the requirement
        $('#scenariosTable tr').removeClass('liActive');
        if(!isTestSuite){
            isScenarioSelected = true;
           $('#bodyoverlay').addClass('overlay');
         
           if(isScenarioSelected == true && isNodeSelected == false){
                $("#scenarioTab").removeClass('icon-btn-disable');
                $("#TestConditions").addClass('icon-btn-disable');
                
           }else if(isScenarioSelected == true && isNodeSelected == true){
                $("#scenarioTab").removeClass('icon-btn-disable');
                $("#TestConditions").removeClass('icon-btn-disable');

           }

           var slectedRow=thisObj;
           window.setTimeout( function(){getselectedScenario(slectedRow)} ,1);
        }else{
            openBottomToolbar();
            if(pathCoverageSelectedFlag==true){
                $("a[data-prop='PathCoverage_trace']").click();
            }else {
                $("a[data-prop='preview_test']").click();
            }
            $("#exportexcel").prop('disabled', false);
            $("#PreviewTable tbody tr ").remove();
            thisObj.addClass('liActive');
            //$('#scenariosTable').find("th:first").removeClass('sorting_asc');
            var trIndex=thisObj.find("td:nth-child(3)").html();
            selectedSecIndex=trIndex-1;
            if(trIndex==undefined){
                clearExistingScnerios();
            }else{
                applyColor(trIndex);
            }
        }
        function applyColor(index){
            clearExistingScnerios();
            previousScenario = index - 1;
            var currentFlow = scnerios[previousScenario];
            applyColorToSelectedScenario(currentFlow);
        }
        function getselectedScenario(slectedRow){
            $("#PreviewTable tr td").remove();
            var index=slectedRow.find("td:nth-child(2)").html();
            if(index==undefined){
                //this is called when user clicks on table header
                clearExistingScnerios();
                closeBottomToolbar()
            }else {
                slectedRow.addClass('liActive');
                slectedRow.find(".sorting_1").removeClass('sorting_1');
                openBottomToolbar();
                if(isscenariotab){
                    $("a[data-prop='step_desc']").click();
                }else{
                    $("a[data-prop='scen_det']").click();
                }                
                var scenarioID = scenariosDataDB[index - 1].id;
                setScenarioData(scenarioID);
                applyColor(index);
                $("#descTable tbody tr ").remove();
                displayDescription(scenariosDataDB[index - 1]);
            }
            $('#bodyoverlay').removeClass('overlay');
        }
}

function setScenarioData(scenarioID){
    for(var i=0;i<scenariosDataDB.length;i++){
        if(scenarioID==scenariosDataDB[i].id){
            $("#sceDet_id").val(scenarioID);
            $("#sceDet_scenId").val('Scenario'+scenariosDataDB[i].scenario_index);
            $("#sceDet_name").val(scenariosDataDB[i].name);
            $("#sceDet_criticality").val(scenariosDataDB[i].criticality);
            $("#sceDet_severity").val(scenariosDataDB[i].severity);
            $("#sceDet_defects").val(scenariosDataDB[i].defects);
            $("#sceDet_riskEx1").val(scenariosDataDB[i].risk_exposer);
            $("#sceDet_riskEx2").val(scenariosDataDB[i].risk);
            $("#sceDet_testEff").val(scenariosDataDB[i].testing_effort);
            $("#sceDet_primFlow").val(scenariosDataDB[i].primary_flow);
            //$("#sceDet_preCnd").val(scenariosDataDB[i].pre_condition);
            //$("#sceDet_postCnd").val(scenariosDataDB[i].post_condition);
            if(scenariosDataDB[i].primary_flow==1){
                $("#sceDet_primFlow").prop('checked', true);
            }else{
                $("#sceDet_primFlow").prop('checked', false);
            }
            //renderRequirements(i);
            return;
        }
    }

}

function clearHighlightedScenarios(currentFlows) {
    if (currentFlows.length > 0) {
        $.each(currentFlows, function (index, currentFlow) {
            clearSelectedScenario(currentFlow);
        });
    }
}

function clearSelectedScenario(currentFlow){
    if(currentFlow != undefined){
        for(var j=0;j<currentFlow.length; j++){
            clearColorToCell(currentFlow[j]);
        }
    }
}
function applyColorToSelectedScenario(currentFlow){
    //var start = new Date().getTime();
    for(var j=0;j<currentFlow.length; j++){
        applyColorToCell(currentFlow[j]);
    }
    //var end = new Date().getTime();
    //console.log('applyColorToSelectedScenario: ' + (end - start));    
}

function  applyColorToCell(cell){
    var start = new Date().getTime();
    cell.attr({
        circle: { fill: '#3CB371' },
    });
    cell.attr({
        path: { fill: '#3CB371' },
    });

    cell.attr('rect', {
        fill:'#3CB371'
    });

    cell.attr('rect', {
        fill:'#3CB371'
    });

    cell.attr({
        '.connection': { stroke: '#3CB371' },
        '.marker-source': { fill: '#3CB371', d: 'M 10 0 L 0 5 L 10 10 z' },
        '.marker-target': { fill: '#3CB371', d: 'M 10 0 L 0 5 L 10 10 z' },
        '.body': {fill: '#3CB371'}
    });

    cell.attr({
        polygon: { fill: '#3CB371', 'stroke-width': 3, stroke: '#3c4260' },

    });
    var end = new Date().getTime();
    console.log('apply Color To Cell: ' + (end - start));    
}

function  clearColorToCell(cell){
    cell.attr({
        circle: { fill: '#dcd7d7' },
    });
    cell.attr({
        path: { fill: '#6b6c8a' },
    });

    cell.attr('rect', {
        fill:'#dcd7d7'
    });

    cell.attr({
        '.connection': { stroke: '#6b6c8a' },
        '.marker-source': { fill: '#6b6c8a', d: 'M 10 0 L 0 5 L 10 10 z' },
        '.marker-target': { fill: '#6b6c8a', d: 'M 10 0 L 0 5 L 10 10 z' },
        '.body': {fill: '#6b6c8a'}
    });

    cell.attr({
        polygon: { fill: '#6b6c8a', 'stroke-width': 3, stroke: '#3c4260' },

    });
}

function applyColorToSelectedScenarios(currentFlows){
    if (currentFlows.length > 0) {
        for(var j=0;j<currentFlows.length; j++){
            applyColorToSelectedScenario(currentFlows[j]);
        }
    }
}

function clearExistingScnerios(){
    if(previousScenario != undefined){
        var currentFlow = scnerios[previousScenario];
        clearSelectedScenario(currentFlow);
    }
}

function saveScenarios(scenarioData){
    //create generated scenarios
    var scenariosJSON=new Array();
    var componentMap=calculateComponentFrequency();
    var modelVersionId = (currentSelectedNode.id).split("_")[1];
    var primaryFlow=0;
    var isPrimaryflowSet=false;
    var sanityIndexs=getSanityScenarios(scenarioData);   
    for(var index=0;index<scenarioData.length; index++){
        var currentScenario=scenarioData[index];
        var sceIndex=index+1;
        var sceId="Scenario"+sceIndex;
        var scePath="";
        var sceName="";
        var criticality=4;
        var severity=1;
        var defects=1;
        var risk=0;
        var exception=0;
        var frequency=0;
        var isSanityFlow=false;       
        for(var j=0;j<currentScenario.length; j++){
            scePath=scePath+currentScenario[j].id+",";
            frequency+=componentMap[currentScenario[j].id];
            sceName+=getComponentName(currentScenario[j]);
        }
        if (sanityIndexs.includes(index)) {
            isSanityFlow=true;
        }
        if(havingExceptionNode(currentScenario)){
            primaryFlow=0;
            criticality=2;
            exception=1;
        }else if(!isPrimaryflowSet && ((isSanityFlow && sanityIndexs[0]==index) || sanityIndexs.length==0)){
            isPrimaryflowSet=true;
            primaryFlow=1;
            criticality=5;
        }else{
            primaryFlow=0;
            criticality=4;
            if(isSanityFlow){
                criticality=5;
            }
        }
        if (sceName.length > 2000) {
            sceName = sceName.substr(0, 2000) + "...";
        } 
        risk=defects * parseFloat(((criticality + severity) / 2));
        var dataJson = {scenarioId:sceId,name:sceName,path:scePath,scenarioIndex:sceIndex,criticality:criticality,defects:0,severity:1,risk_exposer1:'Low',risk_exposer2:risk,testing_effort:0.0,exception:exception,primaryFlow:primaryFlow,modelVersionId:modelVersionId,frequency:frequency,preCond:null,postCond:null};
        scenariosJSON.push(dataJson);
    }
    var lengthOfdb=scenariosDataDB.length;
    var lengthOfJson=scenariosJSON.length;
    for (var j = 0; j < lengthOfJson; j++) {
        for (var i = 0; i < lengthOfdb; i++) {
            if (scenariosDataDB[i].path === scenariosJSON[j].path) {
                scenariosJSON[j].name = scenariosDataDB[i].name;
                scenariosJSON[j].defects = scenariosDataDB[i].defects;
                scenariosJSON[j].testing_effort = scenariosDataDB[i].testing_effort;
               // scenariosJSON[j].criticality = scenariosDataDB[i].criticality;
                scenariosJSON[j].severity = scenariosDataDB[i].severity;
                //scenariosJSON[j].primaryFlow = scenariosDataDB[i].primary_flow;
            }
        }
    }
    noOfScenariosDeleted=0;
    noOfScenariosAdded=0;
    noOfScenariosModified=0;
    for (var j = 0; j < lengthOfJson; j++) {
        if (!isSamePath(scenariosDataDB, scenariosJSON[j].path)) {
            noOfScenariosAdded++;
        }
    }

    for (var i = 0; i < lengthOfdb; i++) {
        if (!isSamePathForDelete(scenariosJSON, scenariosDataDB[i].path,i)) {
            noOfScenariosDeleted++;
        }
    }

    function isSamePathForDelete(arr, value, scenarioNo) {
        var lengthOfArr = arr.length;
        for (var i = 0; i < lengthOfArr; i++) {
            if (arr[i].path === value) {
                try {
                    if (noOfScenariosAdded == 0) {
                        var scenarioOldChaildArry = scneriosOld[i];
                        var scenarioChaildArry = scnerios[i];
                        //console.log("scenarioOld no: " + scenarioNo + " ::Number of Nodes: " + scenarioOldChaildArry.length);
                        //console.log("scenarioJSON no:" + i + " ::Number of Nodes: " + scenarioChaildArry.length);
                        var lengthOfArry = scenarioOldChaildArry.length;
                        for (var k = 0; k < lengthOfArry; k++) {
                            //console.log("ScenarioModified scenariosJSON no :" + i + "  ::Node no :" + k + "::Node type " + scenarioOldChaildArry[k].type);
                            if (scenarioOldChaildArry[k].type != "app.Link" && scenarioOldChaildArry[k].type != "fsa.State" ) {
                                if (scenarioOldChaildArry[k].id == scenarioChaildArry[k].attributes.id) {
                                    if (scenarioOldChaildArry[k].type == "app.RectangularModel" || scenarioOldChaildArry[k].type == "bpmn.Gateway" || scenarioOldChaildArry[k].type == "bpmn.Event"
                                        || scenarioOldChaildArry[k].type == 'bpmn.DataObject' || scenarioOldChaildArry[k].type == 'bpmn.Conversation' || scenarioOldChaildArry[k].type == 'bpmn.Message'
                                        || scenarioOldChaildArry[k].type == 'bpmn.Group') {
                                        //alert("in side RectangularModel scenarioOldChaildArry["+k+"].type ::"+scenarioOldChaildArry[k].type );
                                        //alert("in side scenarioOldChaildArry["+k+"].attrs['.label'].text ::"+scenarioOldChaildArry[k].attrs['.label'].text +"\nscenarioChaildArry["+k+"].attributes.attrs['.label'].text ::"+scenarioChaildArry[k].attributes.attrs['.label'].text );
                                        //console.log("in Rectangular if old text ::" + scenarioOldChaildArry[k].attrs['.label'].text + " ::new text:" + scenarioChaildArry[k].attributes.attrs['.label'].text);
                                        if (scenarioOldChaildArry[k].attrs['.label'].text != scenarioChaildArry[k].attributes.attrs['.label'].text) {
                                            noOfScenariosModified++;
                                        }
                                    }  else if (scenarioOldChaildArry[k].type == 'bpmn.Choreography' || scenarioOldChaildArry[k].type == 'bpmn.Activity' || scenarioOldChaildArry[k].type == 'bpmn.Annotation') {
                                        if (scenarioOldChaildArry[k].attrs['.content'].html != scenarioChaildArry[k].attributes.attrs['.content'].html) {
                                            noOfScenariosModified++;
                                        }
                                    }  else {
                                        //alert("else RectangularModel scenarioOldChaildArry["+k+"].type ::"+scenarioOldChaildArry[k].type );
                                        // alert("in side scenarioOldChaildArry["+k+"].attrs.text.text ::"+scenarioOldChaildArry[k].attrs.text.text +"\nscenarioChaildArry["+k+"].attributes.attrs.text.text ::"+scenarioChaildArry[k].attributes.attrs.text.text );
                                        //console.log("in Rectangular else old text:" + scenarioOldChaildArry[k].attrs.text.text + "   ::new text ::" + scenarioChaildArry[k].attributes.attrs.text.text);
                                        if (scenarioOldChaildArry[k].attrs.text.text != scenarioChaildArry[k].attributes.attrs.text.text) {
                                            noOfScenariosModified++;
                                            //var msg = "ScenarioModified scenariosJSON no :" + i + "  ::Node no :" + k+ "\nscneriosOldText: " + scenarioOldChaildArry[k].attrs.text.text+ "\nscnerioText    : " + scenarioChaildArry[k].attributes.attrs.text.text + "\nscneriosOldid  : " + scenarioOldChaildArry[k].id+ "\nscnerioid      : " + scenarioChaildArry[k].attributes.id+ "\nTotalScenariosModified  yet    : " + noOfScenariosModified;
                                            // alert(msg);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.log("err.message\n" + err.message);
                }
                return true;
            }
        }
        return false;
    }

    function isSamePath(arr, value) {
        var lengthOfArr= arr.length;
        for (var i = 0; i < lengthOfArr; i++) {
            if (arr[i].path === value) {
                return true;
            }
        }
        return false;
    }

    setRiskExposure(scenariosJSON);
    var data = {fileAdd:"CGS",scenarios:scenariosJSON};
    sendAJAX(data,app_server_url,function(data){
        if(data["code"] == '200'){
            var msg ="Total "+scnerios.length
            + " Scenario(s) Generated. \n</br>"
            + noOfScenariosAdded
            + " new scenario(s) Added.\n</br>"
            + noOfScenariosModified + " scenario(s) Modified.\n</br>"
            + noOfScenariosDeleted + " scenario(s) Deleted.";
            dailogmsg(msg);
            getScenarios(modelVersionId);
        }else{
            dailogmsg(data["msg"]);
        }
    });

}

function getComponentName(currentNode){
    var text="";
    try {
        if (currentNode.attributes.type == 'fsa.StartState') {
            text = 'Start - ';
        } else if (currentNode.attributes.type == 'fsa.EndState') {
            text = 'End';
        } else if (currentNode.attributes.type == 'app.Link') {               
            if(currentNode.attributes.labels != undefined && currentNode.attributes.labels.length>0){
                  if(currentNode.attributes.labels[0].attrs.text.text!=''){
                    text = currentNode.attributes.labels[0].attrs.text.text+" - ";
                  }else{
                    text=' ';
                  }                  
            }
        } else if (currentNode.attributes.type == 'erd.Relationship' || currentNode.attributes.type == 'erd.Entity' || currentNode.attributes.type == 'erd.Normal') {
            text = currentNode.attributes.attrs.text.text+" - ";
        } else if (currentNode.attributes.type == 'app.RectangularModel' || currentNode.attributes.type == 'bpmn.Gateway' || currentNode.attributes.type == 'bpmn.Event'
             || currentNode.attributes.type == 'bpmn.DataObject' || currentNode.attributes.type == 'bpmn.Conversation' || currentNode.attributes.type == 'bpmn.Message'
             || currentNode.attributes.type == 'bpmn.Group') {
            text = currentNode.attributes.attrs['.label'].text+" - ";
        } else if (currentNode.attributes.type == 'fsa.State' ) {
            text = 'Exception';
        }else if (currentNode.attributes.type == 'bpmn.Choreography' || currentNode.attributes.type == 'bpmn.Activity' || currentNode.attributes.type == 'bpmn.Annotation') {
            text = currentNode.attributes.attrs['.content'].html+" - ";
        }
    }catch(err){};
    return text;
}

function calculateComponentFrequency(){
    var map = {};
    $.each(scnerios, function (index, scnerio) {
        $.each(scnerio, function (index, component) {
            incrementValue(component.id);
        });
    });
    function get(k) {
        if(map[k]==undefined){
            map[k]=0;
        }
        return map[k];
    }
    function put(key,value) {
        map[key]= value;
    }
    function incrementValue(k){
        var value=get(k);
        value+=1;
        put(k,value);
    }
    return map;
}

function havingExceptionNode(scenarioObj){
    try {
        for (var j = 0; j < scenarioObj.length; j++) {
            if (scenarioObj[j].attributes.type != undefined && scenarioObj[j].attributes.type == 'fsa.State') {
                return true;
            }
        }
    }catch (error){
        console.log('Error while finding exception node'+error);
    }
    return false;
}


function setRiskExposure(scenariosJSON){
    scenariosJSON.sort((function(a,b){
            return b.risk_exposer2 - a.risk_exposer2;
        }
    ));
    var high = scenariosJSON.length / 3;
    var medium = high * 2;
    for(var i=0;i<scenariosJSON.length; i++){
        if (i < high) {
            scenariosJSON[i].risk_exposer1='High';
        } else if (i < medium) {
            scenariosJSON[i].risk_exposer1='Medium';
        } else {
            scenariosJSON[i].risk_exposer1='Low';
        }
    }
    scenariosJSON.sort((function(a,b){
            return a.scenarioIndex - b.scenarioIndex;
        }
    ));
}


function getScenarios(modelVersionId){
    //GET ALL SCENARIOS
    data = {fileAdd:"GAS",modelVersionId:modelVersionId};
    sendAJAX(data,app_server_url,function(data){
        if(data["code"] == '200'){
            scenariosDataDB=data.data;         
            $('#btn-publish-version').removeClass('icon-btn-disable');
            $('#btn-png-scenario1').addClass('icon-btn-disable');             
            applyColorforFlow();
            if(scnerios.length >0 && scenariosDataDB.length>0){
                $('#filterScenarioDiv').show();
            }
        }else{
            $('#filterScenarioDiv').hide();
            dailogmsg(data["msg"]);

        }
    });
}

function refreshScenariosData(modelVersionId){
    //Refresh Scenarios data
    data = {fileAdd:"GAS",modelVersionId:modelVersionId};
    sendAJAX(data,app_server_url,function(data){
        if(data["code"] == '200'){
            scenariosDataDB=data.data;
        }else{
            dailogmsg(data["msg"]);
        }
    });
}

function loadModelScenarios(modelVersionId){
    //Load Model SCENARIOS
    data = {fileAdd:"GAS",modelVersionId:modelVersionId};
    sendAJAX(data,app_server_url,function(data){
        if(data["code"] == '200'){
            scenariosDataDB = data.data;
            applyColorforFlow();
        }else{
            dailogmsg(data["msg"]);
        }
    });
}

function renderNodeTraciability(cellModelObj){
    openBottomToolbar();
    $("a[data-prop='node_trace']").click();
    $('#nodeTraceTable tbody').html('');
    if(scnerios.length>0){
        var dataSet = new Array();
        var count=1;
        $.each(scnerios, function (index, scnerio) {
            if($.inArray(cellModelObj,scnerio) > -1){
                $('#nodeTraceTable tbody').append('<tr><td>'+count+'</td><td>Scenario'+(index+1)+'</td><td>'+scenariosDataDB[index].name+'</td><td>'+
                    scenariosDataDB[index].criticality+'</td><td>'+scenariosDataDB[index].risk+'</td></tr>');
                count++;
            }
        });
    }
}

function renderRequirements(sceIndex){
    $('#reqTable tbody').html('');
    var requirements=scenariosDataDB[sceIndex].requirements;
    if(requirements.length>0) {
        $.each(requirements, function (index, requirement) {
            $('#reqTable tbody').append('<tr><td>' + requirement.name + '</td><td>Scenario' + (sceIndex+1) + '</td><td>' + scenariosDataDB[sceIndex].name +'</td></tr>');
        });
    }
}


$("#saveScenarioDetails").click(function(){

    var scenarioId = $("#sceDet_id").val();
    var name = $("#sceDet_name").val();
    var criticality = $("#sceDet_criticality :selected").val();
    var defects = $("#sceDet_defects").val();
    var severity = $("#sceDet_severity").val();
    var risk_exposer1 = $("#sceDet_riskEx1").val();
    var risk_exposer2 = $("#sceDet_riskEx2").val();
    var testing_effort = $("#sceDet_testEff").val();
    var primaryFlow = 0;
    var preCondition = "";//$("#sceDet_preCnd").val();
    var postCondition = "";//$("#sceDet_postCnd").val();
    if ($('#sceDet_primFlow').is(':checked')){
        primaryFlow=1;
    }
    var modelVersionId = (currentSelectedNode.id).split("_")[1];
   // if(!validation('empty',name))validationError('sceDet_name',"**Scenario name Can't be empty");
    //else if(!validation('empty',criticality))validationError('sceDet_criticality',"**Scenario criticality Can't be empty");
   // else if(!validation('empty',defects))validationError('sceDet_defects',"**Scenario defects Can't be empty");
   // else if(!validation('empty',severity))validationError('sceDet_severity',"**Scenario severity Can't be empty");
    // else if(!validation('empty',risk_exposer1))validationError('sceDet_riskEx1',"**Scenario risk 1 Can't be empty"); -->
   // else if(!validation('empty',risk_exposer2))validationError('sceDet_riskEx1',"**Scenario risk 2 Can't be empty"); -->
  //  else if(!validation('empty',testing_effort))validationError('sceDet_testEff',"**Scenario testing effort Can't be empty");
  //  else{

        var data = {fileAdd:"USD",scenarioId:scenarioId,name:name,criticality:criticality,defects:defects,severity:severity,risk_exposer1:risk_exposer1,risk_exposer2:risk_exposer2,testing_effort:testing_effort,primaryFlow:primaryFlow,modelVersionId:modelVersionId,preCond:preCondition,postCond:postCondition};
        sendAJAX(data,app_server_url,function(data){
            if(data["code"] == '200'){
                dailogmsg(labelObj.savedMsg);
                getScenarios(modelVersionId);
            }else{
                dailogmsg(data["msg"]);
            }
        });

  //  }
});

var dataSet1 = [
    [ "Tiger Nixon", "System Architect"],
    [ "Garrett Winters", "Accountant"]
];
var scenarioDatatable=null;
function callDataTable(tableId,dataSet,columns) {
    if (!$.fn.DataTable.isDataTable('#' + tableId)) {
        scenarioDatatable = $('#' + tableId).DataTable({
            data: dataSet,
            columns: columns,
            columnDefs: [
                {orderable: false,targets: [0,1]},
                {width: "10%",targets: [0,1,2,3,5,6,7,8]},
                {width: "20%",targets: 4}
            ],
            "paging": false,
            "info": false,
            "searching": false
        });
        scenarioDatatable.column(5).visible(false);
        scenarioDatatable.column(6).visible(false);
        scenarioDatatable.column(7).visible(false);
        scenarioDatatable.column(8).visible(false);
        scenarioDatatable.column(9).visible(false);
    }else{
        updateDataTableData(tableId,dataSet);
    }
    if(scenarioDatatable!=null) {
        if (isTestSuite) {
            scenarioDatatable.column(0).visible(true);
            $('#scenariosTable').on('change', '[id^=sceIdCheck_]', function(evt){
                evt.stopImmediatePropagation();
                $('#bodyoverlay').addClass('overlay');
                var thisObject=$(this);
                fromPath='Scenario Table';
                window.setTimeout( function(){applyTestSuiteScenario(thisObject)} ,1);
            }).DataTable();
        } else {
            scenarioDatatable.column(0).visible(false);
        }
        $("#scenariosTable").on("click","tr",function(evt){
            fromPath='Scenario Table';
            evt.stopImmediatePropagation();
            var thisObject=$(this);
            bindChangeEventToScenarios(thisObject);
        }).DataTable();
    }
}

function updateDataTableData(tableId,dataSet){
    try {
        var table= $('#'+tableId).DataTable();
        table.clear();
        table.rows.add(dataSet);
        table.draw();
    }catch(err){alert(err)};

}
function displaycase(scenariosDB){
    var nodeid='';
    var testdescription = new Array();
    var testdd='';
    var testDD='';
    var manultestsuitenodeid='';

    testCondVersion_id = (currentSelectedNode.id).split("_")[2];
    componentversionId=testCondVersion_id;
    seletectedscenariosId=[];
    var nodeDescription;

    for(var k=0;k<scenariosDB.length;k++)
    {
        var testcurrentflow=scnerios[scenariosDB[k].scenario_index-1];
        seletectedscenariosId.push(scenariosDB[k].scenario_index);
        var i=0 ;
        for(i=0;i<testcurrentflow.length; i++) {
           selectednodeId.push(testcurrentflow[i].id);
        }
    }
    if(seletectedscenariosId!='')
    {
        var data = {fileAdd:"SMD",versionId:componentversionId,indexId:seletectedscenariosId};
        sendAJAX(data, app_server_url,function (data)
        {
            var node_componentmap=JSON.parse(JSON.stringify(data.data));
            var node_key='';
            var daigram_node='';
            var object_key='';
            var scenario_name='';
            var scenario_index='';
            var node_id='';
            var description='';
            var componentName='';
            var scenarioN='';
            var nodeIdMap={};
            var isAnyNodeError=false;
            if(currentblogdaigram!=null){
                var totalCount=currentblogdaigram.cells.length;
                for(var indexCount=0;indexCount<totalCount;indexCount++){
                    var nodeId=currentblogdaigram.cells[indexCount].id;
                    nodeIdMap[nodeId]= indexCount;
                }
            }
            for(var i=0;i<scenariosDB.length;i++)
            {
                var scenario_path = scenariosDB[i].path;
                var path_split= scenario_path.split(",");
                 scenario_index = scenariosDB[i].scenario_index;
                 scenario_name =  scenariosDB[i].name;
                 scenarioN+="<tr><td>Scenario"+scenario_index+"</td><td>"+scenario_name+"</td><td></td><td></td><td></td></tr>";
                 for(var k=0;k<path_split.length;k++)
                 {
                    node_id=path_split[k];
                    if(node_id!=null && node_id!=''){
                        var nodeIndex=nodeIdMap[node_id];
                        if(nodeIndex==undefined){
                            isAnyNodeError=true;
                            break;
                        }
                        var daigram_node=currentblogdaigram.cells[nodeIndex]
                        var count=1;
                        if (node_componentmap[node_id] != undefined)
                        {
                            if(daigram_node.type == 'app.Link') {
                                if((daigram_node).hasOwnProperty("labels")) {
                                    if(daigram_node.labels.length>0){
                                    componentName = daigram_node.labels[0].attrs.text.text;
                                    }else if (daigram_node.source.hasOwnProperty("port")){
                                    componentName = daigram_node.source.port;
                                    }
                                    scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";                                                 
                                }
                            }else if(daigram_node.type =='app.RectangularModel' || daigram_node.type == 'bpmn.Gateway' || daigram_node.type == 'bpmn.Event'
                            || daigram_node.type == 'bpmn.DataObject' || daigram_node.type == 'bpmn.Conversation' || daigram_node.type == 'bpmn.Message'
                            || daigram_node.type == 'bpmn.Group'){
                                componentName=daigram_node.attrs['.label'].text;
                                scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";
                            }else if(daigram_node.type =='fsa.State'){
                                scenarioN += "<tr><td></td><td></td><td>" + "Exception" + "</td><td></td><td></td></tr>";
                            }else if(daigram_node.type=='bpmn.Choreography' || daigram_node.type=='bpmn.Activity' || daigram_node.type == 'bpmn.Annotation'){
                                componentName=daigram_node.attrs['.content'].html;
                                scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";
                            }else{
                                componentName = daigram_node.attrs.text.text;
                                scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";
                            }
                            description = node_componentmap[node_id];
                            for(var ll=0;ll<description.length;ll++){
                               if(description[ll]!=''){ 
                                scenarioN += "<tr><td></td><td></td><td></td><td>Step:" + count++ + "</td><td>" + description[ll] + "</td></tr>";
                               }
                            }
                        }else{
                            if(daigram_node.type == 'app.Link') {
                                if((daigram_node).hasOwnProperty("labels")) {
                                    if(daigram_node.labels.length>0){
                                        componentName = daigram_node.labels[0].attrs.text.text;
                                    }else if (daigram_node.source.hasOwnProperty("port")){
                                        componentName =daigram_node.source.port;
                                    }
                                   if(componentName!=null && componentName!=""){ 
                                      scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";                                                 
                                    }
                                }
                            }else if(daigram_node.type =='app.RectangularModel' || daigram_node.type == 'bpmn.Gateway' || daigram_node.type == 'bpmn.Event'
                                || daigram_node.type == 'bpmn.DataObject' || daigram_node.type == 'bpmn.Conversation' || daigram_node.type == 'bpmn.Message'
                                || daigram_node.type == 'bpmn.Group'){
                                componentName=daigram_node.attrs['.label'].text;
                                scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";
                            }else if(daigram_node.type =='fsa.State'){
                                    scenarioN += "<tr><td></td><td></td><td>" + "Exception" + "</td><td></td><td></td></tr>";
                            }else if(daigram_node.type=='bpmn.Choreography' || daigram_node.type=='bpmn.Activity' || daigram_node.type == 'bpmn.Annotation'){
                                componentName=daigram_node.attrs['.content'].html;
                                scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";
                            }else{
                                componentName = daigram_node.attrs.text.text;
                                scenarioN += "<tr><td></td><td></td><td>" + componentName + "</td><td></td><td></td></tr>";
                            }
                        }
                     }
                     
                     $("#PreviewTable tbody").append(scenarioN);
                     scenarioN='';
                 }



            }
            
            if(isAnyNodeError){
                dailogmsg('scenarios are not inline with the daigram, please re-generate the scenarios in model and try again');
            }
 
        });
    }
    else{
        $("#PreviewTable tbody").append("<tr><td></td><td></td><td style='font-size:20px'>Please select a Scenario<td></td><td></td></tr>");
    }
}
function setpathCoverageSelectedFlag(v1){
    pathCoverageSelectedFlag=v1;
}
function displayPath(scenariosDB){
    $("#PathCoveraTable tbody").html('');
    var testingEffort=0;
    var scenariosDataDBLength=scenariosDataDB.length;
    var selectedScenariosLength=scenariosDB.length;
    var selNodesArr= new Array();
    for (var sel = 0; sel < selectedNodes.length; sel++)
    {
        if(scenariosDataDB[selectedNodes[sel]-1]!=undefined){ 
            var scenarioNodes=scenariosDataDB[selectedNodes[sel]-1].path.split(',');                
            for(var index=0;index<scenarioNodes.length-1;index++)
            {                    
                if(!selNodesArr.includes(scenarioNodes[index]))
                {
                    selNodesArr.push(scenarioNodes[index]);
                }     
            }
        } 
    }
    for (var i = 0; i < selectedScenariosLength; i++) {       
        testingEffort+=Number(scenariosDB[i].testing_effort);
    }
    var scenarioTable='';
   if (selectedScenariosLength != 0) {  
    var nodeCoverage=(selNodesArr.length/totalnumberofnodes)*100 ;
    var scenariosCoverage=(selectedScenariosLength/scenariosDataDBLength)*100 ;
    var nodeCoverages=nodeCoverage.toFixed(2);
    scenariosCoverage=scenariosCoverage.toFixed(2);
  
    scenarioTable+="<tr><td>"+labelObj.pathCoverNoOfScenSel+":<b>  "+selectedScenariosLength+"/"+scenariosDataDBLength+" </b></td></tr>";
    scenarioTable+="<tr><td>"+labelObj.pathCoverScensPerc+":<b>  "+scenariosCoverage+" </b></td></tr>";
    scenarioTable+="<tr><td>"+labelObj.pathCoverNodePerc+":<b>  "+nodeCoverages+" </b></td></tr>";
    scenarioTable+="<tr><td>"+labelObj.pathCoverTestEff+":<b> "+testingEffort+" </b></td></tr>";
    $("#PathCoveraTable tbody").append(scenarioTable);
    $("#bar-chart-horizontal").show();
    new Chart(document.getElementById("bar-chart-horizontal"), {
        type: 'horizontalBar',
        data: {
            labels: [""+labelObj.pathCoverScensPerc, ""+labelObj.pathCoverNodePerc],
            datasets: [
                {
                    label: "Current Status",
                    backgroundColor: ["#3e95cd", "#3cba9f"],
                    data: [scenariosCoverage,nodeCoverage]
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: labelObj.pathCoverBar
            },scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        steps: 10,
                        stepValue: 6,
                        max: 100
                    }

                }]
            }
        }
    });
    if(selectedSecIndex>=0) {
        var pathCoverSceDetails='';
        var primaryFlow=scenariosDataDB[selectedSecIndex].primary_flow;
        primaryFlow=('1'==primaryFlow)? 'Yes':'No';
        pathCoverSceDetails+="<thead> <tr><th>"+labelObj.pathCoverSceDetails+"</th></tr></thead>";

        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverSceName+":<b>  Scenario"+scenariosDataDB[selectedSecIndex].scenario_index+"</b></td></tr>";
        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverSceSeverity+":<b>  "+scenariosDataDB[selectedSecIndex].severity+"</b></td></tr>";

        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverSceCriticality+":<b>  "+scenariosDataDB[selectedSecIndex].criticality+"</b></td></tr>";
        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverSceDefects+":<b>  "+scenariosDataDB[selectedSecIndex].defects+"</b></td></tr>";

        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverSceRe+":<b>   "+scenariosDataDB[selectedSecIndex].risk_exposer+"</b></td></tr>";
        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverSceEffort+":<b>  "+scenariosDataDB[selectedSecIndex].testing_effort+"</b></td></tr>";

        pathCoverSceDetails+="<tr><td>"+labelObj.pathCoverScePrimary+":  <b> "+primaryFlow+"</b></td></tr>";
        $("#pathCoverageSceDetailsTable").html(pathCoverSceDetails);
    }
 }else{
    $("#bar-chart-horizontal").hide();
   $("#pathCoverageSceDetailsTable").html("");
   $("#PathCoveraTable tbody").append("<table><tr><td><h5>Please selet a Scenario</h5></th></tr></table>");
} 

}

$("#exportexcel").click(function(e) {
    var data = {fileAdd:"EXS",versionId:componentversionId,nodeIds:selectednodeId,indexId:seletectedscenariosId};
      sendAJAX(data, app_server_url,function (data) {
         var compbytearr = data.data.data;
          var compbyteArray = new Uint8Array(compbytearr);
          var a = window.document.createElement('a');
          a.href = window.URL.createObjectURL(new Blob([compbyteArray], { type: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
          a.download = 'Components_new.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      });


    var data = {fileAdd: "TXS", n: componentversionId,indexId:seletectedscenariosId};
    sendAJAX(data, app_server_url, function (data) {
        var testsuitebytearr = data.data.data;
        var testsuitebyteArray = new Uint8Array(testsuitebytearr);
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([testsuitebyteArray], {type: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
        a.download = 'Testsuite.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    });

   var data = {fileAdd: "TDD", n: componentversionId,indexId:seletectedscenariosId};
    sendAJAX(data, app_server_url, function (data) {
        var testsuitebytearr = data.data.data;
        var testsuitebyteArray = new Uint8Array(testsuitebytearr);
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([testsuitebyteArray], {type: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
        a.download = 'ComponentDD.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        componentnodeId=[];

    });

});

$("#manualexportexcel").click(function(e) {
    checkTemplatedataExist(); 
});
$("#toggleColumns").click(function (e) {
    e.stopPropagation();
    $("#toggleColumnsDiv").toggle();
});
$("#toggleColumnsDiv").click(function(e){
    e.stopPropagation();
});
$(document).click(function () {
    var $el = $("#toggleColumnsDiv");
    if ($el.is(":visible")) {
        $el.hide();
    }
});    

$('#criticalityCheck').change(function() {
    var table= $('#scenariosTable').DataTable();
    if($(this).is(":checked")) {
        table.column(5).visible(true);
    }else{
        table.column(5).visible(false);
    }
});

$('#severityCheck').change(function() {
    var table= $('#scenariosTable').DataTable();
    if($(this).is(":checked")) {
        table.column(6).visible(true);
    }else{
        table.column(6).visible(false);
    }
});

$('#riskCheck').change(function() {
    var table= $('#scenariosTable').DataTable();
    if($(this).is(":checked")) {
        table.column(7).visible(true);
    }else{
        table.column(7).visible(false);
    }
});

$('#defectsCheck').change(function() {
    var table= $('#scenariosTable').DataTable();
    if($(this).is(":checked")) {
        table.column(8).visible(true);
    }else{
        table.column(8).visible(false);
    }
});

$('#frequencyCheck').change(function() {
    var table= $('#scenariosTable').DataTable();
    if($(this).is(":checked")) {
        table.column(9).visible(true);
    }else{
        table.column(9).visible(false);
    }
});

function applyTestSuiteScenario(obj){
    var selScenariosDB= new Array();
    selectedNodes=[];
    var isAllSelected=false;
    $("#PreviewTable tbody").html('');
    var sceTypeValue=$("#sceDet_Type").val();
    if(obj.is(":checked")) {
        if(obj[0].id=='sceIdCheck_All'){
            $("[id^=sceIdCheck_]").prop('checked', true);
            isAllSelected=true;
        }
    }else{
        if(obj[0].id=='sceIdCheck_All'){
            isAllSelected=false;
            $("[id^=sceIdCheck_]").prop('checked', false);
            var allNodes = app.graph.getElements();
            $.each(allNodes,function(index, cell) {
                clearColorToCell(cell);
            });
        }else{
            $("[id^=sceIdCheck_All]").prop('checked', false);
            var sceindex=obj.val();
            clearSelectedScenario(scnerios[sceindex-1]);
        }
    }
    $('[name=sceIdCheck]:checked').each(function() {
        var index=$(this).val();
        selectedNodes.push(index);
        if(index!='All') {
            selScenariosDB.push(scenariosDataDB[index - 1]);
            //applyColorToSelectedScenario(scnerios[index - 1]);
        }
    });    

    displaycase(selScenariosDB);
    displayPath(selScenariosDB);   
           
    if(isAllSelected && sceTypeValue==0){
        var allNodes = app.graph.getElements();
        $.each(allNodes,function(index, cell) {            
            applyColorToCell(cell);
        });
    }else{    
        for(var k=0;k<selScenariosDB.length;k++)
        {
            applyColorToSelectedScenario(scnerios[selScenariosDB[k].scenario_index-1]);
        }
    }

    
    if (selScenariosDB.length == 0) {
        $("#manualexportexcel").addClass('icon-btn-disable');
        $("#exporttestcasetohpqc").addClass('icon-btn-disable');
        $("#exporttestcasetojira").addClass('icon-btn-disable');
        $("#exportexcel").addClass('icon-btn-disable');
        $("#exporttestcasetoopentest").addClass('icon-btn-disable');        
    } else {
        $("#exporttestcasetohpqc").removeClass('icon-btn-disable');
        $("#exporttestcasetojira").removeClass('icon-btn-disable');
        $("#manualexportexcel").removeClass('icon-btn-disable');
        $("#exportexcel").removeClass('icon-btn-disable');
        $("#exporttestcasetoopentest").removeClass('icon-btn-disable');        
    }
    
    
    scenariotestsuiteDB.length=0;
    componentarr.length=0;
    scenariotestsuiteDB.length=0;

    $('#bodyoverlay').removeClass('overlay');


}
var hpalmurl;
var username;
var password;
var domain;
var project;
var lwscookie;
$("#HpQCLogin").click(function(e){
  hpalmurl=$("#cURL").val();
  username=$("#uName").val();
  password=$("#hppass").val();
  domain=$("#hpdomain").val();
  project=$("#hpproject").val();

 $("#createQCLoginModal").css("display","none");
 //checkForAutentication(hpalmurl,username,password,domain,project);   
 window.setTimeout(function(){  checkForAutentication(hpalmurl,username,password,domain,project)} ,100);
});

function  checkForAutentication(hpalmurl,username,password,domain,project){
   
    var data = {fileAdd:"VQC",hpurl:hpalmurl,usrname:username,pass:password};
    sendAJAX(data, app_server_url, function (data) {
          lwscookie=data.data;
        if(lwscookie.indexOf("LWSSO_COOKIE_KEY")!=-1){
            dailoghpalmconform("Successfully connected to HP-ALM, now system will proceed with export of Test Cases.");
              //$('#bodyoverlay').addClass('overlay');
                 // createFolderAndValidation(lwscookie,componentversionId,seletectedscenariosId,hpalmurl,domain,project,username);
               //window.setTimeout(function(){ createFolderAndValidation(lwscookie,componentversionId,seletectedscenariosId,hpalmurl,domain,project,username)} ,100);
                }
                else
                {
                    dailogmsg("Hp ALM Autentication Failed");
                }
     });
}


function dailoghpalmconform(msg){

    $('<div id="createhpalmmodal"  style="display: block;"  align="center">'+
    '<div id="header-modal" align="left">'+
        '<span>Confirm Message</span>'+
    '</div>'+
        '<div id="body-modal">'+
                '<table>'+
                    ' <tr><td>'+msg+'</td></tr>'+
            '</table>'    +   

        '</div>'+
            '<table>'+
            '<tr>'+
                '<td><div id="footer-modal"><input id="modal-yes-hpalm" type="button" value="'+labelObj.buttonYes+'"></div></td>'+
                '<td><div id="footer-modal"><input id="modal-no-hpalm" type="button" value="'+labelObj.buttonNo+'"></div></td>'+
            '</tr>'+
                
        '</table>'+
    '</div>'+                 
'</div>').appendTo('#popupdata');

$('#modal-bg').addClass('bgopacity');   
}

$(document).on('click','#modal-yes-hpalm',createFolderAndValidation);

function createFolderAndValidation(){
     var divToRemove=$(document).find("#createhpalmmodal");
     divToRemove.html('');
     divToRemove.remove();
    var data = {fileAdd:"HFC",hplwsCookie:lwscookie,versionId:componentversionId,scenarioIds:seletectedscenariosId,hpaurl:hpalmurl,domain:domain,project:project,username:username};
    sendAJAX(data, app_server_url, function (data) {
        var sucess_code=data.code;
            var msg=data.msg;
        if(sucess_code=="200")
        {
            dailogmsg(msg);
            
       }
       else
       {
            dailogmsg("Exporting to HP-ALM failed. Reason for failure:"+sucess_code);
        }

    });
    
}

$(document).on('click','#modal-no-hpalm',function(){
var divToRemove=$(document).find("#createhpalmmodal");
divToRemove.html('');
divToRemove.remove();
$('#modal-bg').removeClass('bgopacity');
});

function displayDescription(scenarioDB)
{
    var nodidcomponentMap={};
    var diagram=currentblogdaigram;
    var scenario_path=scenarioDB.path;
    var versionId=scenarioDB.model_version_id;
    var index = scenarioDB.scenario_index;
    for(k=0;k<diagram.cells.length;k++){
        if(diagram.cells[k].type!='app.Link')
        {
            var  att= diagram.cells[k].attrs; 
            if(diagram.cells[k].type=='app.RectangularModel' || diagram.cells[k].type == 'bpmn.Gateway' || diagram.cells[k].type == 'bpmn.Event'
            || diagram.cells[k].type == 'bpmn.DataObject' || diagram.cells[k].type == 'bpmn.Conversation' || diagram.cells[k].type == 'bpmn.Message'
            || diagram.cells[k].type == 'bpmn.Group'){
                nodidcomponentMap[diagram.cells[k].id]=att['.label'].text;
            }else if(diagram.cells[k].type=='fsa.State'){
                nodidcomponentMap[diagram.cells[k].id]='Exception';
            }else if(diagram.cells[k].type=='bpmn.Choreography' || diagram.cells[k].type=='bpmn.Activity' || diagram.cells[k].type == 'bpmn.Annotation'){
                nodidcomponentMap[diagram.cells[k].id]=att['.content'].html;
            }else{
                nodidcomponentMap[diagram.cells[k].id]=att.text.text;
            }
        }else{
            if((diagram.cells[k]).hasOwnProperty("labels"))
            {
                if(diagram.cells[k].labels[0]!=undefined)
                 nodidcomponentMap[diagram.cells[k].id]=diagram.cells[k].labels[0].attrs.text.text;
            }
        }
    }
    var data = {fileAdd:"SDM",versionId:versionId};
    sendAJAX(data, app_server_url, function (data) {
    var node_desc_map=JSON.parse(JSON.stringify(data.data));
    var descriptionN='';
    descriptionN+="<tr><td>Scenario"+index+"</td><td></td><td></td><td></td><td></td></tr>";
    var pathsplit =scenario_path.split(",");
    var count=1; 
    var expecteddata;
   for(var i=0;i<pathsplit.length;i++)
   {
          
        var node_id=pathsplit[i];
        if(nodidcomponentMap[node_id]!=undefined && nodidcomponentMap[node_id]!='')
        {  
            descriptionN+="<tr><td></td><td>Step"+ count++ +"</td><td>"+nodidcomponentMap[node_id]+"</td><td></td><td></td></tr>"
        
            var description=node_desc_map[node_id];
            if(description!=undefined)
            {
                var desc=description;
                for(var k=0;k<desc.length;k++)
                {
                    if(desc[k]!=undefined && desc[k]!=""){
                     var finaldesc =desc[k];
                  
                    if(finaldesc.includes("Verify")){
                        if(finaldesc.includes(" is ")) {
                            expecteddata =finaldesc.replace(" is ", " should be ");
                        }else{
                            expecteddata= finaldesc;
                        }
                    }else{
                        expecteddata= "User should able to " +finaldesc;
                    }
                    descriptionN+="<tr><td></td><td></td><td></td><td>"+desc[k]+"</td><td>"+expecteddata+"</td></tr>"
                }
               }
            }              
        }
        $("#descTable tbody").append(descriptionN);
        descriptionN='';
   }
  
   
    });
   
}
function disableSceAndTestCondTextBoxes() {
    $("#sceDet_name").attr("disabled", "disabled");
    $("#sceDet_testEff").attr("disabled", "disabled");
    $("#sceDet_defects").attr("disabled", "disabled");
    $("#sceDet_criticality").attr("disabled", "disabled");
    $("#sceDet_severity").attr("disabled", "disabled");
    $("#tes-cond-chk-all").attr("disabled", "disabled");
    $("#tes-cond-chk-box").attr("disabled", "disabled");
    $("#tes_cond_action").attr("disabled", "disabled");
    $("#tes_cond_targettype").attr("disabled", "disabled");
    $("#saveScenarioDetails").addClass('icon-btn-disable');
    $("#import_excel").addClass('icon-btn-disable');
    $("#save_test_cond").addClass('icon-btn-disable');
    $("#add_row").addClass('icon-btn-disable');
    $("#delete_row").addClass('icon-btn-disable');
    $("#import_excel_data").addClass('icon-btn-disable');
    $("#save_test_data").addClass('icon-btn-disable');
    $("#add_row_data").addClass('icon-btn-disable');
    $("#delete_row_data").addClass('icon-btn-disable');
}
function enableSceAndTestCondTextBoxes() {
    $("#sceDet_name").removeAttr("disabled");
    $("#sceDet_testEff").removeAttr("disabled");
    $("#sceDet_defects").removeAttr("disabled");
    $("#sceDet_criticality").removeAttr("disabled");
    $("#sceDet_severity").removeAttr("disabled");
    $("#tes-cond-chk-all").removeAttr("disabled");
    $("#tes-cond-chk-box").removeAttr("disabled");
    $("#tes_cond_action").removeAttr("disabled");
    $("#tes_cond_targettype").removeAttr("disabled");
    $("#saveScenarioDetails").removeClass('icon-btn-disable');
    $("#import_excel").removeClass('icon-btn-disable');
    $("#save_test_cond").removeClass('icon-btn-disable');
    $("#add_row").removeClass('icon-btn-disable');
    $("#delete_row").removeClass('icon-btn-disable');
    $("#import_excel_data").removeClass('icon-btn-disable');
    $("#save_test_data").removeClass('icon-btn-disable');
    $("#add_row_data").removeClass('icon-btn-disable');
    $("#delete_row_data").removeClass('icon-btn-disable');
}

function isElementExists(array,val){
    var found = array.find(function(element) {
        return element == val;
      });
      if(found!=undefined) return true;
      return false;
}

function checkTemplatedataExist(){
  
    var modelverionId=(currentSelectedNode.id).split("_")[2];
    var isboolean;
    var data = { fileAdd: "TTE",modelVersionId:modelverionId};
    sendAJAX(data, app_server_url, function (data) {
       
        if((data.data==null)||(data.data.testcaseTemp==null && data.data.testcaseTemp==undefined)){
              dailogmsg("Test Case Template is not defined, Please contact admin");
               return false;
        }else{
            var data = {fileAdd: "MTD", versionid: componentversionId,selectedscenarioids:seletectedscenariosId};
            sendAJAX(data, app_server_url, function (data) {
               
                var testsuitebytearr = data.data.data;
                 var pro=data.proinfo.split(":");
                var testsuitebyteArray = new Uint8Array(testsuitebytearr);
                var a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([testsuitebyteArray], {type: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
                a.download = pro[0]+"_"+pro[1]+"_"+pro[2]+"_"+"Version"+ pro[3]+'.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }
    });
    
}

function displayNodeCount(graph){
    appGraph=graph;
    var totalNodes = appGraph.getElements();
    var startEndNodecount=0;
    for(var i=0;i<totalNodes.length;i++){
        var jsonType =appGraph.getElements()[i].attributes.type;
        if(jsonType=="fsa.StartState" || jsonType=="fsa.EndState"){
            startEndNodecount++;
        }
    }
    $("#modelNodes").text(totalNodes.length-startEndNodecount);
}

function getAllComments(versionId){
    var data = {fileAdd:"GAC",verId:versionId};
    var commentsData='';
    sendAJAX(data,app_server_url,function(data){
        var reponseData=data.data;
        var commentIds=reponseData.order;
        if(commentIds.length>0){
            var commentIdsCount=commentIds.length;
            $('#commentstabdis').html(commentIdsCount);
            var latestComment='';
            $.each(commentIds, function (index, commentId) {           
                var commentDataObj=reponseData.comments['_data'];
                var commentObj=(commentDataObj[''+commentId])[1];
                var commentData='<div class="posts" id="posts'+commentObj.id+'"> <div class="postContent">'+
                '<label class="commentheading">Comment '+commentIdsCount+':'+commentObj.userId+', '+commentObj.date+'</label>'+
                '<p>'+commentObj.text+'</p>'+
                '</div>';
                var replyCount=commentObj.replies.length;
                $.each(commentObj.replies, function (index, reply) {
                    commentData+='<div class="replies" id="reply'+reply.id+'"> <div class="postContent">'+
                    '<label class="commentheading">Reply '+replyCount+':'+reply.userId+', '+reply.date+'</label>'+
                    '<p>'+reply.text+'</p>'+
                    '</div></div>';
                    replyCount--;
                });
                if(isTestSuite){
                    commentData+='<textarea placeholder="Type your comment here" style="display:none" id="reply'+commentObj.id+'" disabled></textarea><input type="button" value="'+labelObj.buttonPost+'" style="display:none" class="global-btn post-btn icon-btn-disable"  id="reply-btn'+commentObj.id+'"></input></div>';
                }else{
                    if(commentObj.replies.length==0 && session.userDetails.id==commentObj.userId){
                        commentData+='<textarea placeholder="Type your comment here" style="display:none" id="reply'+commentObj.id+'" disabled></textarea><input type="button" value="'+labelObj.buttonPost+'" style="display:none" class="global-btn post-btn icon-btn-disable"  id="reply-btn'+commentObj.id+'"></input></div>';
                    }else{
                        commentData+='<textarea placeholder="Type your comment here" style="display:none" id="reply'+commentObj.id+'"></textarea><input type="button" value="'+labelObj.buttonPost+'" style="display:none" class="global-btn post-btn"  id="reply-btn'+commentObj.id+'"></input></div>';
                    }
                }
                if(index<2){
                    latestComment+='<div class="posts" id="latestpost'+index+'"> <div class="latestPost">'+
                    '<label class="commentheading">Comment '+commentIdsCount+':'+commentObj.userId+', '+commentObj.date+'</label>'+
                    '<p>'+commentObj.text+'</p>'+
                    '</div></div>';
                }     
                commentIdsCount--;
                commentsData+=commentData;
            });
            if(latestComment!=''){
                $('#addCommentId').hide();
                $('.latestComments').html(latestComment);
                $('.latestComments').show();
            }else{
                $('#addCommentId').show();
                $('.latestComments').html('');
                $('.latestComments').hide();
            }
            $('.moreCommentsDiv').html(commentsData);
            $('.tabcontenttwo').removeClass('overlay-modelmatrix');
            if($('.moreCommentsDiv').is(":visible")){
                $('#addCommentId').show();
                $('.latestComments').hide();
                $("#nav-Container").hide();
            }
        }else{
            $('.latestComments').html('');
            $('.moreCommentsDiv').html('');
            $('#commentstabdis').html(0);
            $('.closemet-btn').click();
        }
        if(isTestSuite){
            $("#post-btn").addClass('icon-btn-disable');
            $('#addCommentId').prop( "disabled", true);
        }else{
            $("#post-btn").removeClass('icon-btn-disable');
            $('#addCommentId').prop( "disabled", false);
        }
    });
}

$(document).on('click','.post-btn',function(){
    var modelVersionId = (currentSelectedNode.id).split("_")[1];    
    var postId=this.id;
    if(postId=='post-btn'){
        var commentTxt=$('#addCommentId').val();    
        createComment(modelVersionId,commentTxt);
    }else{
        postId=postId.replace("reply-btn","");
        var commentTxt=$('#reply'+postId).val();    
        createReplyComment(modelVersionId,postId,commentTxt);
    }   
});

$(document).on("click",'.postContent',function(){
    var postId=$(this).parent().attr('id');
    postId=postId.replace("posts","");
    if($('#reply'+postId).is(":visible")){
        $('#reply'+postId).hide();
        $('#reply-btn'+postId).hide();
    }else{
        $('#reply'+postId).show();
        $('#reply-btn'+postId).show();
    } 
});

function createComment(versionId,commentTxt){
    if(commentTxt!=null && commentTxt!=''){
        var postDate=getDateTime(new Date());        
        var data = {fileAdd:"CNC",commentTxt:commentTxt,verId:versionId,postedDt:postDate};
        $('.tabcontenttwo').addClass('overlay-modelmatrix');
        sendAJAX(data,app_server_url,function(data){
            $('#addCommentId').val('');
            // alert('created comment successfuly');
            getAllComments(versionId);
        });
    }else{
        dailogmsg('Please enter text for comment');        
    }
}

function createReplyComment(versionId,pcId,replyTxt){
    if(replyTxt!=null && replyTxt!=''){
        var postDate=getDateTime(new Date());
        var data = {fileAdd:"CNC",commentTxt:replyTxt,verId:versionId,pId:pcId,postedDt:postDate};
        $('.tabcontenttwo').addClass('overlay-modelmatrix');
        sendAJAX(data,app_server_url,function(data){
            $('#reply'+pcId).val('');
            //alert('created reply comment successfuly');
            getAllComments(versionId);
        });
    }else{
        dailogmsg('Please enter text for reply comment');       
    }
}

$("#addCommentId").click(function(){
   $("#post-btn").show();
   $(".more-btn").hide();
   $("#nav-Container").hide();
   $(".insideContainer").css({ "height":"400px","overflow-y":"scroll"});
   $('.closemet-btn').show();
   $(".moreCommentsDiv").show();
});

function getDateTime(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (month.toString().length == 1) {
        var month = '0' + month;
    }
    if (day.toString().length == 1) {
        var day = '0' + day;
    }
    if (hour.toString().length == 1) {
        var hour = '0' + hour;
    }
    if (minute.toString().length == 1) {
        var minute = '0' + minute;
    }
    if (second.toString().length == 1) {
        var second = '0' + second;
    }
    var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    return dateTime;
}

function getSanityScenarios(scenarioData) {
    try{
    var daigramNodeIdsList = [];
    var destNodeList = [];
    var sanity_index_Arr = [];
    var sanityPrimaryMapIndex = {};
    var scenariopathIndexMap={}; 
   
     var scenarioDataStr  = JSON.stringify(scenarioData);    
     var scenarioCloneData = JSON.parse(scenarioDataStr);
     for(var i=0;i<scenarioData.length;i++){
        var scenarioObj = scenarioData[i];
        var lastNode = scenarioObj[scenarioObj.length-1];
        if(lastNode.attributes.type!="fsa.State"){
            var scenariopath='';        
            for(var k=0;k<scenarioObj.length;k++){
                scenariopath+=scenarioObj[k].id+',';
                if (daigramNodeIdsList.indexOf(scenarioObj[k].id) == -1) {
                    daigramNodeIdsList.push(scenarioObj[k].id);
                }
            }
            sanityPrimaryMapIndex[scenariopath]= i;  
        }
     }

     
     var thresholdCount = parseInt(daigramNodeIdsList.length * 0.7);
    console.log(thresholdCount);
   
     scenarioCloneData.sort(function (a, b) {
        return b.length - a.length;
    });

    for(var sceIndex=0;sceIndex<scenarioCloneData.length;sceIndex++){
        var scenarioObj = scenarioCloneData[sceIndex];
        var lastNode = scenarioObj[scenarioObj.length-1];
        if(lastNode.type!="fsa.State"){
            var scenariopath='';
            for(var i=0;i<scenarioObj.length;i++){
                scenariopath+=scenarioObj[i].id+',';
                if (destNodeList.indexOf(scenarioObj[i].id) == -1) {
                    destNodeList.push(scenarioObj[i].id);
                }
            }
            if(sanityPrimaryMapIndex[scenariopath]!=undefined){
                sanity_index_Arr.push(sanityPrimaryMapIndex[scenariopath]);
            }
            if (destNodeList.length >= thresholdCount){            
                break;
            }
        }
    }
    
    return sanity_index_Arr;
    }catch(err){
        console.log('Error while determining sanity scenarios'+err);
        return [];
    }

   

}

$("#exporttestcasetojira").on("click",function(){

    var tooltype="jira";
    var data = { fileAdd: "VM",versionId:componentversionId};
    sendAJAX(data, app_server_url, function (data) {
        var project_id=data.data[0].project_id;
        var data = { fileAdd: "GJC",project_id:project_id,tooltype:tooltype};
        sendAJAX(data, app_server_url, function (data) {
            if(data.data[0]!=undefined && data.data[0].config_dtl != undefined){
                var configdetails=data.data[0].config_dtl;
                 if(configdetails.type=="cloud"){
                           var data = { fileAdd: "EDJ",versionId:componentversionId,selectedScenarioIndex:seletectedscenariosId,tooltype:tooltype};
                            sendAJAX(data, app_server_url, function (data) {
                                dailogmsg(data.data);
                            });
                  }else{
                            var data = { fileAdd: "EPJ",versionId:componentversionId,selectedScenarioIndex:seletectedscenariosId,tooltype:tooltype};
                            sendAJAX(data, app_server_url, function (data) {
                                dailogmsg(data.data);
                            });
                  }  
            }else{
                 dailogmsg("JIRA configuration settings are not done.please check with Admin");   
            }
        
        });    

    }); 
});  

$("#exporttestcasetoopentest").on("click",function(){    
    generateOTYAML();
});  
    




