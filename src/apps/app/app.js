var revertAndInstall = {};
var te = {"a":"b"};
var revertAndInstallreverting = false;
var installAttempt = 1;
var connected ="x";
var labelObj = {};
var takingSnapshot = false;
var currentSnapshotPos = 1;
var socket;
var assigned = 0;
var successInstalled;
var os_names;
var brname;
var brvrsn;
var mainEditData;
var instanceState = {};
var timeOut = "";
var NodeServerPort = "9000"; // for automated snapshot activities.
var asyncVal=true;
var app_server_url;
//app_server_url = location.origin; //commented because of reverse proxy
if (!app_server_url) {
  //app_server_url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');//commented because of reverse proxy
  app_server_url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':8044': '');
}


$(document).ready(function(){
	$("#nav-help").hover(function(){
		$("#subnav").toggle();
	});
try{
$.mobile.ajaxEnabled = false;

$.mobile.linkBindingEnabled = false;
$.mobile.hashListeningEnabled = false; 
}catch(e){
console.log("JQM is not loaded");
}
/* $.mobile.pushStateEnabled = false;
$.mobile.changePage.defaults.changeHash = false; */
$(".ui-page").live('pageshow',function(){
/* clearTimeout(timeOut); */

});
$(".ui-page").live('pageinit',function(){

});










$("#login").live('pageinit', function() {	








$("#btn_signIn").bind("click",function(){
	console.log($('#sin_usrN').val());
	console.log($('#sin_usrP').val());
	
	if(!validation('empty',$('#sin_usrN').val()))validationError('sin_usrN',"**UserId Can't be empty");
	//else if(!validation('userid',$('#sin_usrN').val()))validationError('sin_usrN',"**Special characters are not allowed");
	else if(!validation('empty',$('#sin_usrP').val()))validationError('sin_usrP',"**Password Can't be empty");
	//else if(!validation('password',$('#sin_usrP').val()))validationError('sin_usrP',"**Special characters other than (!,@,#,$,*,_) are not allowed");
	else{
		 var username=$('#sin_usrN').val();
		 var password=$('#sin_usrP').val();
		 loginUser(username,password);
		}
	});


});


	

	$(".cg_logo").live("mouseover",function(){	
		$(this).attr("src","../images/cg_logo.png");
	});
	$(".cg_logo").live("mouseout",function(){	
		$(this).attr("src","../images/cg_logo_white.png");
	});

});




function loginUser(username,password){
	var data = {fileAdd:"USI",sin_usrN:username,sin_usrP:password};
	sendAJAX(data,app_server_url,successSignIn);
 }

 function loginAuto(fromPath){
	var data = {fileAdd:"USI",fm:fromPath};	
	sendAJAX(data,app_server_url,successSignIn);
 }

function loadit(){
	var fromVal=GetQueryStringParams("fm");
	changePage("pages/splashscreen.html");	
    if(fromVal!=undefined){
		loginAuto(fromVal);
		//loadHomePage();
	}else{
		setTimeout(function(){
			changePage("login.html");
		},1000);
	}	
}

function loadHomePage(){
	changePage("splashscreen.html");
	setTimeout(function(){
		window.location.href = app_server_url+"/home.html"; 
	},1000);
}

