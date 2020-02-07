var request = require("request");
var stringparser = require('string');
var syncrequest = require("sync-request");
function authenticateHpAlm(response, data, userData)
{
    var hpAlmUrl;
    var hpqcurl=data.hpurl
    var username=data.usrname
    var pass=data.pass
    if(hpqcurl.includes("qcbin/")){
        hpAlmUrl = hpqcurl+"authentication-point/alm-authenticate";
    }else if(hpqcurl.includes("qcbin")){
        hpAlmUrl = hpqcurl+"/authentication-point/alm-authenticate";
    }else{
        hpAlmUrl = hpqcurl+"/qcbin/authentication-point/alm-authenticate";
    }
   
     var xml ='<alm-authentication><user>'+username+'</user><password>'+pass+'</password></alm-authentication>';
        request.post({
        url:hpAlmUrl,
        port: 8081,
        method:"POST", 
        headers:{
            'Content-Type': 'application/xml'
        },
         body: xml
    },
    function(error,hpresponse, body)
    {
        global.errorLog.error(error);
        global.appLog.debug(hpresponse);
        if(hpresponse!=undefined){
                if(hpresponse.statusCode==200){
                    var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: hpresponse.headers['set-cookie'].join(';')
                }
                response.end(JSON.stringify(resp));
            }else{
                    var resp = {
                        code: "300",
                        data: "1"
                    }
                response.end(JSON.stringify(resp));
            }
        }else{
            var resp = {
                code: "300",
                data: "1"
            }
            response.end(JSON.stringify(resp));
        }
        });

}

function createfolderAndValidate(response, data, userData)
{
 var username = data.username;
 var hpalmdomain = data.domain;
 var hplalmproject= data.project;  
 var hplcookie=data.hplwsCookie;
 var versionid=data.versionId;
 var scenarioIds=data.scenarioIds;
 var lwscookie_token=stringparser(hplcookie).chompRight(';HTTPOnly').s;
 var hpalmurl=data.hpaurl;
 var hparr=hpalmurl.split("/");
 var url=hparr[0] + "//" + hparr[2];
 var portsplit=hparr[2].split(":");
 var port=portsplit[1];
  request.post({
     url:url+'/qcbin/rest/site-session',
     port: portsplit[1],
     method:"POST",
     headers:{
                 'cookie': lwscookie_token
         }
        },
 function(error, hpresponse, body){
         var qcs_xsrf_token=hpresponse.headers['set-cookie'];
           createfolderservice(qcs_xsrf_token,lwscookie_token,versionid,scenarioIds,response,url,hpalmdomain,hplalmproject,username);
           
              
 });

}
function  createfolderservice(qcs_xsrf_token,lwscookie_token,versionid,scenarioIds,response,url,hpalmdomain,hplalmproject,username)
{
    global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionid}, function(err, daigramversion) 
    {
         
        var project_name = daigramversion[0].project.name;
        var module_name = daigramversion[0].module.name;
        var diagram_name = daigramversion[0].diagram.name;
        var module_version = daigramversion[0].name;
        checkfolderexist(qcs_xsrf_token,lwscookie_token,module_name,diagram_name,module_version,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username);
    });
}

function  checkfolderexist(qcs_xsrf_token,lwscookie_token,module_name,diagram_name,module_version,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username){
    var qcs_xsrf_token_str=qcs_xsrf_token+'';
    var cookiearr =qcs_xsrf_token_str.split(',');
    var qc_cookie=[];
    var subject_parent_id;
    var module_parent_id;
    var daigram_parent_id;
    var moduleversion_parent_id;
    qc_cookie.push(lwscookie_token);
    qc_cookie.push(cookiearr[0]);
    qc_cookie.push(cookiearr[1]);
    qc_cookie.push(cookiearr[2]);
  
    checkfolder(qc_cookie,module_name,diagram_name,module_version,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username);
    
}



function checkfolder(qc_cookie,module_name,diagram_name,module_version,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username)
{
        request.get({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders?query={name['"+module_name+"']}",
        method:"GET",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                          
                }
               
        },
    function(error, hpresponse, body){
                   if(hpresponse.statusCode=='200')
           {
                   var moduledata=JSON.parse(body);   
                   var modulesize = moduledata['TotalResults'];
                 var  parent_id= getparentid(body);
                if(modulesize==1)
                {
                  checkforDaigramFolder(qc_cookie,diagram_name,module_version,parent_id,response,versionid,scenarioIds,url,project_name,module_name,hpalmdomain,hplalmproject,username);
                }
                else
                {
                 var super_module_name='Subject';
                 getSubjectAndCreateModule(qc_cookie,super_module_name,module_name,diagram_name,module_version,parent_id,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username);
                }
            
            }
            else
            {
                    var resp = {
                        code:"300"
                    }
                response.end(JSON.stringify(resp));
            }     
                 
    });
  
}

