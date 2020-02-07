try{
var dbProperties = require("../properties/db.properties.js");
var appConstants = require("../constants/constants.js");
var hashutil = require("../services/hashUtil.js");
global.orm = require("orm");
var decryptxt = hashutil.decrypttxt(dbProperties.password);
function create(cb){
try{
global.orm.connect("mysql://"+dbProperties.userName+":"+decryptxt+"@"+dbProperties.ip+"/"+dbProperties.schema+"?pool=true", function (err, db) {
global.db = db;
 db.settings.set('instance.cache', false);
  if (err) throw err;
	
	appConstants.dbConstants.tableObj.register = db.define("register", {
        id   : Number,
        userID   : String,
        userPass   : String,
        userEmail   : String,
        language   : String,
		userName: String,
		active: Number,
		lastLogin: Date,
		WPass: Number,
		baccount_id : String,
		isDemoUser: Boolean,
		activeStartDate: {type:'date',time:true},
		activeEndDate: {type:'date',time:true},
		hoursOfUsage:Number,
        createdBy: String
    },{
    autoFetch : true,
	autoFetchLimit : 2
});
	appConstants.dbConstants.tableObj.auditLog = db.define("audit_log", {
        id   : Number,
        userID   : String,
        service_cd   : String,
        service_desc   : String,
        status_cd   : Number,
		status_desc   : String,
        access_time   : {type:'date',time:true},
        client_IP   : String
    });
	appConstants.dbConstants.tableObj.roleList = db.define("role", {
        id   : Number,
        name   : String,
        description   : String
    });
	appConstants.dbConstants.tableObj.status = db.define("status_master", {
        id   : Number,
        name   : String,
        description   : String
    });
	appConstants.dbConstants.tableObj.buss_account = db.define("bussiness_account_master", {
        id   : Number,
        name   : String,
        description   : String,
        location   : String,
        apiKey   : String,
        active: Number
	});
	appConstants.dbConstants.tableObj.project = db.define("project", {
        id   : Number,
        name   : String,
        description   : String,
        active: Number,
		createdBy: String,
		templateCols :Object,
		tst_step_tool_id: Number,
		tst_step_tool_typ: String
	});
	appConstants.dbConstants.tableObj.module = db.define("module", {
        id   : Number,
        name   : String,
        description   : String,
        active: Number
	});
	appConstants.dbConstants.tableObj.diagram = db.define("diagram", {
        id   : Number,
        name   : String,
        description   : String,
        active: Number
	},{
    autoFetch : true
});
	appConstants.dbConstants.tableObj.modelVersion = db.define("model_version", {
        id   : Number,
        name   : String,
        description   : String,
        active: Number,
		status:Number,
		diagram_data:Object,
		jira_issue_ids:Object
	},{
    autoFetch : true
});
appConstants.dbConstants.tableObj.scenarioMaster = db.define("scenario_master", {
        id   : Number,
        name   : String,
        criticality   : String,
        defects   : String,
        severity   : String,
        risk_exposer   : String,
        testing_effort   : String,
        active: Number,
		status:Number,
	    scenario_index : Number,
	    frequency: Number,
		exception: Number,
	    type: Number,
		primary_flow: Number,
		loop_path: Number,
		risk: Number,
		pre_condition: String,
        post_condition: String,
	    path: String
	},{
    autoFetch : true
});

    appConstants.dbConstants.tableObj.requirement = db.define("requirement", {
        id   : Number,
        name   : String,
		description   : String,
		issue_id : String,
		module_id: Number
    },{
        autoFetch : true
    });
	
	
	appConstants.dbConstants.tableObj.testCondition = db.define("test_step_master", {
        id   : Number,
        test_step_number   : Number,
        action   : String,
        target_type   : String,
        target   : String,
        tst_step_data   : String,
        description   : String,
		node_id: String,
		tst_step_args: Object,
		tool_id: Number,
		test_step_type: String
	},{
    autoFetch : true
});


appConstants.dbConstants.tableObj.testData = db.define("test_data_master", {
        id   : Number,
        step_data   : String,
        test_step_id   : Number
	},{
    autoFetch : true
});

appConstants.dbConstants.tableObj.userProjects = db.define("user_projects", {
    id   : Number,
    user_id   : Number,
    project_id   : Number
},{
    autoFetch : true
});

appConstants.dbConstants.tableObj.qcdetails = db.define("project_qc_details", {
	id   : Number,
	qc_username   : String,
	qc_password   : String,
	qc_url: String,
	qc_domain: String,
	qc_project: String,
	 project_id: Number
});

appConstants.dbConstants.tableObj.modelComments= db.define("model_comments", {
	id   : Number,
	comment_txt   : String,	
	user_id: String,
	parent_id: Number,	
	created_date: Date
});	

appConstants.dbConstants.tableObj.tooldetails= db.define("tool_details", {
	id   : Number,
	tool_name  : String,	
	config_dtl: Object,
	project_id: Number
});	

appConstants.dbConstants.tableObj.model_requirement = db.define("model_requirement",{
  id : Number,
  model_id : Number,
  requirement_id : Number  
});
appConstants.dbConstants.tableObj.tool= db.define("tool", {
	id   : Number,
	name  : String,	
	description: String
});

appConstants.dbConstants.tableObj.openTestKeywords=db.define("opentest_keyword", {
	id :Number,
	keyword_name :String,
	keyword_action:String,
	keyword_description:String,
	key_args:Object,
	keyword_type:String
	}); 
	
	appConstants.dbConstants.tableObj.register.hasOne("role", appConstants.dbConstants.tableObj.roleList);
	appConstants.dbConstants.tableObj.register.hasOne("status", appConstants.dbConstants.tableObj.status);
    appConstants.dbConstants.tableObj.register.hasOne("baccount", appConstants.dbConstants.tableObj.buss_account);
	appConstants.dbConstants.tableObj.project.hasOne("bussiness_account_master", appConstants.dbConstants.tableObj.buss_account);
	appConstants.dbConstants.tableObj.module.hasOne("project", appConstants.dbConstants.tableObj.project);
	appConstants.dbConstants.tableObj.diagram.hasOne("module", appConstants.dbConstants.tableObj.module);
	//appConstants.dbConstants.tableObj.modelVersion.hasOne("bussiness_account_master", appConstants.dbConstants.tableObj.buss_account);
	appConstants.dbConstants.tableObj.modelVersion.hasOne("project", appConstants.dbConstants.tableObj.project);
	appConstants.dbConstants.tableObj.modelVersion.hasOne("module", appConstants.dbConstants.tableObj.module);
	appConstants.dbConstants.tableObj.modelVersion.hasOne("diagram", appConstants.dbConstants.tableObj.diagram);
	appConstants.dbConstants.tableObj.modelVersion.hasOne("user", appConstants.dbConstants.tableObj.register);
	appConstants.dbConstants.tableObj.scenarioMaster.hasOne("model_version", appConstants.dbConstants.tableObj.modelVersion);
    appConstants.dbConstants.tableObj.requirement.hasOne("module", appConstants.dbConstants.tableObj.module);
    appConstants.dbConstants.tableObj.scenarioMaster.hasMany('requirements', appConstants.dbConstants.tableObj.requirement);	
	appConstants.dbConstants.tableObj.testCondition.hasOne("version", appConstants.dbConstants.tableObj.modelVersion);
    appConstants.dbConstants.tableObj.userProjects.hasOne("user", appConstants.dbConstants.tableObj.register,{ reverse: 'projects' });
	appConstants.dbConstants.tableObj.userProjects.hasOne("project", appConstants.dbConstants.tableObj.project);
	appConstants.dbConstants.tableObj.qcdetails.hasOne("project", appConstants.dbConstants.tableObj.project);
	appConstants.dbConstants.tableObj.modelComments.hasOne("model_version", appConstants.dbConstants.tableObj.modelVersion);
	appConstants.dbConstants.tableObj.modelComments.hasOne("parent", appConstants.dbConstants.tableObj.modelComments,{ reverse: 'replies' });
	appConstants.dbConstants.tableObj.project.hasOne("tst_step_tool", appConstants.dbConstants.tableObj.tool);
	
	/* 	appConstants.dbConstants.tableObj.testCondition.hasOne("project", appConstants.dbConstants.tableObj.project);
	appConstants.dbConstants.tableObj.testCondition.hasOne("module", appConstants.dbConstants.tableObj.module);
	appConstants.dbConstants.tableObj.testCondition.hasOne("diagram", appConstants.dbConstants.tableObj.diagram);
	appConstants.dbConstants.tableObj.testData.hasOne("version", appConstants.dbConstants.tableObj.modelVersion);
	appConstants.dbConstants.tableObj.testData.hasOne("project", appConstants.dbConstants.tableObj.project);
	appConstants.dbConstants.tableObj.testData.hasOne("module", appConstants.dbConstants.tableObj.module);
	appConstants.dbConstants.tableObj.testData.hasOne("diagram", appConstants.dbConstants.tableObj.diagram); */
	

		db.sync(function(err) { 
        if (err){
		throw err;
		}else{
		//insertMetaData(cb);
		cb();
		}
		});
		db = undefined;

});
}catch(e){
	global.appLog.error(e);
}


}
function insertMetaData(cb){
var perc = 0;

try{
	perc += 20;
	appConstants.dbConstants.tableObj.buss_account.create([{ id: 1, name: "R&I", description: "R&I", location: "location", apiKey: "8fe65a3c-98dc-4788-be10-59729bfa1e1e",active:1 },{ id: 2, name: "GIS", description: "GIS", location: "location", apiKey: "8fe65a3c-98dc-4788-be10-59729bfa1e1e",active:1 }], function(err) {
		if(err){
			global.appLog.error("[SYS CHECK]:Done");
		}else{
			global.appLog.debug("Configuring..... "+(perc)+"%");
		}
	});
}catch(e){
global.errorLog.error(e);
}

try{
	perc += 20;
	appConstants.dbConstants.tableObj.roleList.create([{ id: 1, name: "Super Admin", description: "Super Admin"},{ id: 2, name: "Admin", description: "Admin"},{ id: 3, name: "User", description: "End User"}], function(err) {
		if(err){
			global.appLog.error("[SYS CHECK]:Done");
		}else{
			global.appLog.debug("Configuring..... "+(perc)+"%");
		}
	});
}catch(e){
global.errorLog.error(e);
}

try{
	perc += 10;
	appConstants.dbConstants.tableObj.register.create({ id: 1, userID: "rgupta27", userPass: "37135eba3851", userEmail: "rahul.o.gupta@capgemini.com", language: "en",userName:"Rahul Gupta",active:1,WPass:0,role_id:1,status_id:1,baccount_id:1,isDemoUser:0}, function(err) {
		if(err){
			global.appLog.error("[SYS CHECK]:Done");
		}else{
			global.appLog.debug("Configuring..... "+(perc)+"%");
		}
	});
}catch(e){
global.errorLog.error(e);
}


try{
	perc += 20;
	appConstants.dbConstants.tableObj.status.create([{ id: 1, name: "Active", description: "Active"},{ id: 2, name: "Account Locked", description: "Account Locked !!! Contact your admin"},{ id: 3, name: "Pending", description: "Status is pending"},{ id: 4, name: "Running", description: "Running"},{ id: 5, name: "Terminated", description: "Terminated"},{ id: 6, name: "Draft Version", description: "Draft Version"},{ id: 7, name: "Published", description: "Published"}], function(err) {
		if(err){
			global.appLog.error("[SYS CHECK]:Done");
		}else{
			global.appLog.debug("Configuring..... "+(perc)+"%");
		}
	});
}catch(e){
global.errorLog.error(e);
}


global.appLog.debug(perc);
cb();

}


		module.exports.table = {
		create:create
};
}catch(e){

	global.appLog.error(e);
}