function loadlogin(){	
	changePage("pages/login.html");
}	
function changePage(page_id,forceReload){
console.log("changepage");
var reload = false;
if(forceReload == true){
reload = forceReload;
}
	$.mobile.changePage(page_id, {transition: "fade", changeHash: false,reloadPage:reload});
}
var session = {};

	
function sendAJAX(dataC,url,cb) {
	var serviceCode=dataC.fileAdd;
	if(dataC.fileAdd==="EXS" || dataC.fileAdd==="TXS" || dataC.fileAdd==="TCA" || dataC.fileAdd==="DMV" || dataC.fileAdd==="DD" || dataC.fileAdd==="DM" || dataC.fileAdd==="DP" || dataC.fileAdd==="IWF" || dataC.fileAdd==="TDD"
		|| dataC.fileAdd==="MTD"){
        asyncVal=false;
	}
if(session.userDetails != undefined){
dataC.userId=session.userDetails.id;
dataC.apiKey=session.userDetails.apiKey;
}else{
dataC.userId=dataC.sin_usrN;
}
   $.ajax({
	  type: "POST",
	  url: url,
	  data: dataC,
	  async: asyncVal,
	  success: function(data){
			var response_code;
			var response_msg;
			var args;
			var header;
			try{
				response_code=data["code"];
				response_msg=data["msg"];
				args=data["args"];
			}catch(e){
				console.log(e);
				response_code='200';
				response_msg='Downloaded';
			}
			console.log("success"+response_code);
			console.log("msg"+response_msg);  
			switch(response_code){
				case "200":	 try{

								cb(data);
							}catch(e){
					          dailogmsg('Error: Cannot fetch response data.');
								console.log(e);
								$(".loadingOverall").hide();
							}
							console.log("Uploading DONE!!!!");
							break;
				case "300":cb(data);
							console.log("DONE!!!!");
							break;
				case "001":   dailogmsg("emulator is busy, Plz try again")
							break;
				case "002": cb(data);
							break;
				case "003": cb(data);		  
							break;
				case "402": $("#loading").hide();
				$("#progresstxt").empty();
                    dailogmsg(response_msg);
							break;
				case "403":$("#loading").hide();
			  // alert(data["msg"]);
							cb(data,"0");
							break;
				case 1003:$("#loading").hide();
							  $(".loadingOverall").hide();
							  if(serviceCode=='SCOC'){
								$("#modal-content-version").css("display","none");
								$('.ui-igtrialwatermark').removeClass('bgopacity');
							  }
							if(labelObj[response_msg]!=null){
                               if(args!=undefined){
								dailogmsg(labelObj[response_msg]+" "+args);
							   }else{
								dailogmsg(labelObj[response_msg]);
							   }
                                
							}else{
								dailogmsg(response_msg);
							}			  
			  			
			  break;
			  case 1004:$("#loading").hide();
			  $(".loadingOverall").hide();
                  dailogmsg(response_msg);
			  session = {};
			 // changePage("login.html");
			 window.location.href = app_server_url;
							break;
				default:$("#loading").hide();
						$("#progresstxt").text("Problem Occured...Please check configuration or connectivity");
					dailogmsg("Problem Occurred");
				$(".loadingOverall").hide();
							break;
	  
			}
		},
	  dataType: "json",
	  error: function(x, t, m) {
			if(m==="Connection Timed Out") {
			$("#loading").hide();
			$("#progresstxt").text("Server is non responsive. Taking too much time...");
			$(".loadingOverall").hide();
				dailogmsg("Server is non responsive")
				 console.log("X====="+JSON.stringify(x));
				console.log("t====="+t);
				console.log("m====="+m);
			} else {
				 console.log("X====="+JSON.stringify(x));
				 $("#loading").hide();
				 $(".loadingOverall").hide();
				console.log("t====="+t);
				console.log("m====="+m);
				dailogmsg(m);

			}
		}
	});

}

function responseBack(data,cb){

   var response_code;
	 var response_msg;
 try{
 console.log("recieved response");
 console.log(data);
 asdf = data;
 data = JSON.parse(data);
	 response_code=data.code;
	 response_msg=data.msg;
	}catch(e){
	console.log(e);
	 response_code='200';
	 response_msg='Downloaded';
	}
  console.log("success"+response_code);
  console.log("msg"+response_msg);
  
 

  
  switch(response_code){
  case "200":
  try{
 cb(data);
 }catch(e){
 console.log(e);
 dailogmsg('Done');

 }
  console.log("Uploading DONE!!!!");
				break;
   case "300":cb(data);
  console.log("DONE!!!!");
				break;
   case "001": dailogmsg("emulator is busy, Plz try again");
				break;
  case "002": cb(data);

				break;
  case "003": cb(data);
  
				break;
	case "403":$("#loading").hide();
	dailogmsg(data["msg"]);
      cb(data,"0");
				break;
default:$("#loading").hide();dailogmsg("Problem Occurred");$(".loadingOverall").hide();
		break;
  
   }
 }
 var errorIds = [];
function validationError(id,msg){
if(errorIds.indexOf(id) == -1){
errorIds.push(id);

	$( "#"+id+"_error" ).fadeIn();
	/* $( "#"+id ).parent().effect( "shake",callback ); */
	callback();
    $("#"+id).parent().addClass('red');
    $("#"+id+"_error" ).css('font-size',"12px");
    $( "#"+id+"_error" ).html(msg);

	function callback() {
    
	  setTimeout(function() {
        $( "#"+id+"_error" ).fadeOut();
		  $("#"+id).parent().removeClass('red');
		 errorIds.splice(errorIds.indexOf(id),1);
      }, 2000 );
    }
}
}


				 errorImg = function(_this){
		console.log(_this);
        $(_this).parent().parent().remove();
}	


		/* } */
		function connectedSuccessFully(data){
		 $(".loadingOverall").hide();
		 console.log(data);
		 console.log(data.code);
		 console.log(osType);

		if(data["code"] == "200"){
			if(osType == "Windows"){
		window.open("http://"+ip+":9080/");
		}else{
		window.open("http://"+ip+":6080/vnc_cust.html");
		}
		}else{
		dailogmsg("ERROR: "+data["msg"]+"\n Not able to connect to host server");
		}
	

		}
	