function checkforDaigramFolder(qc_cookie,diagram_name,module_version,id,response,versionid,scenarioIds,url,project_name,module_name,hpalmdomain,hplalmproject,username)
{
       var super_parent_id=id;
    request.get({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders?query={name['"+diagram_name+"']}",
        method:"GET",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                        
                }
          
      
        },
    function(error, hpresponse, body){
        var moduledata=JSON.parse(body);  
        var modulesize = moduledata['TotalResults'];
         if(modulesize==1){
        var  parent_id= getparentid(body);
        checkforModuleVersionFolder(qc_cookie,module_version,parent_id,response,versionid,scenarioIds,url,project_name,module_name,diagram_name,hpalmdomain,hplalmproject,username);
      }else{
        createNewDaigramFolder(qc_cookie,diagram_name,module_version,super_parent_id,response,versionid,scenarioIds,url,project_name,module_name,hpalmdomain,hplalmproject,username);
      }
    });
}

function checkforModuleVersionFolder(qc_cookie,module_version,parent_id,response,versionid,scenarioIds,url,project_name,module_name,diagram_name,hpalmdomain,hplalmproject,username){
   var responseobj=response;
   var id=parent_id;
   var version="Version"+module_version;
   request.get({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders?query={name['"+version+"'];parent-id['"+parent_id+"']}",
        method:"GET",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                          
                }
         
      
        },
    function(error, hpresponse, body){
            var moduledata=JSON.parse(body);  
            var modulesize = moduledata['TotalResults'];
        if(modulesize==1){
           var folder_id = getparentid(body)
            createstepDesAndCreateTestAndDesignSteps(qc_cookie,folder_id,versionid,scenarioIds,url,project_name,module_name,diagram_name,module_version,responseobj,hpalmdomain,hplalmproject,username);
            //sleep(300);
        }else{
            createNewModuleVersionFolder(qc_cookie,module_version,id,response,versionid,scenarioIds,url,project_name,module_name,diagram_name,hpalmdomain,hplalmproject,username);
        }
       
           
    });
}



function getSubjectAndCreateModule(qc_cookie,super_module_name,module_name,diagram_name,module_version,parent_id,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username)
{
 
    request.get({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders?query={name['"+super_module_name+"']}",
        method:"GET",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                      
                }
      
        },
    function(error, hpresponse, body){
            var moduledata=JSON.parse(body);   
        var id= getparentid(body);
        createNewModule(id,qc_cookie,module_name,diagram_name,module_version,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username);
      
    });
}

function createNewModule(id,qc_cookie,module_name,diagram_name,module_version,response,versionid,scenarioIds,url,project_name,hpalmdomain,hplalmproject,username)
{
            var xmlformat='<Entity Type="test-folder"><Fields><Field Name="parent-id"><Value>'+id+'</Value></Field><Field Name="name"><Value>'+module_name+'</Value></Field></Fields></Entity>';
    request.post({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders",
        method:"POST",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                          
                },
           body:xmlformat
            
        },
    function(error, hpresponse, body){
              var id= getparentNewid(body);
             createNewDaigramFolder(qc_cookie,diagram_name,module_version,id,response,versionid,scenarioIds,url,project_name,module_name,hpalmdomain,hplalmproject,username)
                                         
    });
}

function createNewDaigramFolder(qc_cookie,diagram_name,module_version,id,response,versionid,scenarioIds,url,project_name,module_name,hpalmdomain,hplalmproject,username)
{
   
    var xmlformat='<Entity Type="test-folder"><Fields><Field Name="parent-id"><Value>'+id+'</Value></Field><Field Name="name"><Value>'+diagram_name+'</Value></Field></Fields></Entity>';
    request.post({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders",
        method:"POST",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                          
                },
           body:xmlformat
            
        },
    function(error, hpresponse, body){
       
        var id= getparentNewid(body);
        createNewModuleVersionFolder(qc_cookie,module_version,id,response,versionid,scenarioIds,url,project_name,module_name,diagram_name,hpalmdomain,hplalmproject,username);
                                         
    });
}

