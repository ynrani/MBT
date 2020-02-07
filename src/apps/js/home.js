// Variable to store your file content
var fileContents;
var fileType = '';
var fileName = '';
var locale_global = 'en';
labelObj = {
    reqText: 'Requirement',
    modelText: 'Model',
    verText: 'Version',
    tsText: 'Test Suite',
    reportTxt: 'Report',
    criticality: 'Criticality',
    severity: 'Severity',
    riskIndex: 'Risk Index',
    defects: 'Defects',
    frequency: 'Frequency',
    si: 'SI',
    id: 'Id',
    name: 'Name',
    noDataText: 'No data available in table',
    reqna: 'Requirements not available',
    otTableAction: 'Action',
    otTableArgs: 'Arguments',
    otTableDesc: 'Description',
    pathCoverScensPerc: 'Scenarios Coverage %',
    pathCoverNodePerc: 'Node Coverage %',
    pathCoverNoOfScenSel: 'No of Scenarios selected',
    pathCoverTestEff: 'Testing Effort',
    pathCoverSceDetails: 'Scenarios Details',
    pathCoverSceName: 'Name',
    pathCoverSceSeverity: 'Severity',
    pathCoverSceCriticality: 'Criticality',
    pathCoverSceDefects: 'Defects',
    pathCoverSceRe: 'Risk Exposer',
    pathCoverSceEffort: 'Effort',
    pathCoverScePrimary: 'PrimaryFlow',
    pathCoverBar: 'Coverage Bar',
    logoutdialogText: 'Are you sure want to logout from application?',
    dialogHeader: 'Message',
    dialogHeaderConfirm: 'Confirm Message',
    dialogHeaderReqMap: 'Requirement Mapping',
    dialogHeaderprojMet: 'Project Metrics',
    dialogHeaderLogout: 'Logout',
    buttonOk: 'Ok',
    buttonYes: 'Yes',
    buttonNo: 'No',
    buttonCancel: 'Cancel',
    buttonBlank: 'Blank Page',
    buttonImport: 'Import',
    buttonSave: 'Save',
    buttonConnect: 'Connect',
    buttonClose: 'Close',
    buttonPost: 'Post',
    buttonAddArgs: 'Add Arguments',
    buttonAddKeyword: 'Add Keyword',
    otKeywordName: 'Keyword Name',
    otKeywordAction: 'Keyword Action',
    otKeywordDesc: 'Keyword Description',
    otArgs: 'Arguments',
    otTypeOfVals: 'Type of value',
    otListOfVals: 'List of Values',
    otActions: 'Actions',
    otAction: 'Action',
    otType: 'Type',
    ulClient: 'Client',
    ulProjects: 'Projects',
    ulUserId: 'UserId',
    ulFN: 'Full Name',
    ulEmail: 'Email',
    ulStartDt: 'Access Start Date',
    ulEndDt: 'Access End Date',
    ulRole: 'Role',
    ulStatus: 'Status',
    ulAction: 'Action',
    pmProjName:'Project Name',
    pmActName:'Account Name',
    pmTcCount:'TC Count',
    pmModuleName:'Module Name',
    pmDiagName:'Diagram Name',
    pmTotTC:'Total Tc',
    pmHigh:'High',
    pmMedium:'Medium',
    pmLow:'Low',
    pmSanity:'Sanity',
    pmException:'Exception',
    revCreateError:'Cannot import. Select version under which you want diagram to be created',
    revCreateError1:'Cannot import under',
    revCreateError2:'Select version under which you want diagram to be created',
    moduleCreateError:'Cannot create Module. Select project under which you want module to be created',
    moduleCreateError1:'Cannot create Module under',
    moduleCreateError2:'Select project under which you want module to be created',
    daigramCreateError:'Cannot create Diagram. Select Module under which you want diagram to be created',
    daigramCreateError1:'Cannot create Diagram under',
    daigramCreateError2:'Select Module under which you want diagram to be created',
    daigramModelCreateError:'Cannot create diagram. Select Model under which you want diagarm to be created',
    modelNotFoundError:'Existing model daigram\'s not found',
    selectModel:'Select Model',
    selectVersion:'Select Version',
    modleVersionSucc:'Model version created successfully',
    requirementalertmsg:'Do you want to map requirments',
    lockVersionMsg:'ERROR !!! Can\'t create new version because it is locked by',
    savedMsg:'Saved successfully',
    importSaveMsg:'Imported and Saved successfully. Please validate',
    importUploadMsg:"Imported successfully",
    selectFileMsg:"Please select file to import",
    selectAction:"Select Action",
    selectTargetType:"Select Target Type",
    deleteMsg:"Please Select Item To Delete By Clicking CheckBox",
    validateMsg:"Validated successfully",
    nodeWithoutConnectivity:"Some node(s) are without any connectivity. Please remove them.",
    endNode:"ERROR !!! Can't find end node in graph",
    recheckGraph:"Please recheck the graph because it does not have any start state",
    multipleStartStates:"ERROR !!! Looks like there are multiple starting states. Maximum one is allowed",
    nothingValidate:"ERROR !!! There is nothing to validate",
    outwardConnection:"ERROR !!! Only one outward connection is allowed for START node",
    startInbound:"ERROR !!! START node can't have any inbound links",
    endOutbound:"ERROR !!! END node can't have any outbound link",
    endInbound:"ERROR !!! END node must have atleast one inbound link",
    exceptionOutbound:"ERROR !!! Exception node can't have any outbound link",
    exceptionInbound:"ERROR !!! Exception node must have atleast one inbound link",
    activityOutbound:"ERROR !!! Activity node must have atleast one outbound link.",
    activityOneOutbound:"ERROR !!! Activity node must have only one outbound link",
    activityAtleastInbound:"ERROR !!! Activity node must have atleast one inbound link",
    activityOneInbound:"ERROR !!! Activity node must have only one inbound link",
    decisionTwoOutbounds:"ERROR !!! Decision node must have two outbound links",
    decisiononeInbound:"ERROR !!! Decision node must have one inbound link",
    decisionOnlyInbound:"ERROR !!! Decision node must have only one inbound link",
    forkInbound:"ERROR !!! Fork Node must have one inbound link",
    forkTwoOutbounds:"ERROR !!! Fork Node must have one inbound link",
    joinOneOutbound:"ERROR !!! Join Node must have only one outbound link",
    joinTwoInbound:"ERROR !!! Join Node must have at least two inbound links",
    forkOneInTwoOutbound:"ERROR !!! Fork Node must have one inbound link & at least two outbound links",
    joinOneInTwoOutbound:"ERROR !!! Join Node must have at least two inbound links & one outbound link",
    startEnd:"ERROR !!! All nodes except Start, End and Exception must have text",
    linkSource:"ERROR !!! Link must have atleast one source destination",
    linkTarget:"ERROR !!! Link must have atleast one target destination",
    selectRequirement:"Select Requirements",
    select:"Select",
    deleteConfirmation:"Are you sure you want to delete the",
    deletekeyword:"Are you sure you want to delete the keyword",
    deleteUser:"Are you sure you want to delete the user",
    deleteVersion:"Deleted",
    deleteSuccessfully:"successfully",
    regression:"Regression",
    delete:"Delete",
    imporJira:"Import From Jira"
}

var copyObject={
    clonedNodes:{},
    copyNodes:[],
    pastedNodes:[],
    parentVId:''
}

// Add events
$('#importFileInput').on('change', prepareUpload);
// Grab the files and set them to our variable
function prepareUpload(event) {
    var file = event.target.files[0];
    fileName=file.name;
    if(file.type !== "text/xml" && file.type !== "application/vnd.ms-visio.viewer" && !fileName.endsWith('.xls') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.bpmn')) {
        dailogmsg("Wrong file type: " + file.type);
        $('#importFileInput').val('');
        return false;
    }
    var readFile = new FileReader();
    readFile.onload = function (e) {
        fileContents = e.target.result;
    };    
    if(file.type == "text/xml"){
        fileType='xml';
        readFile.readAsText(file);
    //}else if(file.type == "application/vnd.ms-visio.viewer"){
    }else if(file.type == "application/vnd.ms-visio.viewer"){
        fileType='visio';
        readFile.readAsBinaryString(file);
    }else if(fileName.endsWith('.bpmn')){
        fileType='bpmn';
        readFile.readAsBinaryString(file);
    }else{    
        fileType='excel';
        readFile.readAsBinaryString(file);
    }
}
$("#importButton").click(function(event){    
    event.stopImmediatePropagation();
    //event.preventDefault();
    $('#bodyoverlay').addClass('overlay');   
    window.setTimeout(function(){uploadFiles()} ,100);
});
function uploadFiles()
{  
    if(fileContents != undefined && fileContents != null &&  fileContents.length >0) {
        $("#importFile").css("display", "none");
        var versionId = (currentSelectedNode.id).split("_")[1]
        var data = {fileAdd: "IWF", versionId:versionId, fileData: fileContents, fileType: fileType, fileName: fileName};
        sendAJAX(data, app_server_url, function (data) {
            app.graph.fromJSON(data.data);
            if(fileType=='excel'){
                $('#btn-layout').click();
                var json = JSON.stringify(app.graph);
                var data = { fileAdd: "SGVD", blobData: json, versionId: versionId };
                sendAJAX(data, app_server_url, function (data) {
                    loadJSTree('onUpdate');
                    dailogmsg(labelObj.importSaveMsg);
                });
            } else {
                $('#btn-layout').click();
                dailogmsg(importUploadMsg);   
                $("#btn-png-save").removeClass("icon-btn-disable");             
            }
        });
        closeImportFileModal();              
        $('#bodyoverlay').removeClass('overlay');  
    }else{
        $('#bodyoverlay').removeClass('overlay');  
        dailogmsg(labelObj.selectFileMsg);  
    }
}
function closeImportFileModal(){
    $("#importFile").css("display", "none");
    fileContents = '';
    fileType = '';
    fileName = '';
    $('#importFileInput').val('');
}
$("#importFile #close-modal").click(closeImportFileModal);