var defaultDate = "";
var getCurrDate = function(format){
var today = new Date();

if(defaultDate == ""){

  }else{
 today = new Date(defaultDate);
  }

   var dd = today.getDate(); 
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
	
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
	if(minutes<10){
        minutes='0'+minutes;
    }
	if(hour<10){
        hour='0'+hour;
    }
	if(seconds<10){
        seconds='0'+seconds;
    }
	var today ='';
	switch(format){
	case 'yyyy-mm' : today = yyyy+'-'+mm;break;
	case 'mm' : today = mm;break;
	case 'days' : today = new Date(yyyy, mm, 0).getDate();break;
	case 'today' : today = dd;break;
	case 'datetime' : today = yyyy+'-'+mm+'-'+dd+' '+hour+':'+minutes+':'+seconds;break;
	case 'datetimeName' : today = yyyy+'_'+mm+'_'+dd+'_'+hour+'_'+minutes+'_'+seconds;break;
	case 'datetimeM' : today = yyyy+'-'+mm+'-'+dd+' '+hour+':'+minutes;break;
	case 'datetimeTZ' : today = yyyy+'-'+mm+'-'+dd+'T'+hour+':'+minutes+':'+seconds;break;
	case 'hour' : today = hour;break;
	case 'minute' : today = minutes;break;
	default:today = yyyy+'-'+mm+'-'+dd;
	
	break;
	}
   
return today;

}

function sendHttpPost(dataC){
    if(session.userDetails != undefined){
		dataC.userId=session.userDetails.id;
		dataC.apiKey=session.userDetails.apiKey;		
    }else{
        dataC.userId=dataC.sin_usrN;
    }
}


$.fn.getConvertedDateFormat = function(){
var date = $(this).val();
var x = date.replace('T',' ');
return x;
};

function dailogmsg(msg){
    $('<div id="createalertmodal"  style="display: block;"  align="center">'+
    '<div id="header-modal" align="left">'+
        '<span>'+labelObj.dialogHeader+'</span>'+
    '</div>'+
        '<div id="body-modal" class="popupbodytxt">'+               
                       '<div>'+msg+'</div>'  
                       +
                       '<div id="footer-modal"><input id="sign-modal-ok" type="button" value="'+labelObj.buttonOk+'"></div>'+       

        '</div>'+
        '</div>'+                 
'</div>').appendTo('#popupdata');
$('#modal-bg').addClass('bgopacity'); 

}

function GetQueryStringParams(sParam)
{
	try{
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++)
		{
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam)
			{
				return sParameterName[1];
			}
		}
	}catch(err){console.log(err+": Error while reading request parameter: "+sParam)}
	return;
}


function successSignIn(data){
	console.log(data.data.userID);
	if(data.data.authentication){
		session.userDetails = new userDetails();
		session.userDetails.id = data.data.userID;
		session.userDetails.name = data.data.userName;
		session.userDetails.role = data.data.role_id;
		session.userDetails.roleName = data.data.roleName;
		session.userDetails.emailId = data.data.emailId;
		session.userDetails.baccount_id = data.data.bActIds;
		session.userDetails.apiKey = data.data.apiKey;
		session.userDetails.fm = data.data.fm;
		if(data.data.roleName ==='Super Admin' || data.data.roleName ==='Admin') {
			session.userDetails.adminVisible = 'y';
		}else{
			session.userDetails.adminVisible = 'n';
		}
		localStorage.setItem("session",JSON.stringify(session.userDetails));
		loadHomePage();
	}else{			
		validationError('popupLogin',"**Wrong user ID or Password");
		console.log("**Wrong user ID Password");
	}
}


$(document).on("click","#sign-modal-ok",function(){
	var divToRemove=$(document).find("#createalertmodal");
	divToRemove.html('');
	divToRemove.remove();
	$('#modal-bg').removeClass('bgopacity');
});