function createNewModuleVersionFolder(qc_cookie,module_version,id,response,versionid,scenarioIds,url,project_name,module_name,diagram_name,hpalmdomain,hplalmproject,username)
{
   var module_version ='Version'+module_version;
    var responseobject=response;
    var xmlformat='<Entity Type="test-folder"><Fields><Field Name="parent-id"><Value>'+id+'</Value></Field><Field Name="name"><Value>'+module_version+'</Value></Field></Fields></Entity>';
    request.post({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/test-folders",
        method:"POST",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                          
                },
           body:xmlformat
            
        },
    function(error, hpresponse, body){
        var folder_id = getparentNewid(body);
        createstepDesAndCreateTestAndDesignSteps(qc_cookie,folder_id,versionid,scenarioIds,url,project_name,module_name,diagram_name,module_version,responseobject,hpalmdomain,hplalmproject,username)                               
       
    });
}

function createstepDesAndCreateTestAndDesignSteps(qc_cookie,folder_id,versionid,scenarioIds,url,project_name,module_name,diagram_name,module_version,responseobject,hpalmdomain,hplalmproject,username)
{
    var node_desc_json={};
    var  totalscenarioIds=scenarioIds.length;
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
        
        global.db.driver.execQuery('select sc.scenario_index,sc.path,sc.name,sc.id,CONVERT(mv.diagram_data USING utf8)  diagram_data from scenario_master sc inner join model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in ? and sc.model_version_id=?)',[scenarioIds,versionid],function(err,scmasterdata) {
            if (err) {
                global.errorLog.error(err);
            } else {
               
                  for(var i=0;i<scmasterdata.length;i++)
                  {
                    var selected_Scenario_path=scmasterdata[i].path;
                    var name=scmasterdata[i].name;
                    var id=scmasterdata[i].id;
                    var scenario_value='Scenario'+scmasterdata[i].scenario_index+'_'+id+'_'+name;
                    var scenario_data= scenario_value.replace(/[^A-Z0-9]+/ig, "_");

                    var testlastindex=scenario_data.lastIndexOf('_');
                    var testcasetrim=scenario_data.substring(0, testlastindex);
                    if(testcasetrim.length>100){
                        trimstrlen=testcasetrim.substr(0,85)+"...";
                    }else{
                        trimstrlen=testcasetrim
                    }
                   
                    checkTestcaseexist(qc_cookie,trimstrlen,folder_id,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,responseobject,hpalmdomain,hplalmproject,totalscenarioIds,username);
                        

                  }

                  var resp = {
                    code: "200",
                    msg: totalscenarioIds+"&nbsp;Test Cases are successfully imported to HP ALM under below hierarchy."+"<br/><br/>"+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+module_name+"<br/>"
                    +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+diagram_name+"<br/>"+
                    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Version"+module_version
                    }
                    responseobject.end(JSON.stringify(resp));
                  
            }
            


        });
    });
    
}

function checkTestcaseexist(qc_cookie,scenario_value,folder_id,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds,username)
{
    
    request.get({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/tests?query={name['"+scenario_value+"'];parent-id['"+folder_id+"']}",
        method:"GET",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                      
                }
      
        },
    function(error, hpresponse, body){
       
        var moduledata=JSON.parse(body);   
        var modulesize = moduledata['TotalResults'];
        if(modulesize==1){
           var testcaseparentid = gettestcaseparentid(body);
           var id =getparentid(body);
            deleteTestCaseAndcreatetestcaseAnddesignsteps(qc_cookie,testcaseparentid,id,scenario_value,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds,username);
        }else{
            createtestCaseAndCreateDesignSteps(qc_cookie,folder_id,scenario_value,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds,username);
        }
       
    });

}

function deleteTestCaseAndcreatetestcaseAnddesignsteps(qc_cookie,testcaseparentid,id,scenario_value,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds,username)
{
  
    request.delete({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/tests/"+id+"",
        method:"DELETE",
        headers:{
                    'cookie':qc_cookie,
                    'Accept': 'application/json'
                      
                }
      
        },
    function(error, hpresponse, body){
     
         createtestCaseAndCreateDesignSteps(qc_cookie,testcaseparentid,scenario_value,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds,username)      
      
    });
}