$("#saveProjectButton").click(saveProject);
$("#saveModuleButton").click(saveModule);
$("#saveDiagramButton").click(saveDiagram);


$("#cancelButton").click(function(e){
    $("#createProjectModal").hide();
    $('.ui-igtrialwatermark').removeClass('bgopacity');
});

$("#cancelModuleButton").click(function(e){
    closeCreateModuleModal();
});

$("#cancelDiagramButton").click(function(e){
    closeCreateDiagramModal();
});

function saveProject(){
    var name=$("#pNameId").val();
    var actId=$("#buNameId").val();
    var qcurl=$("#qcURL").val();
    var qcusrname=$("#qcName").val();
    var qcpass=$("#qcppass").val();
    var qcdomain=$("#qcpdomain").val();
    var qcproject=$("#qcpproject").val();
    var toolId=$('#automationIntegration').val();
    var toolTyp=$('input[name=actTyp]:checked').val();

  if(name && actId){  
    var data = {fileAdd:"CNP",name:name,actId:actId,qcurl:qcurl,qcusrname:qcusrname,qcpass:qcpass,qcdomain:qcdomain,qcproject:qcproject,toolId:toolId,toolTyp:toolTyp};
    sendAJAX(data,app_server_url,function(data){
        console.log(data);
        if(data["code"] == '200'){
            loadJSTree("onUpdate");
            dailogmsg(labelObj.savedMsg);
        }else{
            dailogmsg(data["msg"]);
        }
    });
    closeCreateProjectModal();
}else {
      
    if(name=='' && actId==''){
        $("#projerror").html("Project Name is Required"); 
        $("#busprojerror").html("Business Account is Required");
        $("#createProjectModal").css("display", "block");
      }else if(name==''){
         $("#projerror").html("Project Name is Required");  
        $("#createProjectModal").css("display", "block");
       }else if(actId==''){
        $("#busprojerror").html("Business Account is Required");
        $("#createProjectModal").css("display", "block");
    }
}
    
}

function closeCreateProjectModal(){
    $('#pNameId').val('');
    $("#createProjectModal").css("display", "none");
    $('.ui-igtrialwatermark').removeClass('bgopacity');    
}

$("#createProjectModal #close-modal").click(closeCreateProjectModal);


function saveModule(){
    var name=$("#moduleName").val();
  
    if(name){
        var currentProjectId = (currentSelectedNode.id).split("_")[1];
        var data = {fileAdd:"CNM",name:name,projectId:currentProjectId};
        sendAJAX(data,app_server_url,function(data){
            if(data["code"] == '200'){
                $('#jstree_demo').jstree().create_node(currentSelectedNode.id, {"id": "module_"+data.data[0].id,"text":name,"icon":"/images/module.png" }, "last",
                        function() {
                        createReq("module_"+data.data[0].id,data.data[0].id);
                        createModel("module_"+data.data[0].id,data.data[0].id);
                        createTS("module_"+data.data[0].id,data.data[0].id);
                    });
            }else{
                dailogmsg(data["msg"]);
            }
        });
        closeCreateModuleModal();
    }else{
        $("#moduleerror").html("Module Name is Required"); 
        $("#createModuleModal").css("display", "block");
    }
   
}

function closeCreateModuleModal(){
    $('#moduleName').val('');
    $("#createModuleModal").hide();
    $('.ui-igtrialwatermark').removeClass('bgopacity');
}

function saveDiagram(){
    var name=$("#diagName").val();
    if(name){
        var currentModuleId = (currentSelectedNode.id).split("_")[1];
        var data = {fileAdd:"CND",name:name,moduleId:currentModuleId};
        sendAJAX(data,app_server_url,function(data){
            if(data["code"] == '200'){
                $('#jstree_demo').jstree().create_node(currentSelectedNode.id, {"id": "diagram_"+data.data[0].id,"text":name,"icon":"/images/fc.png" }, "last",
                    function() {

                    });
            }else{
                dailogmsg(data["msg"]);
            }
        });
        closeCreateDiagramModal();
    }else{
        $("#daierror").html("Daigram Name is Required"); 
        $("#createDiagramModal").css("display", "block");
    }
    
}

function closeCreateDiagramModal(){
    $('#diagName').val('');
    $("#createDiagramModal").hide();
    $('.ui-igtrialwatermark').removeClass('bgopacity');
}

function getAccountDetails(bAccountIds){
    var actIds=[];
    if(bAccountIds!=null){
        actIds=bAccountIds.split(',');
    }
    var data = {fileAdd:"GBA",actIds:actIds};
    sendAJAX(data,app_server_url,function(data){
        $.each(data.data, function (i, item) {
            if (data.data.length > 0) {
                $('#buNameId').append($('<option>', {
                    value: item.id,
                    text: item.name
                }));
            }
        });
    });
}


function printUserName(userName){
     var welcomeText = $('#userNameId span.welcometext').text();
    $('#userNameId span.welcometext').text(welcomeText + ' ' + userName + ' !');
   }

function logoutUser(){   
    var data = {fileAdd:"USO"};
    sendAJAX(data,app_server_url,function(data){
        console.log('logging out the user signed in');
        session.userDetails = JSON.parse(localStorage.getItem("session"));
        if (session.userDetails != undefined) {
            localStorage.setItem("session", null);
            session.userDetails = null;
           // dailogmsg('logged out successfully');
            window.location.href = app_server_url;
        }
    });  
}

$(document).on('click','#modal-yes-logout',logoutUser);
$(document).on('click','#modal-no-logout',function(){
    var divToRemove=$(document).find("#createlogoutmodal");
    divToRemove.html('');
    divToRemove.remove();
    $('#modal-bg').removeClass('bgopacity');
});

$(document).on('click', '#userNameId a', function () {
    $('<div id="createlogoutmodal"  style="display: block;"  align="center">' +
        '<div id="header-modal" align="left">' +
        '<span>' + labelObj.dialogHeaderLogout + '</span>' +
        '</div>' +
        '<div id="body-modal" class="popupbodytxt">' +
        ' <div>' + labelObj.logoutdialogText + '</div>' +
        '<div id="footer-modal"><input id="modal-yes-logout" type="button" value="' + labelObj.buttonYes + '"><input id="modal-no-logout" type="button" value="' + labelObj.buttonNo + '"></div>' +
        '</div>' +
        '</div>' +
        '</div>').appendTo('#popupdata');
    $('#modal-bg').addClass('bgopacity');
});

function convertArrayToString(inputArr){
    var inputStr='';
    if(inputArr!=null && inputArr.length>0){
        if(inputArr.length==1){
            inputStr=inputArr[0];
            return inputStr;
        }
        $.each(inputArr, function (i, item) {
            inputStr=inputStr+item;
            if(i!=(inputArr.length-1)){
                inputStr=inputStr+',';
            }
        });
    }
    return inputStr;
}

function dailogmsg(msg) {
    $('<div id="createalertmodal"  style="display: block;"  align="center">' +
        '<div id="header-modal" align="left">' +
        '<span>' + labelObj.dialogHeader + '</span>' +
        '</div>' +
        '<div id="body-modal" class="popupbodytxt">' +
        '<div>' + msg + '</div>'
        +
        '<div id="footer-modal"><input id="modal-ok" type="button" value="' + labelObj.buttonOk + '"></div>' +

        '</div>'+
        '</div>'+                 
'</div>').appendTo('#popupdata');
$('#modal-bg').addClass('bgopacity'); 

}

function dailogmsgautosave(msg){    
    $('<div id="createalertmodalpopupsave"  style="display: block;"  align="center">'+    
        '<div id="body-modal" class="popupbodytxt" style="margin-top:0px;">'+               
                       '<div>'+msg+'</div>'  
                       +   
                       '</div>'+
        '</div>'+                 
'</div>').appendTo('#popupdata');
$('#modal-bg').addClass('bgopacity'); 

}