function  createtestCaseAndCreateDesignSteps(qc_cookie,folder_id,scenario_value,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds,username)
{
   
    var xmlformat='<Entity Type="test"><Fields><Field Name="name"><Value>'+scenario_value+'</Value></Field><Field Name="subtype-id"><Value>MANUAL</Value></Field><Field Name="parent-id"><Value>'+folder_id+'</Value></Field><Field Name="owner"><Value>'+username+'</Value></Field><Field Name="status"><Value>Imported</Value></Field></Fields></Entity>'
    request.post({
        url:url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/tests",
        method:"POST",
        headers:{
                    'cookie':qc_cookie,
                    'Content-Type':'application/xml',
                    'Accept': 'application/json'
                          
                },
           body:xmlformat
            
        },
    function(error, hpresponse, body){
        
        var moduledata = JSON.parse(body);
        var testcase_id =getparentNewid(body);
        createDesignSteps(qc_cookie,testcase_id,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds);
    });
}

function  createDesignSteps(qc_cookie,testcase_id,selected_Scenario_path,node_desc_json,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds)
{
    
    var node_desc_map=JSON.parse(JSON.stringify(node_desc_json));
    var path_node_id=selected_Scenario_path.split(',');
    var descarr=[];
   
    for(var i=0;i<path_node_id.length-1;i++)
    {
        var scenrio_node_id=path_node_id[i];
        if (node_desc_map[scenrio_node_id] != undefined)
        {
            var description =node_desc_map[scenrio_node_id];
            descarr.push(description);
        }
    }
    DesignSteps(qc_cookie,testcase_id,descarr,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds);
}

function DesignSteps(qc_cookie,testcase_id,descarr,url,project_name,module_name,diagram_name,module_version,response,hpalmdomain,hplalmproject,totalscenarioIds)
{
    var versionmsg;
    if(module_version.includes('Version')){
        versionmsg =module_version;
    }else{
        versionmsg = "Version"+module_version;
    }

   var description_arr=[];
   var desclength;
 
  if(descarr.length!='0')
  {
    for(var k=0;k<descarr.length;k++)
    {
        var descsubgroup=descarr[k];
        for(var kk=0;kk<descsubgroup.length;kk++)
        {
            description_arr.push(descsubgroup[kk]);
        }
    }
 
   var i=0;

if(description_arr.length!='0')
 { 
    var descarr = description_arr.filter(Boolean);
     desclength=descarr.length;
     for(var k=0;k<descarr.length;k++)
    {
        var expecteddata='';
        i++;
        var finaldesc = convert(descarr[k]);
        if(finaldesc.includes("Verify")){
            if(finaldesc.includes(" is ")) {
                expecteddata =finaldesc.replace(" is ", " should be ");
            }else{
                expecteddata= finaldesc;
            }
        }else{
            expecteddata= "User should able to " +finaldesc;
        }
        postdesignStepstohpalm(qc_cookie,testcase_id,i,finaldesc,expecteddata,url,hpalmdomain,hplalmproject,response,desclength,totalscenarioIds,module_name,diagram_name,versionmsg);
       
    } 
   
    } 
 } else{
    var resp = {
        code: "200",
        msg: totalscenarioIds+"&nbsp;Test Cases are successfully imported to HP ALM under below hierarchy."+"<br/><br/>"+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+module_name+"<br/>"
        +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+diagram_name+"<br/>"+
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+versionmsg
        }
    response.end(JSON.stringify(resp));
 }
} 

function  postdesignStepstohpalm(qc_cookie,testcase_id,i,finaldesc,expecteddata,url,hpalmdomain,hplalmproject,response,desclength,totalscenarioIds,module_name,diagram_name,versionmsg)
{
    
    var json='{"Fields":[{"Name":"expected","values":[{"value":"'+expecteddata+'"}]},{"Name":"description","values":[{"value":"'+finaldesc+'"}]},{"Name":"name","values":[{"value":"step'+i+'"}]},{"Name":"parent-id","values":[{"value":"'+testcase_id+'"}]},{"Name":"step-order","values":[{"value":"'+i+'"}]}],"Type":"design-step"}'
       
    var res = syncrequest('POST', url+"/qcbin/rest/domains/"+hpalmdomain+"/projects/"+hplalmproject+"/design-steps", {
        'headers':{
            'cookie':qc_cookie,
            'Content-Type':'application/json',
            'Accept': 'application/json'
                
        },
        'body':json
    });
  
}
function getparentid(body)
{
    var folderjson=JSON.parse(body);
    var entity =folderjson['entities'];
    var parent_id;
    
    for(var i=0;i<entity.length;i++)
    {
     var fields=entity[i];
     var filedsval=fields['Fields'];
      for(var  k=0;k<filedsval.length;k++)
      {
        var folderfields=filedsval[k];
        var parent= folderfields['Name'];
        if(parent=='id')
        {
            var parent_ids=folderfields['values'][0]
             parent_id=parent_ids['value'];
        }
    
      }
    }
    return parent_id;
}