$(document).on('click','#modal-ok',function(){
    var divToRemove=$(document).find("#createalertmodal");
    divToRemove.hide();
    divToRemove.html('');
    divToRemove.remove();
    $('#modal-bg').removeClass('bgopacity');
});

function saveTestData(nodeId,copyNodeId){
    var versionId=(currentSelectedNode.id).split("_")[1];
    var data = {fileAdd:"TCC",n:nodeId,vId:versionId,cn:copyNodeId,pVId:copyObject.parentVId};
    sendAJAX(data,app_server_url,function(data){
        if(data["code"] != '200'){
            dailogmsg(data["msg"]);            
        }else{
            var index = copyObject.copyNodes.indexOf(nodeId);
            var copyIndex = copyObject.pastedNodes.indexOf(copyNodeId);
            if (index > -1 && copyIndex > -1 && index==copyIndex) {
                copyObject.copyNodes.splice(index, 1);
                copyObject.pastedNodes.splice(index, 1);
            }
        }
    });
}

$(document).on('click','.project_report_version',function(){
     var idVal=this.id;
     idVal=idVal.replace("project_report_","");
     var nodeId="#version_"+idVal.trim();
     var nodeObjExists = $('#jstree_demo').jstree(true).get_node(nodeId);
     if(nodeObjExists){
        $('#jstree_demo').jstree(true).select_node(nodeId);
        $('#project-report-close').click();  
     }else{
        dailogmsg("Not allowed to access this model as it is draft version & locked");
     }    
});

$('#langDD').on('change', function () {
    var langCode = $(this).val();
    locale_global = langCode;
    window.location.href = app_server_url + "/home.html?locale=" + locale_global;
});

function createHome() {
    window.location.href = app_server_url + "/home.html?locale=" + locale_global;
}