function getparentNewid(body)
{
    var folderjson=JSON.parse(body);
    var entity =folderjson['Fields'];
    var parent_id;
    
    for(var i=0;i<entity.length;i++)
    {
     var fields=entity[i];
          
        var parent= fields['Name'];
        if(parent=='id')
        {
            var parent_ids=fields['values'][0]
             parent_id=parent_ids['value'];
        }
    
     
    }
    return parent_id;
}

function gettestcaseparentid(body)
{
    var folderjson=JSON.parse(body);
    var entity =folderjson['entities'];
    var parent_id;
    
    for(var i=0;i<entity.length;i++)
    {
     var fields=entity[i];
     var filedsval=fields['Fields'];
      for(var  k=0;k<filedsval.length;k++)
      {
        var folderfields=filedsval[k];
        var parent= folderfields['Name'];
        if(parent=='parent-id')
        {
            var parent_ids=folderfields['values'][0]
             parent_id=parent_ids['value'];
        }
    
      }
    }
    return parent_id;
}


function convert(str)
{
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
  return str;
}

function getAlmDetails(response, data, userData){
    var versionId=data.versionId;
    global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, models) {
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }
        else
        {
            var project_id=models[0].project_id;
            global.appConstants.dbConstants.tableObj.qcdetails.find({project_id:project_id}, function(err, qcdetails) {
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
                        data:qcdetails
                    }
                   response.end(JSON.stringify(resp));
                } 
                  
            });
           
        }
         
    });
}
    
function checkprojectnamesize(response, data, userData)
{
    var userid=data.createdBy;
    var projectdetialsarr=[];
    global.appConstants.dbConstants.tableObj.project.find({createdBy:userid}, function(err, projectdetails) {
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
                data:projectdetails
            }
            response.end(JSON.stringify(resp));
        }
        
    });
}

function getadminProjectdetails(response, data, userData){
    var project_id =data.versionId
    global.appConstants.dbConstants.tableObj.qcdetails.find({project_id:project_id}, function(err, qcdetails) {
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
                data:qcdetails
            }
           response.end(JSON.stringify(resp));
        } 
          
    });
}

function createupdatehpalmdetails(response, data, userData){
    global.appLog.debug(data["projectid"]);
    var projectid =data["projectid"];
    var url=data["url"];
    var domain=data["domain"];
    var project=data["project"];
    global.appConstants.dbConstants.tableObj.qcdetails.find({project_id:projectid}, function(err, projectIdExist) {
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else if(projectIdExist.length==1){
            projectIdExist[0].qc_url=url,
            projectIdExist[0].qc_domain=domain,
            projectIdExist[0].qc_project=project,
            projectIdExist[0].project_id=projectid,
            projectIdExist[0].save(function(err){
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
              
        }else{
            var userProjectData={
                 qc_url:url,
                 qc_domain:domain,
                 qc_project:project,
                 project_id:projectid
            };
            global.appConstants.dbConstants.tableObj.qcdetails.create([userProjectData], function (err, items) {
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
                        data:"2"
                    }
                    response.end(JSON.stringify(resp));
                }
            });
        }
    
    });
}

 function checkpublish(response, data, userData){
     var versionId = data["id"];
    global.appConstants.dbConstants.tableObj.modelVersion.find({id:versionId}, function(err, models) {
        if(err){
            global.errorLog.error(err);
            var resp={
                msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                code:global.errorCodes.errorCode.codes.DB_IO_ERROR
            }
            response.end(JSON.stringify(resp));
        }else{
            var projectData={"status":models[0].status,"tool_type":models[0].project.tst_step_tool_id};
            var resp={
                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                code:"200",
                data:projectData
            }
           response.end(JSON.stringify(resp));
        } 
          
    });

 
}

module.exports.service = {
    validateqc:authenticateHpAlm,
    createHpAlmfolder:createfolderAndValidate,
    getHpALMDetails:getAlmDetails,
    checkprojectsize:checkprojectnamesize,
    getadminprojectdetails:getadminProjectdetails,
    createupdatehpalm:createupdatehpalmdetails,
    checkdaigrampublish:checkpublish
};