function loadI18Ndata(screen) {

    var set_locale_to = function (locale) {
        if (locale) {
            $.i18n().locale = locale;
            locale_global = locale;
        }
    };

    var pathPrefix = './';

    if (screen != 'HOME') {
        pathPrefix = '../';
    }

    $.getJSON( pathPrefix + 'js/i18n/en.json', function(result){
      console.log('English:'+Object.values(result));
    });
    $.getJSON( pathPrefix + 'js/i18n/es-MX.json', function(result){
        console.log('Spanish:'+Object.values(result));
      });
      $.getJSON( pathPrefix + 'js/i18n/ja.json', function(result){
        console.log('japanese:'+Object.values(result));
      });  

    $.i18n().load({
        'en': pathPrefix + 'js/i18n/en.json',
        'es-MX': pathPrefix + 'js/i18n/es-MX.json',
        'ja': pathPrefix + 'js/i18n/ja.json'
    }).done(function () {
        var localeVal = url('?locale');
        if (localeVal == undefined || localeVal == '') {
            localeVal = 'en';
        }
        $('#langDD').val(localeVal);
        set_locale_to(localeVal);
        console.log('i18n files loaded!');
        console.log($.i18n().locale);
        $('#titleId').text(geti18nValue('title'));
        $('#homeId a').text(geti18nValue('homeId'));
        $('#adminId a').text(geti18nValue('adminId'));
        if (session.userDetails != undefined) {
            $('#userNameId span.welcometext').text(geti18nValue('welcomeText'));
            printUserName(session.userDetails.name);
        }
        $('#nav-help a#helpId').attr("title", geti18nValue("help"));
        $('#nav-help li#userGuideId a').text(geti18nValue('user-guide'));
        $('#nav-help li#adminGuideId a').text(geti18nValue('admin-guide'));
        $('#userNameId a.logouttxt').attr("title", geti18nValue("logout"));
        labelObj.logoutdialogText = geti18nValue("logout-dialog-text");
        labelObj.dialogHeader = geti18nValue("dialog-header");
        labelObj.dialogHeaderConfirm = geti18nValue("dialog-header-confirm");
        labelObj.dialogHeaderReqMap = geti18nValue("dialog-header-reqmap");
        labelObj.dialogHeaderprojMet = geti18nValue("dialog-header-projmet");
        labelObj.dialogHeaderLogout = geti18nValue("dialog-header-logout");
        labelObj.buttonOk = geti18nValue("button-ok");
        labelObj.buttonYes = geti18nValue("button-yes");
        labelObj.buttonNo = geti18nValue("button-no");
        labelObj.buttonCancel = geti18nValue("button-cancel");
        labelObj.buttonBlank = geti18nValue("button-blank");
        labelObj.buttonImport = geti18nValue("button-import");
        labelObj.buttonSave = geti18nValue("button-save");
        labelObj.buttonConnect = geti18nValue("button-connect");
        labelObj.buttonClose = geti18nValue("button-close");
        labelObj.buttonPost = geti18nValue("button-post");
        labelObj.buttonExport = geti18nValue("button-export");
        labelObj.buttonAddArgs = geti18nValue("button-addargs");
        labelObj.buttonAddKeyword = geti18nValue("button-addkeyword");        
        $('#createversionmodal div#header-modal span').text(geti18nValue("dialog-header-createver"));
        $('#modal-yes-version').attr("value", labelObj.buttonYes);
        $('#modal-blank-version').attr("value", labelObj.buttonBlank);
        $('#modal-close-version').attr("value", labelObj.buttonClose);
        $('#createversionmodal div#body-modal  tr:nth-child(1) td').text(geti18nValue('dialog-createver-row1'));
        $('#createversionmodal div#body-modal  tr:nth-child(3) td').text(geti18nValue('dialog-createver-row3'));
        $('#importFile div#header-modal span').text(geti18nValue("dialog-header-import"));
        $('#importButton').attr("value", labelObj.buttonImport);
        $('#importcancel').attr("value", labelObj.buttonCancel);
        $('#importFile div#body-modal  table:nth-child(1) div').text(geti18nValue('dialog-import-row1'));
        $('#importFile div#body-modal  table:nth-child(2) label').text(geti18nValue('dialog-import-row2'));
        $('#importFile div#body-modal  table:nth-child(2) div').text(geti18nValue('dialog-import-row3'));
        $('#createProjectModal .header-modal1 span').text(geti18nValue("dialog-header-createproj1"));
        $('#createProjectModal .header-modal2 span').text(geti18nValue("dialog-header-createproj2"));
        $('#createProjectModal .header-modal3 span').text(geti18nValue("dialog-header-createproj3"));
        $('#saveProjectButton').attr("value", labelObj.buttonSave);
        $('#cancelButton').attr("value", labelObj.buttonCancel);
        $('#createProjectModal .body-modal1  tr td:nth-child(1) label').text(geti18nValue('dialog-createproj-1-row1'));
        $('#createProjectModal .body-modal1  tr td:nth-child(3) label').text(geti18nValue('dialog-createproj-1-row2'));
        $('#createProjectModal .body-modal2  tr:nth-child(1)  td:nth-child(1) label').text(geti18nValue('dialog-createproj-2-row1'));
        $('#createProjectModal .body-modal2  tr:nth-child(1)  td:nth-child(3) label').text(geti18nValue('dialog-createproj-2-row2'));
        $('#createProjectModal .body-modal2  tr:nth-child(2)  td:nth-child(1) label').text(geti18nValue('dialog-createproj-2-row3'));
        $('#createProjectModal .body-modal3  tr:nth-child(1) td label').text(geti18nValue('dialog-createproj-3-row1'));
        $('#createProjectModal .body-modal3  tr:nth-child(2) td label:nth-child(1)').text(geti18nValue('dialog-createproj-3-row2'));
        $('#createModuleModal div#header-modal span').text(geti18nValue("dialog-header-createmodule"));
        $('#saveModuleButton').attr("value", labelObj.buttonSave);
        $('#cancelModuleButton').attr("value", labelObj.buttonCancel);
        $('#createModuleModal tr td:nth-child(1) label').text(geti18nValue("dialog-createmodule-row1"));
        $('#createDiagramModal div#header-modal span').text(geti18nValue("dialog-header-creatediag"));
        $('#saveDiagramButton').attr("value", labelObj.buttonSave);
        $('#cancelDiagramButton').attr("value", labelObj.buttonCancel);
        $('#createDiagramModal tr td:nth-child(1) label').text(geti18nValue("dialog-creatediag-row1"));
        $('#createQCLoginModal div#header-modal span').text(geti18nValue("dialog-header-hpqc"));
        $('#HpQCLogin').attr("value", labelObj.buttonConnect);
        $('#HpQCCancel').attr("value", labelObj.buttonCancel);
        $('#createQCLoginModal #login-modal tr:nth-child(2) td:nth-child(1)').text(geti18nValue("dialog-hpqc-row1"));
        $('#createQCLoginModal #login-modal tr:nth-child(5) td:nth-child(1)').text(geti18nValue("dialog-hpqc-row2"));
        $('#createQCLoginModal #login-modal tr:nth-child(8) td:nth-child(1)').text(geti18nValue("dialog-hpqc-row3"));
        $('#createQCLoginModal #login-modal tr:nth-child(11) td:nth-child(1)').text(geti18nValue("dialog-hpqc-row4"));
        $('#createQCLoginModal #login-modal tr:nth-child(14) td:nth-child(1)').text(geti18nValue("dialog-hpqc-row5"));
        $('#createDomainAndProjectModal div#header-modal span').text(geti18nValue("dialog-header-domproj"));
        $('#createDomainAndProjectModal div#header-modal a').text(labelObj.buttonClose);
        $('#createDomainAndProjectModal div#body-modal  tr:nth-child(1) td:nth-child(1)').text(geti18nValue('dialog-domproj-row1'));
        $('#createDomainAndProjectModal div#body-modal  tr:nth-child(2) td:nth-child(1)').text(geti18nValue('dialog-domproj-row2'));
        $('#exportTestcaseButton').attr("value", labelObj.buttonExport);
        $('#modal-content-version div#header-modal span').text(geti18nValue("dialog-header-modalver"));
        $('#modal-yes').attr("value", labelObj.buttonOk);
        $('#modal-close').attr("value", labelObj.buttonCancel);
        $('#modal-content-version #select_model_tocopy option[value=""]').text(geti18nValue('dialog-modalver-row1'));
        $('#modal-content-version #select_version_tocopy option[value=""]').text(geti18nValue('dialog-modalver-row2'));
        if (screen == 'REVENG') {
            $('#revengpage h3').text(geti18nValue('rev-eng-heading'));
            $('#v-nav ul li:nth-child(1) div.tabText').text(geti18nValue('rev-eng-tab1'));
            $('#v-nav ul li:nth-child(2) div.tabText').text(geti18nValue('rev-eng-tab2'));
            $('#v-nav ul li:nth-child(3) div.tabText').text(geti18nValue('rev-eng-tab3'));
            $('#v-nav ul li:nth-child(4) div.tabText').text(geti18nValue('rev-eng-tab4'));
            $('#v-nav ul li:nth-child(5) div.tabText').text(geti18nValue('rev-eng-tab5'));
            $('#importFileTabCon h4').text(geti18nValue('rev-eng-import-header'));
            $('#header-modal-RevEng tr:nth-child(1) td:nth-child(1)').text(geti18nValue('rev-eng-import-row1'));
            $('#header-modal-RevEng tr:nth-child(2) td:nth-child(1)').text(geti18nValue('rev-eng-import-row2'));
            $('#header-modal-RevEng tr:nth-child(4) td:nth-child(1)').text(geti18nValue('rev-eng-import-row3'));
            $('#importFileTabInfo').text(geti18nValue('rev-eng-import-info'));
            $('#importRevEngButton').val(geti18nValue('rev-eng-import-button'));
            $('#importRevEngFileSupport').text(geti18nValue('rev-eng-import-support'));
            $('#importselectid option[value=""]').text(geti18nValue('rev-eng-import-selsheet'));
            $('#fieldMapTabCon h4').text(geti18nValue('rev-eng-fm-header'));
            $('#fieldMapTabInfo').text(geti18nValue('rev-eng-fm-info'));
            $('#applyFieldMappingButton').val(geti18nValue('rev-eng-fm-apply'));
            $('#fmTemplateColLabel').text(geti18nValue('rev-eng-fm-tc'));
            $('#fmMappedColLabel').text(geti18nValue('rev-eng-fm-mc'));
            $('#fmExcelColLabel').text(geti18nValue('rev-eng-fm-ec'));
            $('#verifyMap h4').text(geti18nValue('rev-eng-vm-header'));
            $('#verifyMapTabInfo').text(geti18nValue('rev-eng-vm-info'));
            $('#applydiagnoseButton').val(geti18nValue('rev-eng-vm-diagnose'));
            $('.dicecoefftext').text(geti18nValue('rev-eng-vm-dc-text'));
            $('#rowPageLabel').text(geti18nValue('rev-eng-vm-rowpage'));
            $('#fieldMappingSearch div#tableSearch input').attr("placeholder", geti18nValue("rev-eng-vm-search-ph"));
            $('#diagnoseTabCon h4').text(geti18nValue('rev-eng-diagnose-header'));
            $('#diagnoseTabConInfo').text(geti18nValue('rev-eng-diagnose-info'));
            $('#generateModelPreview').val(geti18nValue('rev-eng-diagnose-gmp'));
            $('#filtertext').val(geti18nValue('rev-eng-diagnose-fc'));
            $('#totaltcCountLabel').text(geti18nValue('rev-eng-diagnose-ttc'));
            $('#totalstepCountLabel').text(geti18nValue('rev-eng-diagnose-tsc'));
            $('#modifiedCountLabel').text(geti18nValue('rev-eng-diagnose-mc'));
            $('#rowpageDdLabel').text(geti18nValue('rev-eng-diagnose-rowpage'));
            $('#diagnoseSearch div#tableSearch input').attr("placeholder", geti18nValue("rev-eng-diagnose-search-ph"));
            $('#modelprevTabCon h4').text(geti18nValue('rev-eng-preview-header'));
            $('#modelprevTabConInfo').text(geti18nValue('rev-eng-preview-info'));
            $('#modelPreviewConfirm').val(geti18nValue('rev-eng-preview-pc'));
            $('#re_model_metrics_label').text(geti18nValue('rev-eng-preview-mm'));
            $('#re_model_metrics_total').text(geti18nValue('rev-eng-preview-mm-total'));
            $('#re_model_metrics_nodes').text(geti18nValue('rev-eng-preview-mm-nodes'));
            $('#re_model_metrics_optimized').text(geti18nValue('rev-eng-preview-mm-opt'));
            $('#re_model_metrics_optperc').text(geti18nValue('rev-eng-preview-mm-optperc'));

        } else if (screen == 'ADMIN') {
            $('#ui-id-1').text(geti18nValue('admin-tabs-1'));
            $('#ui-id-2').text(geti18nValue('admin-tabs-2'));
            $('#ui-id-3').text(geti18nValue('admin-tabs-3'));
            $('#ui-id-4').text(geti18nValue('admin-tabs-4'));
            $('#ui-id-5').text(geti18nValue('admin-tabs-5'));
            $('#ui-id-6').text(geti18nValue('admin-tabs-6'));
            $('#ui-id-7').text(geti18nValue('admin-tabs-7'));
            $('#ui-id-8').text(geti18nValue('admin-tabs-8'));
            loadAdminTab1();
            loadAdminTab2();
            loadAdminTab3();
            loadAdminTab4();
            loadAdminTab5();
            loadAdminTab6();
            loadAdminTab7();
            loadAdminTab8();
        } else if (screen == 'REGRESSION') {
            $('#compareTable  tr td:nth-child(1)').text(geti18nValue("compare-tbl-desc"));
            $('#compareTable  tr td:nth-child(3)').text(geti18nValue("compare-tbl-and"));
            $('#compareid').text(geti18nValue("compare-tbl-button"));
            $('#re_scen_status_label').text(geti18nValue("regress-bottom-panel-scestatus"));
            $('#re_node_trace_label').text(geti18nValue("regress-bottom-panel-nodetrace"));
            $('#tab2_label1').text(geti18nValue("regress-bottom-panel-scestatus1"));
            $('#tab2_label2').text(geti18nValue("regress-bottom-panel-scestatus2"));
            $('#tab2_label3').text(geti18nValue("regress-bottom-panel-scestatus3"));
            $('#tab2_label4').text(geti18nValue("regress-bottom-panel-scestatus4"));
            $('#nodeTraceTable  thead tr th:nth-child(2)').text(geti18nValue("regress-bottom-panel-nodetrace-sid"));
            $('#nodeTraceTable  thead tr th:nth-child(3)').text(geti18nValue("regress-bottom-panel-nodetrace-sname"));
            $('#nodeTraceTable  thead tr th:nth-child(4)').text(geti18nValue("regress-bottom-panel-nodetrace-crit"));
            $('#nodeTraceTable  thead tr th:nth-child(5)').text(geti18nValue("regress-bottom-panel-nodetrace-rexp"));
        } else {
            $('#btn-png-save').val(geti18nValue('save-button'));
            $('#btn-validate').val(geti18nValue('validate-button'));
            $('#btn-publish-version').val(geti18nValue("publish-button"));
            $('#btn-png-scenario1').val(geti18nValue("generate-button"));
            loadStencilMLData();
            loadToolbarMLData();
            loadRightNavMLData();
            loadLeftNavMLData();
            loadJSTree('onLoad');
            loadBottomPanel();
            labelObj.pmProjName=geti18nValue('proj-met-head1')
            labelObj.pmActName=geti18nValue('proj-met-head2')
            labelObj.pmTcCount=geti18nValue('proj-met-head3')
            labelObj.pmModuleName=geti18nValue('proj-met-head4')
            labelObj.pmDiagName=geti18nValue('proj-met-head5')
            labelObj.pmTotTC=geti18nValue('proj-met-head6')
            labelObj.pmHigh=geti18nValue('proj-met-head7')
            labelObj.pmMedium=geti18nValue('proj-met-head8')
            labelObj.pmLow=geti18nValue('proj-met-head9')
            labelObj.pmSanity=geti18nValue('proj-met-head10')
            labelObj.pmException=geti18nValue('proj-met-head11')
            labelObj.revCreateError=geti18nValue('rev-create-error')
            labelObj.revCreateError1=geti18nValue('rev-create-error1')
            labelObj.revCreateError2=geti18nValue('rev-create-error2')
            labelObj.moduleCreateError=geti18nValue('module-create-error')
            labelObj.moduleCreateError1=geti18nValue('module-create-error1')
            labelObj.moduleCreateError2=geti18nValue('module-create-error2')
            labelObj.daigramCreateError=geti18nValue('daigram-create-error')
            labelObj.daigramCreateError1=geti18nValue('daigram-create-error1')
            labelObj.daigramCreateError2=geti18nValue('daigram-create-error2')
            labelObj.daigramModelCreateError=geti18nValue('daigram-model-create-error')
            labelObj.modelNotFoundError=geti18nValue('model-not-found-error')
            labelObj.selectModel=geti18nValue('select-model')
            labelObj.selectVersion=geti18nValue('select-version')
            labelObj.modleVersionSucc=geti18nValue('mode-version-successful')
            labelObj.requirementalertmsg=geti18nValue('requirement-alert-msg')
            labelObj.lockVersionMsg=geti18nValue('lock-version-msg')
            labelObj.savedMsg=geti18nValue('saved-msg')
            labelObj.importSaveMsg=geti18nValue('import-save')
            labelObj.importUploadMsg=geti18nValue('import-upload-msg')
            labelObj.selectFileMsg=geti18nValue('select-file-msg')
            labelObj.selectTargetType=geti18nValue('select-target-type')
            labelObj.deleteMsg=geti18nValue('delete-msg')
            labelObj.validateMsg=geti18nValue('validate-msg')
            labelObj.nodeWithoutConnectivity=geti18nValue('node-without-connectivity')
            labelObj.endNode=geti18nValue('end-node');
            labelObj.recheckGraph=geti18nValue('recheck-graph');
            labelObj.multipleStartStates=geti18nValue('multiple-start-states');
            labelObj.nothingValidate=geti18nValue('nothing-validate')
            labelObj.outwardConnection=geti18nValue('outward-connection')
            labelObj.startInbound=geti18nValue('start-inbound')
            labelObj.endOutbound=geti18nValue('start-outbound')
            labelObj.endInbound=geti18nValue('end-inbound')
            labelObj.exceptionOutbound=geti18nValue('exception-outbound')
            labelObj.exceptionInbound=geti18nValue('exception-inbound')
            labelObj.activityOutbound=geti18nValue('activity-outbound')
            labelObj.activityOneOutbound=geti18nValue('activity-one-outbound')
            labelObj.activityAtleastInbound=geti18nValue('activity-atleast-inbound')
            labelObj.activityOneInbound=geti18nValue('activity-one-inbound')
            labelObj.decisionTwoOutbounds=geti18nValue('decision-two-outbounds')
            labelObj.decisiononeInbound=geti18nValue('decision-one-inbound')
            labelObj.decisionOnlyInbound=geti18nValue('decision-only-inbound')
            labelObj.forkInbound=geti18nValue('fork-inbound')
            labelObj.forkTwoOutbounds=geti18nValue('fork-two-outbounds')
            labelObj.joinOneOutbound=geti18nValue('join-one-outbound')
            labelObj.joinTwoInbound=geti18nValue('join-two-inbound')
            labelObj.forkOneInTwoOutbound=geti18nValue('fork-one-in-two-outbound')
            labelObj.joinOneInTwoOutbound=geti18nValue('join-one-in-two-outbound')
            labelObj.startEnd=geti18nValue('start-end')
            labelObj.linkSource=geti18nValue('link-source')
            labelObj.linkTarget=geti18nValue('link-target')
            labelObj.selectRequirement=geti18nValue('select-requirement')
            labelObj.select=geti18nValue('select')
            labelObj.deleteConfirmation=geti18nValue('delete-confirmation')
            labelObj.deletekeyword=geti18nValue('delete-keyword')
            labelObj.deleteUser=geti18nValue('delete-user')
            labelObj.deleteVersion=geti18nValue('delete-version')
            labelObj.deleteSuccessfully=geti18nValue('delete-successfully')
            labelObj.regression=geti18nValue('regression')
            labelObj.delete=geti18nValue('delete')
            labelObj.imporJira=geti18nValue('imporJira')
           
            






        }
    });

    function loadStencilMLData() {
        $(".joint-type-fsa-startstate").attr("data-tooltip", geti18nValue("stencil-start"));
        $(".joint-type-fsa-endstate").attr("data-tooltip", geti18nValue("stencil-end"));
        $(".joint-type-erd-entity").attr("data-tooltip", geti18nValue("stencil-activity"));
        $(".joint-type-erd-relationship").attr("data-tooltip", geti18nValue("stencil-decision"));
        $('.joint-type-app-rectangularmodel').each(function () {
            var tooltipData = $(this).attr("data-tooltip");
            if (tooltipData == 'Join Node') {
                $(this).attr("data-tooltip", geti18nValue("stencil-join"));
            } else {
                $(this).attr("data-tooltip", geti18nValue("stencil-fork"));
            }
        });

        $('.joint-type-basic-path').each(function () {
            var tooltipData = $(this).attr("data-tooltip");
            if (tooltipData == 'Send Signal') {
                $(this).attr("data-tooltip", geti18nValue("stencil-send-signal"));
            } else {
                $(this).attr("data-tooltip", geti18nValue("stencil-accept-event"));
            }
        });
        $(".joint-type-fsa-state").attr("data-tooltip", geti18nValue("stencil-state"));
        $(".joint-type-bpmn-gateway").attr("data-tooltip", geti18nValue("stencil-bpmn-gateway"));
        $(".joint-type-bpmn-event").attr("data-tooltip", geti18nValue("stencil-bpmn-event"));
        $(".joint-type-bpmn-activity").attr("data-tooltip", geti18nValue("stencil-bpmn-activity"));
        $(".joint-type-bpmn-dataobject").attr("data-tooltip", geti18nValue("stencil-bpmn-dataobject"));
        $(".joint-type-bpmn-conversation").attr("data-tooltip", geti18nValue("stencil-bpmn-conversation"));
        $(".joint-type-bpmn-choreography").attr("data-tooltip", geti18nValue("stencil-bpmn-choreography"));
        $(".joint-type-bpmn-message").attr("data-tooltip", geti18nValue("stencil-bpmn-message"));
        $(".joint-type-bpmn-annotation").attr("data-tooltip", geti18nValue("stencil-bpmn-annotation"));
        $(".joint-type-bpmn-group").attr("data-tooltip", geti18nValue("stencil-bpmn-group"));
    }

    function loadToolbarMLData() {
        $(".joint-toolbar-group #btn-undo").attr("data-tooltip", geti18nValue("toolbar-undo"));
        $(".joint-toolbar-group #btn-redo").attr("data-tooltip", geti18nValue("toolbar-undo"));
        $(".joint-toolbar-group #btn-clear").attr("data-tooltip", geti18nValue("toolbar-clear"));
        $(".joint-toolbar-group #btn-print").attr("data-tooltip", geti18nValue("toolbar-print"));
        $(".joint-toolbar-group #btn-fullscreen").attr("data-tooltip", geti18nValue("toolbar-full-screen"));
        $(".joint-toolbar-group #btn-layout").attr("data-tooltip", geti18nValue("toolbar-layout"));
        $(".joint-toolbar-group #btn-zoom-to-fit").attr("data-tooltip", geti18nValue("toolbar-zoom-to-fit"));
        $(".joint-toolbar-group label#btn-zoom-slider-label").text(geti18nValue("toolbar-zoom"));
        $(".joint-toolbar-group #btn-zoom-in").attr("data-tooltip", geti18nValue("toolbar-zoom-in"));
        $(".joint-toolbar-group #btn-zoom-out").attr("data-tooltip", geti18nValue("toolbar-zoom-out"));
        $(".joint-toolbar-group #btn-rev-eng").attr("data-tooltip", geti18nValue("toolbar-reveng"));
    }

    function loadLeftNavMLData() {
        $(".createNewProject").attr("data-tooltip", geti18nValue("jstree-createproject"));
        $(".createNewModule").attr("data-tooltip", geti18nValue("jstree-createmodule"));
        $(".createNewModel").attr("data-tooltip", geti18nValue("jstree-createmodel"));
        $(".createNewVersion").attr("data-tooltip", geti18nValue("jstree-createversion"));
        $(".importFile").attr("data-tooltip", geti18nValue("jstree-importfile"));
        $("#scenariosTabNameId").text(geti18nValue("scenarios-tabname"));
        $("#inspectorTabNameId").text(geti18nValue("inspector-tabname"));
        labelObj.reqText = geti18nValue("jstree-requirement");
        labelObj.modelText = geti18nValue("jstree-model");
        labelObj.verText = geti18nValue("jstree-version");
        labelObj.tsText = geti18nValue("jstree-testsuite");
        labelObj.reportTxt = geti18nValue("jstree-report");
        $('#sceDet_Type option[value="0"]').text(geti18nValue("scenario-all"));
        $('#sceDet_Type option[value="1"]').text(geti18nValue("scenario-sanity"));
        $('#sceDet_Type option[value="2"]').text(geti18nValue("scenario-normal"));
        $('#sceDet_Type option[value="3"]').text(geti18nValue("scenario-primary"));
        $('#sceDet_Type option[value="4"]').text(geti18nValue("scenario-alternate"));
        $('#sceDet_Type option[value="5"]').text(geti18nValue("scenario-exception"));
        $('#col_type option[value="Columns"]').text(geti18nValue("scenario-columns"));
        labelObj.criticality = geti18nValue("scenario-criticality");
        labelObj.severity = geti18nValue("scenario-severity");
        labelObj.riskIndex = geti18nValue("scenario-riskindex");
        labelObj.defects = geti18nValue("scenario-defects");
        labelObj.frequency = geti18nValue("scenario-frequency");
        labelObj.si = geti18nValue("scenario-si");
        labelObj.id = geti18nValue("scenario-id");
        labelObj.name = geti18nValue("scenario-name");
        $("#criticalityLabel").text(labelObj.criticality);
        $("#severityLabel").text(labelObj.severity);
        $("#riskIndexLabel").text(labelObj.riskIndex);
        $("#defectsLabel").text(labelObj.defects);
        $("#frequencyLabel").text(labelObj.frequency);
        if (columns != undefined) {
            columns = [
                { title: "<input type='checkbox' name='sceIdCheck' id='sceIdCheck_All' value='All' />" },
                { title: "<img src='images/risk.gif'/>" },
                { title: labelObj.si },
                { title: labelObj.id },
                { title: labelObj.name },
                { title: labelObj.criticality },
                { title: labelObj.severity },
                { title: labelObj.riskIndex },
                { title: labelObj.defects },
                { title: labelObj.frequency }
            ]
        }
        labelObj.noDataText = geti18nValue("scenario-table-no-data");
    }

    function loadRightNavMLData() {
        $("#modelMetricsHeader").text(geti18nValue("model-metrics-header"));
        $("#modelCommentsHeader").text(geti18nValue("model-comments-header"));
        $(".modelscenarioLabel").text(geti18nValue("model-metrics-scenario"));
        $(".modelsanityLabel").text(geti18nValue("model-metrics-sanity"));
        $(".modelNormalLabel").text(geti18nValue("model-metrics-normal"));
        $(".modelExceptionLabel").text(geti18nValue("model-metrics-exception"));
        $(".modelCriticalityLabel").text(geti18nValue("model-metrics-critical"));
        $(".modelNodesLabel").text(geti18nValue("model-metrics-nodes"));
        $("#addCommentId").attr("placeholder", geti18nValue("model-comments-add"));
        $(".more-btn").text(geti18nValue("model-comments-more"));
        $(".closemet-btn").attr("value", geti18nValue("model-comments-close"));
        $(".post-btn").attr("value", geti18nValue("model-comments-post"));
    }

    function loadBottomPanel() {
        $("#problemsLabel").text(geti18nValue("problems-tab-label"));
        $("#sceDetailsLabel").text(geti18nValue("sceDetails-tab-label"));
        $("#descLabel").text(geti18nValue("desc-tab-label"));
        $("#testCondLabel").text(geti18nValue("testCond-tab-label"));
        $("#previewTCLabel").text(geti18nValue("previewTC-tab-label"));
        $("#nodeTraceLabel").text(geti18nValue("nodeTrace-tab-label"));
        $("#pathCoverLabel").text(geti18nValue("pathCover-tab-label"));
        $("#reqLabel").text(geti18nValue("req-tab-label"));
        $("#cutestLabel").text(geti18nValue("cutest-tab-label"));
        $("#tes_cond_action option:first").text(geti18nValue("select-action"));
        $("#tes_cond_targettype").text(geti18nValue("select-target-type"));
        loadBottomPanelDesc();
        loadBottomPanelNodeTrace();
        loadBottomPanelReq();
        loadBottomPanelPblm();
        loadBottomPanelScedtls();
        loadBottomPanelTestCond();
        loadBottomPanelPreviewTC();
        loadBottomPanelPathCover();
    }

    function loadBottomPanelDesc() {
        $('#descTable thead tr th:nth-child(1)').text(geti18nValue("desc-table-scenarioid"));
        $('#descTable thead tr th:nth-child(2)').text(geti18nValue("desc-table-stepsid"));
        $('#descTable thead tr th:nth-child(3)').text(geti18nValue("desc-table-steps"));
        $('#descTable thead tr th:nth-child(4)').text(geti18nValue("desc-table-teststep"));
        $('#descTable thead tr th:nth-child(5)').text(geti18nValue("desc-table-expresult"));
    }

    function loadBottomPanelNodeTrace() {
        $('#nodeTraceTable thead tr th:nth-child(2)').text(geti18nValue("nodeTrace-table-sceid"));
        $('#nodeTraceTable thead tr th:nth-child(3)').text(geti18nValue("nodeTrace-table-scename"));
        $('#nodeTraceTable thead tr th:nth-child(4)').text(geti18nValue("nodeTrace-table-critic"));
        $('#nodeTraceTable thead tr th:nth-child(5)').text(geti18nValue("nodeTrace-table-riskexpo"));
    }

    function loadBottomPanelReq() {
        $('#requirementTable thead tr th:nth-child(2)').text(geti18nValue("req-table-name"));
        labelObj.reqna = geti18nValue("req-table-na");
    }

    function loadBottomPanelPblm() {
        $('#problems ul.errorList').text(geti18nValue("pblms-table-noerror"));
    }

    function loadBottomPanelScedtls() {
        $('#sce_det_label_sceId').text(geti18nValue("sce-det-label-sceId"));
        $('#sce_det_label_name').text(geti18nValue("sce-det-label-name"));
        $('#sce_det_label_defects').text(geti18nValue("sce-det-label-defects"));
        $('#sce_det_label_te').text(geti18nValue("sce-det-label-te"));
        $('#sce_det_label_criticality').text(geti18nValue("sce-det-label-criticality"));
        $('#sce_det_label_severity').text(geti18nValue("sce-det-label-severity"));
        $('#sce_det_label_re').text(geti18nValue("sce-det-label-re"));
        $('#sce_det_label_pf').text(geti18nValue("sce-det-label-pf"));
        $('#sce_det_label_ri').text(geti18nValue("sce-det-label-ri"));
        $('#sceDet_criticality option[value="1"]').text(geti18nValue("sce-det-criticality-vl"));
        $('#sceDet_criticality option[value="2"]').text(geti18nValue("sce-det-criticality-l"));
        $('#sceDet_criticality option[value="3"]').text(geti18nValue("sce-det-criticality-m"));
        $('#sceDet_criticality option[value="4"]').text(geti18nValue("sce-det-criticality-h"));
        $('#sceDet_criticality option[value="5"]').text(geti18nValue("sce-det-criticality-vh"));
    }

    function loadBottomPanelTestCond() {
        $('#test_steps_label').text(geti18nValue("tst-step-label"));
        $('#save_test_cond').val(geti18nValue('tst-step-save'));
        $('#add_row').val(geti18nValue('tst-step-add'));
        $('#delete_row').val(geti18nValue('tst-step-delete'));
        $('#display_msg_test_step').text(geti18nValue("tst-step-display-msg"));
        $('#save_test_data').val(geti18nValue('tst-step-data-save'));
        $('#add_row_data').val(geti18nValue('tst-step-data-add'));
        $('#delete_row_data').val(geti18nValue('tst-step-data-delete'));
        $('#display_msg_test_data').text(geti18nValue("tst-step-data-display-msg"));
        $('#dataTable thead tr th:nth-child(3)').text(geti18nValue("tst-step-table-acion"));
        $('#dataTable thead tr th:nth-child(4)').text(geti18nValue("tst-step-table-ttype"));
        $('#dataTable thead tr th:nth-child(5)').text(geti18nValue("tst-step-table-target"));
        $('#dataTable thead tr th:nth-child(6)').text(geti18nValue("tst-step-table-step-data"));
        $('#dataTable thead tr th:nth-child(7)').text(geti18nValue("tst-step-table-desc"));
        $('#testDataTable thead tr th:nth-child(3)').text(geti18nValue("tst-data-table-target"));
        $('#testDataTable thead tr th:nth-child(4)').text(geti18nValue("tst-data-table-data"));
        $('#ot_btn_table input.save').val(geti18nValue("ot-table-save"));
        $('#ot_btn_table input.add').val(geti18nValue("ot-table-add"));
        $('#ot_btn_table input.delete').val(geti18nValue("ot-table-del"));
        $('#ot_btn_table tr td:first-child').text(geti18nValue("ot-table-label"));
        labelObj.otTableAction = geti18nValue("ot-data-table-action");
        labelObj.otTableArgs = geti18nValue("ot-data-table-args");
        labelObj.otTableDesc = geti18nValue("ot-data-table-desc");
    }

    function loadBottomPanelPreviewTC() {
        $('#exportCafenextLabel').text(geti18nValue("preview-tc-cn"));
        $('#exportManualTCLabel').text(geti18nValue("preview-tc-manual"));
        $('#exportHpalmTCLabel').text(geti18nValue("preview-tc-hp"));
        $('#exportJiraTCLabel').text(geti18nValue("preview-tc-jira"));
        $('#exportOTTCLabel').text(geti18nValue("preview-tc-ot"));
        $('#PreviewTable thead tr th:nth-child(1)').text(geti18nValue("preview-tc-table-sid"));
        $('#PreviewTable thead tr th:nth-child(2)').text(geti18nValue("preview-tc-table-sname"));
        $('#PreviewTable thead tr th:nth-child(3)').text(geti18nValue("preview-tc-table-compname"));
        $('#PreviewTable thead tr th:nth-child(4)').text(geti18nValue("preview-tc-table-stepid"));
        $('#PreviewTablec thead tr th:nth-child(5)').text(geti18nValue("preview-tc-table-stepdesc"));
    }

    function loadBottomPanelPathCover() {
        labelObj.pathCoverBar = geti18nValue("path-cover-bar");
        labelObj.pathCoverScensPerc = geti18nValue("path-cover-sce-perc");
        labelObj.pathCoverNodePerc = geti18nValue("path-cover-node-perc");
        labelObj.pathCoverNoOfScenSel = geti18nValue("path-cover-noof-scensel");
        labelObj.pathCoverTestEff = geti18nValue("path-cover-test-eff");
        labelObj.pathCoverSceDetails = geti18nValue("path-cover-sce-dtls");
        labelObj.pathCoverSceName = geti18nValue("path-cover-sce-name");
        labelObj.pathCoverSceSeverity = geti18nValue("path-cover-sce-severity");
        labelObj.pathCoverSceCriticality = geti18nValue("path-cover-sce-criticality");
        labelObj.pathCoverSceDefects = geti18nValue("path-cover-sce-defects");
        labelObj.pathCoverSceRe = geti18nValue("path-cover-sce-re");
        labelObj.pathCoverSceEffort = geti18nValue("path-cover-sce-eff");
        labelObj.pathCoverScePrimary = geti18nValue("path-cover-sce-primary");
        $('#PathCoveraTable thead tr th:nth-child(1)').text(geti18nValue("path-cover-table-dtls"));

    }

    function loadAdminTab1() {
        $('#one div#tabulator-controls input').attr("placeholder", geti18nValue("admin-tabs-1-ph"));
        labelObj.ulClient=geti18nValue("admin-tabs-1-head1");
        labelObj.ulProjects=geti18nValue("admin-tabs-1-head2");
        labelObj.ulUserId=geti18nValue("admin-tabs-1-head3");
        labelObj.ulFN=geti18nValue("admin-tabs-1-head4");
        labelObj.ulEmail=geti18nValue("admin-tabs-1-head5");
        labelObj.ulStartDt=geti18nValue("admin-tabs-1-head6");
        labelObj.ulEndDt=geti18nValue("admin-tabs-1-head7");
        labelObj.ulRole=geti18nValue("admin-tabs-1-head8");
        labelObj.ulStatus=geti18nValue("admin-tabs-1-head9");
        labelObj.ulAction=geti18nValue("admin-tabs-1-head10");
        loadResultTableGetUesrs();
        getUserList();        
    }

    function loadAdminTab2() {
        $('#two div.CreateTableHeading').text(geti18nValue("admin-tabs-2-heading"));
        $('#uidLabel').text(geti18nValue("admin-tabs-2-uid"));
        $('#fnLabel').text(geti18nValue("admin-tabs-2-fn"));
        $('#pwdLabel').text(geti18nValue("admin-tabs-2-pwd"));
        $('#conPwdLabel').text(geti18nValue("admin-tabs-2-conpwd"));
        $('#emailLabel').text(geti18nValue("admin-tabs-2-email"));
        $('#selRoleLabel').text(geti18nValue("admin-tabs-2-selrole"));
        $('#startDtLabel').text(geti18nValue("admin-tabs-2-stdt"));
        $('#endtDtLabel').text(geti18nValue("admin-tabs-2-enddt"));
        $('#clientLabelId').text(geti18nValue("admin-tabs-2-client"));
        $('#statusLabel').text(geti18nValue("admin-tabs-2-status"));
        $('#activeLabel').text(geti18nValue("admin-tabs-2-active"));
        $('#projectLabelId').text(geti18nValue("admin-tabs-2-proj"));
        $('.usersubmit').text(geti18nValue("admin-tabs-2-submit"));
        $('#usercancel').text(geti18nValue("admin-tabs-2-cancel"));
        $('#client1 option[value=""]').text(geti18nValue("admin-tabs-2-ddselclient"));
        $('#project1 option[value=""]').text(geti18nValue("admin-tabs-2-ddselproj"));

    }

    function loadAdminTab3() {
        $('#three div.CreateTableHeading').text(geti18nValue("admin-tabs-3-heading"));
        $('#baNameLabel').text(geti18nValue("admin-tabs-3-name"));
        $('#baDescLabel').text(geti18nValue("admin-tabs-3-desc"));
        $('#baLocLabel').text(geti18nValue("admin-tabs-3-loc"));
        $('#baStatusLabel').text(geti18nValue("admin-tabs-3-status"));
        $('#baActiveLabel').text(geti18nValue("admin-tabs-3-active"));
        $('.baSubmit').text(geti18nValue("admin-tabs-3-submit"));
        $('.baUpdate').text(geti18nValue("admin-tabs-3-update"));
        $('#baCancel').text(geti18nValue("admin-tabs-3-cancel"));
    }
    function loadAdminTab4() {
        $('#four div.CreateTableHeading').text(geti18nValue("admin-tabs-4-heading"));
        $('#editUidLabel').text(geti18nValue("admin-tabs-4-uid"));
        $('#editfnLabel').text(geti18nValue("admin-tabs-4-fn"));
        $('#editPwdLabel').text(geti18nValue("admin-tabs-4-pwd"));
        $('#editConPwdLabel').text(geti18nValue("admin-tabs-4-conpwd"));
        $('#editEmailLabel').text(geti18nValue("admin-tabs-4-email"));
        $('#editRoleLabel').text(geti18nValue("admin-tabs-4-selrole"));
        $('#editStartDtLabel').text(geti18nValue("admin-tabs-4-stdt"));
        $('#editEndDtLabel').text(geti18nValue("admin-tabs-4-enddt"));
        $('#editClientLabelId').text(geti18nValue("admin-tabs-4-client"));
        $('#editStatusLabel').text(geti18nValue("admin-tabs-4-status"));
        $('#editActiveLabel').text(geti18nValue("admin-tabs-4-active"));
        $('#editProjectLabelId').text(geti18nValue("admin-tabs-4-proj"));
        $('.userUpdate').text(geti18nValue("admin-tabs-4-update"));
        $('#userEditCancel').text(geti18nValue("admin-tabs-4-cancel"));
        $('#editClient option[value=""]').text(geti18nValue("admin-tabs-4-ddselclient"));
        $('#editProject option[value=""]').text(geti18nValue("admin-tabs-4-ddselproj"));
    }
    function loadAdminTab5() {
        $('#five div.CreateTableHeading').text(geti18nValue("admin-tabs-5-heading"));
        $('#hpalmSelProjLabel').text(geti18nValue("admin-tabs-5-selproj"));
        $('#hpalmConUrlLabel').text(geti18nValue("admin-tabs-5-conurl"));
        $('#hpalmDomainLabel').text(geti18nValue("admin-tabs-5-domain"));
        $('#hpalmProjectLabel').text(geti18nValue("admin-tabs-5-proj"));
        $('.hpSave').text(geti18nValue("admin-tabs-5-save"));
        $('#hpCancel').text(geti18nValue("admin-tabs-5-cancel"));
        $('#hpprojectid option[value=""]').text(geti18nValue("admin-tabs-5-ddselproj"));

    }
    function loadAdminTab6() {
        $('#six div.CreateTableHeading').text(geti18nValue("admin-tabs-6-heading"));
        $('#ttSelProjLabel').text(geti18nValue("admin-tabs-6-selproj"));
        $('.save-btnTC').text(geti18nValue("admin-tabs-6-save"));
        $('#testcase_project_id option[value="0"]').text(geti18nValue("admin-tabs-6-ddselproj"));
    }
    function loadAdminTab7() {
        $('#seven div.CreateTableHeading').text(geti18nValue("admin-tabs-7-heading"));
        $('#jiraTypeLabel').text(geti18nValue("admin-tabs-7-typ"));
        $('#jiraSelProjLabel').text(geti18nValue("admin-tabs-7-selproj"));
        $('#jiraUNLabel').text(geti18nValue("admin-tabs-7-un"));
        $('#jiraPwdLabel').text(geti18nValue("admin-tabs-7-pwd"));
        $('#jiraConUrlLabel').text(geti18nValue("admin-tabs-7-conurl"));
        $('#jiraAccessKeyLabel').text(geti18nValue("admin-tabs-7-acckey"));
        $('#jiraSecKeyLabel').text(geti18nValue("admin-tabs-7-seckey"));
        $('#getProjectId').text(geti18nValue("admin-tabs-7-getproj"));
        $('#jiraProjLabel').text(geti18nValue("admin-tabs-7-jiraproj"));
        $('#jiraSaveId').text(geti18nValue("admin-tabs-7-save"));
        $('#iauthorprojectdetails option[value="0"]').text(geti18nValue("admin-tabs-7-ddselproj"));

    }
    function loadAdminTab8() {
        $('.opentext-Text').text(geti18nValue("admin-tabs-8-heading"));
        $('#openTesttabs li#appkey a').text(geti18nValue("admin-tabs-8-tab1"));
        $('#openTesttabs li#seleniumkey a').text(geti18nValue("admin-tabs-8-tab2"));
        $('#openTesttabs li#generickey a').text(geti18nValue("admin-tabs-8-tab3"));
        labelObj.otKeywordName = geti18nValue("admin-tabs-ot-head3");
        labelObj.otKeywordAction = geti18nValue("admin-tabs-ot-head4");
        labelObj.otKeywordDesc = geti18nValue("admin-tabs-ot-head5");
        labelObj.otArgs = geti18nValue("admin-tabs-ot-head6");
        labelObj.otTypeOfVals = geti18nValue("admin-tabs-ot-head7");
        labelObj.otListOfVals = geti18nValue("admin-tabs-ot-head8");
        labelObj.otActions = geti18nValue("admin-tabs-ot-head9");
        labelObj.otAction = geti18nValue("admin-tabs-ot-head10");
        labelObj.otType = geti18nValue("admin-tabs-ot-head11");
        $('#opentestKeywordappium thead tr th:nth-child(3)').text(labelObj.otKeywordName);
        $('#opentestKeywordappium thead tr th:nth-child(4)').text(labelObj.otKeywordAction);
        $('#opentestKeywordappium thead tr th:nth-child(5)').text(labelObj.otKeywordDesc);
        $('#opentestKeywordappium thead tr th:nth-child(6)').text(labelObj.otArgs);
        $('#opentestKeywordappium thead tr th:nth-child(7)').text(labelObj.otTypeOfVals);
        $('#opentestKeywordappium thead tr th:nth-child(8)').text(labelObj.otListOfVals);
        $('#opentestKeywordappium thead tr th:nth-child(9)').text(labelObj.otActions);        
        $('#opentestKeywordselenium thead tr th:nth-child(3)').text(labelObj.otKeywordName);
        $('#opentestKeywordselenium thead tr th:nth-child(4)').text(labelObj.otKeywordAction);
        $('#opentestKeywordselenium thead tr th:nth-child(5)').text(labelObj.otKeywordDesc);
        $('#opentestKeywordselenium thead tr th:nth-child(6)').text(labelObj.otArgs);
        $('#opentestKeywordselenium thead tr th:nth-child(7)').text(labelObj.otTypeOfVals);
        $('#opentestKeywordselenium thead tr th:nth-child(8)').text(labelObj.otListOfVals);
		$('#opentestKeywordselenium thead tr th:nth-child(9)').text(labelObj.otActions);        
        $('#opentestKeywordgeneric thead tr th:nth-child(3)').text(labelObj.otKeywordName);
        $('#opentestKeywordgeneric thead tr th:nth-child(4)').text(labelObj.otKeywordAction);
        $('#opentestKeywordgeneric thead tr th:nth-child(5)').text(labelObj.otKeywordDesc);
        $('#opentestKeywordgeneric thead tr th:nth-child(6)').text(labelObj.otArgs);
        $('#opentestKeywordgeneric thead tr th:nth-child(7)').text(labelObj.otTypeOfVals);
        $('#opentestKeywordgeneric thead tr th:nth-child(8)').text(labelObj.otListOfVals);
		$('#opentestKeywordgeneric thead tr th:nth-child(9)').text(labelObj.otActions); 
        $('#appiumKeywordsaveTable tr:nth-child(1) td:nth-child(1) label').text(labelObj.otKeywordName);
        $('#appiumKeywordsaveTable tr:nth-child(2) td:nth-child(1) label').text(labelObj.otKeywordAction);
        $('#appiumKeywordsaveTable tr:nth-child(3) td:nth-child(1) label').text(labelObj.otKeywordDesc);
        $('.appiumKeywordsave .addArguments').text(labelObj.buttonAddArgs);
        $('#opentestKeywordsCreateappium thead th:nth-child(1)').text(labelObj.otArgs);
        $('#opentestKeywordsCreateappium thead th:nth-child(2)').text(labelObj.otType);
        $('#opentestKeywordsCreateappium thead th:nth-child(3)').text(labelObj.otListOfVals);
        $('#opentestKeywordsCreateappium thead th:nth-child(4)').text(labelObj.otAction);
        $('.appiumKeywordsave .saveOpenTest').text(labelObj.buttonSave);
        $('.appiumKeywordsave .cancelbtn').text(labelObj.buttonCancel);
        $('#seleniumKeywordsaveTable  tr:nth-child(1) td:nth-child(1) label').text(labelObj.otKeywordName);
        $('#seleniumKeywordsaveTable  tr:nth-child(2) td:nth-child(1) label').text(labelObj.otKeywordAction);
        $('#seleniumKeywordsaveTable  tr:nth-child(3) td:nth-child(1) label').text(labelObj.otKeywordDesc);
        $('.seleniumKeywordsave .addArguments').text(labelObj.buttonAddArgs);
        $('#opentestKeywordsCreateselenium thead th:nth-child(1)').text(labelObj.otArgs);
        $('#opentestKeywordsCreateselenium thead th:nth-child(2)').text(labelObj.otType);
        $('#opentestKeywordsCreateselenium thead th:nth-child(3)').text(labelObj.otListOfVals);
        $('#opentestKeywordsCreateselenium thead th:nth-child(4)').text(labelObj.otAction);
        $('.seleniumKeywordsave .saveOpenTest').text(labelObj.buttonSave);
        $('.seleniumKeywordsave .cancelbtn').text(labelObj.buttonCancel);
        $('#genericKeywordsaveTable  tr:nth-child(1) td:nth-child(1) label').text(labelObj.otKeywordName);
        $('#genericKeywordsaveTable  tr:nth-child(2) td:nth-child(1) label').text(labelObj.otKeywordAction);
        $('#genericKeywordsaveTable  tr:nth-child(3) td:nth-child(1) label').text(labelObj.otKeywordDesc);
        $('genericKeywordsave .addArguments').text(labelObj.buttonAddArgs);
        $('#opentestKeywordsCreategeneric thead th:nth-child(1)').text(labelObj.otArgs);
        $('#opentestKeywordsCreategeneric thead th:nth-child(2)').text(labelObj.otType);
        $('#opentestKeywordsCreategeneric thead th:nth-child(3)').text(labelObj.otListOfVals);
        $('#opentestKeywordsCreategeneric thead th:nth-child(4)').text(labelObj.otAction);
        $('.opentestKeywordselenium .saveOpenTest').text(labelObj.buttonSave);
        $('.genericKeywordsave .cancelbtn').text(labelObj.buttonCancel);
        $('#opentestKeywordappiumdisplay .addOpenTest').text(labelObj.buttonAddKeyword);
        $('.opentestKeywordselenium .addOpenTest').text(labelObj.buttonAddKeyword);
        $('#opentestKeywordgenericdisplay .addOpenTest').text(labelObj.buttonAddKeyword);
    }


    var geti18nValue = function (key) {
        try {
            return $.i18n(key);
        } catch (err) {
            return "";
        }
    }

};

