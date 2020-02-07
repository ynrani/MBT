var excel = require('exceljs');
var streamBuffers = require('stream-buffers');
var HashMap = require('hashmap');
var ArrayList = require('arraylist');
var Set = require('simple-hashset');
//var mapdata = {};

function createExceldata(response, data, userData) {
    var mapdata = {};
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet1');

    var selectedVersion = data.versionId;
    var seletednodeIds = data.nodeIds;
    var selected_scenarios_Ids = data.indexId;
    var map = new HashMap();

    global.db.driver.execQuery('select ts.action,ts.target,ts.target_type,ts.tst_step_data,ts.node_id from test_step_master ts where  ts.version_id=? and ts.action!=\'Select Action\' order by ts.node_id,ts.test_step_number', [selectedVersion], function (err, testdata) {
        if (err) {
            global.errorLog.error(err);
        }
        else {
            var arr = [];
            var map_description = {};
            var chk = 0;
            for (var i = 0; i < testdata.length; i++) {
                var nodeid = testdata[i].node_id;
                var list = new ArrayList();
                if (i == 0) {
                    for (var j = i; j < testdata.length; j++) {
                        if (nodeid == testdata[j].node_id) {
                            var test_data = testdata[j].action + "$" + testdata[j].target + "$" + testdata[j].target_type + "$" + testdata[j].tst_step_data;
                            list.add(test_data);
                        }
                    }
                    arr.push(nodeid);
                    mapdata[nodeid] = list;
                } else {

                    for (var arrchk = chk; arrchk < arr.length; arrchk++) {
                        if (nodeid != arr[arrchk]) {
                            for (var j = i; j < testdata.length; j++) {
                                if (nodeid == testdata[j].node_id) {
                                    var test_data1 = testdata[j].action + "$" + testdata[j].target + "$" + testdata[j].target_type + "$" + testdata[j].tst_step_data;
                                    list.add(test_data1);
                                }
                            }
                            arr.push(nodeid);
                            mapdata[nodeid] = list;
                            chk++;
                        }
                    }

                }


            }

        }

        global.db.driver.execQuery('select sc.scenario_index,sc.path,sc.name ,CONVERT(mv.diagram_data USING utf8)  diagram_data from scenario_master sc inner join model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in ? and sc.model_version_id=?)', [selected_scenarios_Ids, selectedVersion], function (err, scmasterdata) {
            if (err) {
                global.errorLog.error(err);
            }
            else {
                var scmaster_data = scmasterdata;
                for (var sc = 0; sc < scmaster_data.length; sc++) {
                    var scenaio_index = scmaster_data[sc].scenario_index;
                    var scenario_daigram = JSON.parse(scmaster_data[sc].diagram_data);
                    var scnario_path = scmaster_data[sc].path.split(',');


                    for (var scpath = 0; scpath < scnario_path.length; scpath++) {
                        var path_nodeids = scnario_path[scpath];
                        for (var dai = 0; dai < scenario_daigram.cells.length; dai++) {

                            var daigram_node = scenario_daigram.cells[dai].id;
                            if (daigram_node == path_nodeids) {
                                var descriptionarr = mapdata[path_nodeids];
                                if (descriptionarr != undefined) {
                                    if ((scenario_daigram.cells[dai]).hasOwnProperty("labels")) {
                                        var componentNamelabel = '';
                                        if (scenario_daigram.cells[dai].labels != undefined && scenario_daigram.cells[dai].labels.length > 0) {
                                            componentNamelabel = scenario_daigram.cells[dai].labels[0].attrs.text.text;
                                        }
                                        map_description[componentNamelabel] = descriptionarr;
                                    } else if (scenario_daigram.cells[dai].type == 'app.RectangularModel' || scenario_daigram.cells[dai].type == 'bpmn.Gateway' || scenario_daigram.cells[dai].type == 'bpmn.Event'
                                        || scenario_daigram.cells[dai].type == 'bpmn.DataObject' || scenario_daigram.cells[dai].type == 'bpmn.Conversation' || scenario_daigram.cells[dai].type == 'bpmn.Message'
                                        || scenario_daigram.cells[dai].type == 'bpmn.Group'){
                                        var componentName = scenario_daigram.cells[dai].attrs['.label'].text;
                                        map_description[componentName] = descriptionarr;
                                    } else if(scenario_daigram.cells[dai].type=='bpmn.Choreography' || scenario_daigram.cells[dai].type =='bpmn.Activity' || scenario_daigram.cells[dai].type == 'bpmn.Annotation'){
                                        var componentName = scenario_daigram.cells[dai].attrs['.content'].html;
                                        map_description[componentName] = descriptionarr;
                                    } else {
                                        var componentName = scenario_daigram.cells[dai].attrs.text.text;
                                        map_description[componentName] = descriptionarr;
                                    }
                                }
                            }

                        }

                    }


                }
            }
            worksheet.columns = [
                { header: 'Component Name', key: 'ComponentName', width: 32 },
                { header: 'Action', key: 'Action', width: 32 },
                { header: 'Target', key: 'Target', width: 32 },
                { header: 'Target Type', key: 'TargetType', width: 32 },
                { header: 'Arguments', key: 'Arguments', width: 32 }
            ];

            for (var i in map_description) {
                var componet_name = i.replace(/[^A-Z0-9]+/ig, "_");
                var desctiptionarr = map_description[i];
                for (var k = 0; k < desctiptionarr.length; k++) {
                    var targerdes = desctiptionarr[k].split("$");
                    worksheet.addRow({
                        ComponentName: componet_name,
                        Action: targerdes[0],
                        Target: targerdes[1],
                        TargetType: targerdes[2],
                        Arguments: targerdes[3]
                    });

                }
            }
            var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
            workbook.xlsx.write(myWritableStreamBuffer).then(function () {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: myWritableStreamBuffer.getContents()
                }
                response.end(JSON.stringify(resp));

            });

        });


    });

}

function createTestSuite(response, data, userData) {

    var version_id = data.n;
    var selected_index = data.indexId;
    var scenariotestsuite = [];
    var mapdata = {};

    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet1');
    worksheet.columns = [
        { header: 'Test Case Name', key: 'TestCaseName', width: 17 },
        { header: 'Component Name', key: 'ComponentName', width: 17 }
    ];
    global.db.driver.execQuery('select ts.action,ts.target,ts.target_type,ts.tst_step_data,ts.node_id from test_step_master ts where  ts.version_id=? order by ts.node_id ', [version_id], function (err, testdata) {
        if (err) {
            global.errorLog.error(err);
        }
        else {
            var arr = [];
            var map_description = {};
            var chk = 0;
            for (var i = 0; i < testdata.length; i++) {
                var nodeid = testdata[i].node_id;
                var list = new ArrayList();
                if (i == 0) {
                    for (var j = i; j < testdata.length; j++) {
                        if (nodeid == testdata[j].node_id) {
                            var test_data = testdata[j].action + "$" + testdata[j].target + "$" + testdata[j].target_type + "$" + testdata[j].tst_step_data;
                            list.add(test_data);
                        }
                    }
                    arr.push(nodeid);
                    mapdata[nodeid] = list;
                } else {

                    for (var arrchk = chk; arrchk < arr.length; arrchk++) {
                        if (nodeid != arr[arrchk]) {
                            for (var j = i; j < testdata.length; j++) {
                                if (nodeid == testdata[j].node_id) {
                                    var test_data1 = testdata[j].action + "$" + testdata[j].target + "$" + testdata[j].target_type + "$" + testdata[j].tst_step_data;
                                    list.add(test_data1);
                                }
                            }
                            arr.push(nodeid);
                            mapdata[nodeid] = list;
                            chk++;
                        }
                    }

                }


            }

        }

 
     global.db.driver.execQuery('select sc.id,sc.scenario_index,sc.path,sc.name ,CONVERT(mv.diagram_data USING utf8)  diagram_data from scenario_master sc inner join model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in ? and sc.model_version_id=?)', [selected_index, version_id], function (err, scmasterdata) {
        if (err) {
            global.errorLog.error(err);
        }
        else {

            for (var k = 0; k < scmasterdata.length; k++) {
                var scenario_path = scmasterdata[k].path.split(",");
                var scenario_daigram = JSON.parse(scmasterdata[k].diagram_data);
                for (var i = 0; i < scenario_path.length; i++) {
                    var node_id = scenario_path[i];

                    for (var dcount = 0; dcount < scenario_daigram.cells.length; dcount++) {
                        /* if(scenario_daigram.cells[dcount].type != 'app.Link'){*/
                        var daigram_node = scenario_daigram.cells[dcount].id;
                        if (daigram_node == node_id) {
                            var descriptionarr = mapdata[node_id];
                            if (descriptionarr != undefined) {
                                if (scenario_daigram.cells[dcount].hasOwnProperty("labels")) {
                                    var componentName = '';
                                    if (scenario_daigram.cells[dcount].labels != undefined && scenario_daigram.cells[dcount].labels.length > 0) {
                                        componentName = scenario_daigram.cells[dcount].labels[0].attrs.text.text;
                                    }
                                    var testcasename = "Scenario" + scmasterdata[k].scenario_index + "_" + scmasterdata[k].id + "_" + scmasterdata[k].name;
                                    scenariotestsuite.push(testcasename + "$@#" + componentName);
                                } else if (scenario_daigram.cells[dcount].type == 'app.RectangularModel' || scenario_daigram.cells[dcount].type == 'bpmn.Gateway' || scenario_daigram.cells[dcount].type == 'bpmn.Event'
                                    || scenario_daigram.cells[dcount].type == 'bpmn.DataObject' || scenario_daigram.cells[dcount].type == 'bpmn.Conversation' || scenario_daigram.cells[dcount].type == 'bpmn.Message'
                                    || scenario_daigram.cells[dcount].type == 'bpmn.Group' ) {
                                    var componentName = scenario_daigram.cells[dcount].attrs['.label'].text;
                                    var testcasename = "Scenario" + scmasterdata[k].scenario_index + "_" + scmasterdata[k].id + "_" + scmasterdata[k].name;
                                    scenariotestsuite.push(testcasename + "$@#" + componentName);
                                } else if (scenario_daigram.cells[dcount].type == 'fsa.State') {
                                    var componentName = 'Exception';
                                    var testcasename = "Scenario" + scmasterdata[k].scenario_index + "_" + scmasterdata[k].id + "_" + scmasterdata[k].name;
                                    scenariotestsuite.push(testcasename + "$@#" + componentName);
                                } else if(scenario_daigram.cells[dcount].type=='bpmn.Choreography' || scenario_daigram.cells[dcount].type=='bpmn.Activity' || scenario_daigram.cells[dcount].type == 'bpmn.Annotation'){
                                    var componentName = scenario_daigram.cells[dcount].attrs['.content'].html;
                                    var testcasename = "Scenario" + scmasterdata[k].scenario_index + "_" + scmasterdata[k].id + "_" + scmasterdata[k].name;
                                    scenariotestsuite.push(testcasename + "$@#" + componentName);
                                }else {
                                    var componentName = scenario_daigram.cells[dcount].attrs.text.text;
                                    var testcasename = "Scenario" + scmasterdata[k].scenario_index + "_" + scmasterdata[k].id + "_" + scmasterdata[k].name;
                                    scenariotestsuite.push(testcasename + "$@#" + componentName);
                                }
                            }
                        }

                        /*}*/
                    }
                }


            }
        }
        if (scenariotestsuite != undefined) {
            for (var i = 0; i < scenariotestsuite.length; i++) {
                var testsuite = scenariotestsuite[i].split("$@#");
                testcasename = testsuite[0].replace(/[^A-Z0-9]+/ig, "_")
                testlastindex = testcasename.lastIndexOf('_');
                testcasetrim = testcasename.substring(0, testlastindex);
                if (testcasetrim.length > 100) {
                    trimstrlen = testcasetrim.substr(0, 85) + "...";
                } else {
                    trimstrlen = testcasetrim
                }
                componentname = testsuite[1].replace(/[^A-Z0-9]+/ig, "_")
                worksheet.addRow({
                    TestCaseName: trimstrlen,
                    ComponentName: componentname
                });
            }
           var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
            workbook.xlsx.write(myWritableStreamBuffer).then(function () {
                var resp = {
                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                    code: "200",
                    data: myWritableStreamBuffer.getContents()
                }
                response.end(JSON.stringify(resp));

            }); 

        }
        else {
            var resp = {
                msg: global.errorDescs.errorDesc.desc.Test_NO_EXIST,
                code: global.errorCodes.errorCode.codes.RESPONSE_FAILURE
            }
            response.end(JSON.stringify(resp));
        }
      
    }); 
    

 });

}


function createTestDD(response, data, userData) {
    var versionId = data.n;
    var selected_index = data.indexId;
    var workbook = new excel.Workbook();

    global.appConstants.dbConstants.tableObj.modelVersion.find({ id: versionId }, function (err, daigramversion) {
        var nodidcomponentMap = {}
        for (j = 0; j < daigramversion.length; j++) {
            var diagram = daigramversion[j].diagram_data;
            for (k = 0; k < diagram.cells.length; k++) {
                if (diagram.cells[k].type != 'app.Link') {
                    var att = diagram.cells[k].attrs;
                    if (diagram.cells[k].type == 'app.RectangularModel' || diagram.cells[k].type == 'bpmn.Gateway' || diagram.cells[k].type == 'bpmn.Event'
                    || diagram.cells[k].type == 'bpmn.DataObject' || diagram.cells[k].type == 'bpmn.Conversation' || diagram.cells[k].type == 'bpmn.Message'
                    || diagram.cells[k].type == 'bpmn.Group') {
                        nodidcomponentMap[diagram.cells[k].id] = att['.label'].text;
                    }else if(diagram.cells[k].type=='bpmn.Choreography' || diagram.cells[k].type=='bpmn.Activity' || diagram.cells[k].type == 'bpmn.Annotation'){
                        nodidcomponentMap[diagram.cells[k].id]=att['.content'].html;
                    }else {
                        nodidcomponentMap[diagram.cells[k].id] = att.text.text;
                    }
                }
            }

        }

        global.db.driver.execQuery('select ts.node_id, ts.target, td.step_data from test_step_master ts inner join test_data_master td on(ts.id=td.test_step_id and ts.version_id=?)', [versionId], function (err, models) {
            var target_step_data = {};
            var node_target_step_map = {};
            var selected_map = {};
            var startstepdata = 1;
            for (var l = 0; l < models.length; l++) {
                var target = models[l].target;
                var stepdata = models[l].step_data;
                var node_id = models[l].node_id;
                targetmap(node_id, target, stepdata);
            }
            function targetmap(nodeid, target, stepdata) {
                put(nodeid, target, stepdata);
            }

            function put(nodekey, target, value) {
                var targetjson = {};
                var targetData = [];
                if (node_target_step_map[nodekey] != undefined) {
                    targetjson = node_target_step_map[nodekey];
                    targetData = targetjson[target];
                    if (targetData === undefined) {
                        targetData = [];
                    }
                } else {
                    node_target_step_map[nodekey] = targetjson;
                    targetjson[target] = [];
                }
                if (value != undefined && value !== '') {
                    targetData.push(value);
                }
                targetjson[target] = targetData;
                node_target_step_map[nodekey] = targetjson;
            }

            global.db.driver.execQuery('select sc.scenario_index,sc.path from scenario_master sc inner join model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in ? and sc.model_version_id=?)', [selected_index, versionId], function (err, scenariomodels) {
                for (var k = 0; k < scenariomodels.length; k++) {
                    var patharr = scenariomodels[k].path.split(",");

                    for (var i = 0; i < patharr.length; i++) {
                        var node_id = patharr[i];

                        for (var stepkey in nodidcomponentMap) {
                            if (node_id === stepkey) {
                                selected_map[node_id] = nodidcomponentMap[node_id];
                            }
                        }
                    }
                }
                if (JSON.stringify(node_target_step_map) !== '{}') {
                    for (var selkey in selected_map) {
                        if (node_target_step_map[selkey] != undefined) {
                            var cell = 1;
                            var datacell = 1;
                            var worksheet = workbook.addWorksheet(selected_map[selkey]);
                            var worksheets = workbook.getWorksheet(selected_map[selkey]);
                            var targetvalue = node_target_step_map[selkey];
                            for (var keys in targetvalue) {
                                var rowstartdata = 2;
                                var row7 = worksheets.getRow(startstepdata);
                                row7.getCell(cell).value = keys;
                                var stepdata = targetvalue[keys];
                                cell++;
                                for (var i = 0; i < stepdata.length; i++) {
                                    var stepdes = stepdata[i];
                                    var row8 = worksheets.getRow(rowstartdata);
                                    row8.getCell(datacell).value = stepdes;
                                    rowstartdata++;
                                }
                                datacell++;
                            }
                        }
                    }

                    var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
                    workbook.xlsx.write(myWritableStreamBuffer).then(function () {
                        var resp = {
                            msg: global.errorDescs.errorDesc.desc.SUCCESS,
                            code: "200",
                            data: myWritableStreamBuffer.getContents()
                        }
                        response.end(JSON.stringify(resp));

                    });
                }
                else {
                    workbook.addWorksheet("Component Data Not Available");
                    var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
                    workbook.xlsx.write(myWritableStreamBuffer).then(function () {
                        var resp = {
                            msg: global.errorDescs.errorDesc.desc.SUCCESS,
                            code: "200",
                            data: myWritableStreamBuffer.getContents()
                        }
                        response.end(JSON.stringify(resp));

                    });
                }

            });


        });


    });


}

function createmanualtestcase(response, data, userData) {
    var versionid = data.versionid;
    var selected_scenarios_Ids = data.selectedscenarioids;
    var proj_info;
    var excelMappedFields={};
    var componenttypejson =
        {
            "erd.Entity": "Process",
            "fsa.StartState": "Start",
            "app.Link": "Link",
            "erd.Relationship": "Decision",
            "app.RectangularModel": ['Join', 'Fork'],
            "basic.Path": ['SendSignal', 'AcceptEvent'],
            "fsa.State": "State",
            "fsa.EndState": "End",
            "bpmn.Choreography": "Choreography",
            "bpmn.Gateway":"Gateway",
            "bpmn.Event":"Event",
            "bpmn.DataObject":"DataObject",
            "bpmn.Conversation":"Conversation",
            "bpmn.Message":"Message",
            "bpmn.Annotation":"Annotation",
            "bpmn.Group":"Group",
            "bpmn.Activity":"Activity",
        }
    global.appConstants.dbConstants.tableObj.modelVersion.find({ id: versionid }, function (err, daigramversion) {
        var nodidcomponentMap = {}
        for (j = 0; j < daigramversion.length; j++) {
            var diagram = daigramversion[j].diagram_data;
            for (k = 0; k < diagram.cells.length; k++) {
                if (diagram.cells[k].type != 'app.Link') {
                    var att = diagram.cells[k].attrs;
                    if (diagram.cells[k].type == 'app.RectangularModel' || diagram.cells[k].type == 'bpmn.Gateway' || diagram.cells[k].type == 'bpmn.Event'
                    || diagram.cells[k].type == 'bpmn.DataObject' || diagram.cells[k].type == 'bpmn.Conversation' || diagram.cells[k].type == 'bpmn.Message'
                    || diagram.cells[k].type == 'bpmn.Group') {
                        nodidcomponentMap[diagram.cells[k].id] = att['.label'].text;
                    } else if (diagram.cells[k].type == 'fsa.State') {
                        nodidcomponentMap[diagram.cells[k].id] = 'Exception';
                    } else if(diagram.cells[k].type=='bpmn.Choreography' || diagram.cells[k].type=='bpmn.Activity' || diagram.cells[k].type == 'bpmn.Annotation'){
                        nodidcomponentMap[diagram.cells[k].id]=att['.content'].html;
                    } else {
                        nodidcomponentMap[diagram.cells[k].id] = att.text.text;
                    }
                }
            }
        }
        global.appConstants.dbConstants.tableObj.modelVersion.find({ id: versionid }, function (err, daigramversion) {
            var project_name = daigramversion[0].project.name;
            var module_name = daigramversion[0].module.name;
            var diagram_name = daigramversion[0].diagram.name;
            var module_version = daigramversion[0].name;
            var testCaseTemplateJson = JSON.parse(JSON.stringify(daigramversion[0].project.templateCols.testcaseTemp));
            for(var i=0;i<testCaseTemplateJson.length;i++){
                excelMappedFields[testCaseTemplateJson[i].name]=testCaseTemplateJson[i].order;
            }
            proj_info = project_name + ":" + module_name + ":" + diagram_name + ":" + module_version;
            var workbook = new excel.Workbook();
            var worksheet;
            var testworksheet;
            var datarowstart = [];
            var node_target_step_map_manual = {};
            var testdatastart = 1;
            workbook.xlsx.readFile(__dirname + '\\iAuthor_Template.xlsx').then(function () {
                worksheet = workbook.getWorksheet('Test Case');
                testworksheet = workbook.getWorksheet('Test Data');
                //set column headers

                var headerrow = worksheet.getRow(1);
                for (var headerkey in excelMappedFields) {
                    headerrow.getCell(Number(excelMappedFields[headerkey])).fill = {
                        type: 'gradient',
                        gradient: 'angle',
                        degree: 0,
                        stops: [
                            {position:0, color:{argb:'c0c0c0'}},
                            {position:0.5, color:{argb:'c0c0c0'}},
                            {position:1, color:{argb:'c0c0c0'}}
                           ]
                     };
                    headerrow.getCell(Number(excelMappedFields[headerkey])).value = headerkey;
                }
                headerrow.commit();
                var node_desc_json = {};
                global.db.driver.execQuery('select ts.test_step_number,ts.description,ts.node_id from test_step_master ts where ts.version_id=?', [versionid], function (err, testdata) {
                    if (err) {
                        global.errorLog.error(err);
                    } else {
                        for (var i = 0; i < testdata.length; i++) {

                            var nodeid = testdata[i].node_id;
                            var testdes = testdata[i].description;
                            createnodedescmap(nodeid, testdes);
                        }
                        function createnodedescmap(nodeid, description) {
                            createjsonmap(nodeid, description);
                        }

                        function put(nodekey, descArr) {
                            node_desc_json[nodekey] = descArr;
                        }

                        function get(nodekey) {
                            if (node_desc_json[nodekey] == undefined) {
                                node_desc_json[nodekey] = [];
                            }
                            return node_desc_json[nodekey];
                        }

                        function createjsonmap(nodeid, description) {
                            var des = get(nodeid);
                            des.push(description);
                            put(nodeid, des);
                        }
                    }
                    global.db.driver.execQuery('select ts.node_id, ts.target, td.step_data from test_step_master ts inner join test_data_master td on(ts.id=td.test_step_id and ts.version_id=?)', [versionid], function (err, teststepdata) {
                        if (err) {
                            global.errorLog.error(err);
                        } else {
    
                            for (var l = 0; l < teststepdata.length; l++) {
                                var target = teststepdata[l].target;
                                var stepdata = teststepdata[l].step_data;
                                var node_id = teststepdata[l].node_id;
                                targetmap(node_id, target, stepdata);
                            }
                            function targetmap(nodeid, target, stepdata) {
                                put(nodeid, target, stepdata);
                            }
    
                            function put(nodekey, target, value) {
                                var targetjson = {};
                                var targetData = [];
                                if (node_target_step_map_manual[nodekey] != undefined) {
                                    targetjson = node_target_step_map_manual[nodekey];
                                    targetData = targetjson[target];
                                    if (targetData === undefined) {
                                        targetData = [];
                                    }
                                } else {
                                    node_target_step_map_manual[nodekey] = targetjson;
                                    targetjson[target] = [];
                                }
                                if (value != undefined && value !== '') {
                                    targetData.push(value);
                                }
                                targetjson[target] = targetData;
                                node_target_step_map_manual[nodekey] = targetjson;
                            }
                        }
                        global.db.driver.execQuery('select sc.path,sc.criticality,sc.scenario_index,sc.risk_exposer,sc.name,mv.diagram_data,reg.userID,reg.userName from scenario_master sc inner join model_version mv on(sc.model_version_id = mv.id and sc.scenario_index in ? and sc.model_version_id=? ) left join register reg on (mv.user_id = reg.id)', [selected_scenarios_Ids, versionid], function (err, models) {
                            if (err) {
                                global.errorLog.error(err);
                            } else {
                                var start = 2;
                                var daigram = null;
                                var nodeIdMap={};
                                if(models.length>0){
                                    daigram=JSON.parse(models[0].diagram_data);                            
                                }
                                if(daigram!=null){
                                    var totalCount=daigram.cells.length;
                                    for(var indexCount=0;indexCount<totalCount;indexCount++){
                                        var nodeId=daigram.cells[indexCount].id;
                                        nodeIdMap[nodeId]= indexCount;
                                    }
                                }
                                
                                for (i = 0; i < models.length; i++) {
        
                                    var criticality = models[i].criticality;
                                    var risk = models[i].risk_exposer;
                                    var scenarioindex = "Scenario" + models[i].scenario_index;
                                    var scenarioName = models[i].name;
                                    var scenarioNameTrim;
                                    scenarioName=scenarioindex+"_"+scenarioName;
                                    if(scenarioName.length>31){
                                        scenarioNameTrim= scenarioName.substring(0,31)+"...";
                                    }else{
                                        scenarioNameTrim=scenarioName;
                                    }
                                    var creatorName = models[i].userName
                                    var row3 = worksheet.getRow(start);
                                    datarowstart.push(start);
                                    if (excelMappedFields['PROJECT NAME'] != undefined) {
                                        row3.getCell(Number(excelMappedFields['PROJECT NAME'])).value = project_name;
                                    }
                                    if (excelMappedFields['MODEL NAME'] != undefined) {
                                        row3.getCell(Number(excelMappedFields['MODEL NAME'])).value = diagram_name;
                                    }
                                    if (excelMappedFields['MODULE NAME'] != undefined) {
                                        row3.getCell(Number(excelMappedFields['MODULE NAME'])).value = module_name;
                                    }
                                    if (excelMappedFields['MODEL VERSION'] != undefined) {
                                        row3.getCell(Number(excelMappedFields['MODEL VERSION'])).value = module_version;
                                    }
                                    if (excelMappedFields['SCENARIO ID'] != undefined) {
                                        row3.getCell(Number(excelMappedFields["SCENARIO ID"])).value = scenarioindex;
                                    }
                                    if (excelMappedFields['CRITICALITY'] != undefined) {
                                        row3.getCell(Number(excelMappedFields["CRITICALITY"])).value = criticality;
                                    }
                                    if (excelMappedFields['RISK EXPOSURE'] != undefined) {
                                        row3.getCell(Number(excelMappedFields['RISK EXPOSURE'])).value = risk;
                                    }
        
                                    if (excelMappedFields['SCENARIO NAME'] != undefined) {
                                        row3.getCell(Number(excelMappedFields['SCENARIO NAME'])).value = scenarioNameTrim;
                                    }
        
                                   if (excelMappedFields['DESIGNER'] != undefined) {
                                       row3.getCell(Number(excelMappedFields['DESIGNER'])).value = creatorName;
                                    }
        
                                    row3.commit();
                                    //component  logic and description logic
                                    var nodepath = models[i].path;
                                    var node_ids = nodepath.split(',');
                                    var isComponetExist=0;
                                    var stepCount=0;
                                   
                                    if(excelMappedFields['STEP ID']!= undefined || excelMappedFields['STEP DESCRIPTION'] != undefined || excelMappedFields['EXPECTED RESULT'] != undefined || excelMappedFields['COMPONENT NAME'] != undefined)
                                    {
                                        var componentNameExist=0;
                                        var nodeLength=node_ids.length-1;
                                        for (k = 0; k < nodeLength; k++) {
                                            var node_value = node_ids[k];
                                            var l=nodeIdMap[node_value];
                                            var daigram_node = daigram.cells[l].id;
                                            var linkNameToAppend='';
                                            if(k < nodeLength-2){
                                                var next_node_value = node_ids[k+1];
                                                var nextIndex=nodeIdMap[next_node_value];
                                                if (daigram.cells[nextIndex].type == 'app.Link' && ((daigram.cells[l].type == 'app.RectangularModel' && daigram.cells[l].outPorts.length >1 ) || daigram.cells[l].type == 'erd.Relationship') ) {
                                                    if ((daigram.cells[nextIndex]).hasOwnProperty("labels")) {
                                                        if (daigram.cells[nextIndex].labels != undefined && daigram.cells[nextIndex].labels.length > 0) {
                                                            if (daigram.cells[nextIndex].labels[0].attrs.text.text.length > 0) {
                                                                linkNameToAppend =' = '+ daigram.cells[nextIndex].labels[0].attrs.text.text;
                                                            }
                                                        }
                                                    }
                                                }
                                            }         
                                            
                                                if (daigram.cells[l].type != 'app.Link') {
                                                   
                                                    var att = daigram.cells[l].attrs;
                                                    var componentName = '';
                                                    var componentType = componenttypejson[daigram.cells[l].type];
                                                    if (diagram.cells[l].type == 'app.RectangularModel') {
                                                        componentName = att['.label'].text;
                                                        if (daigram.cells[l].outPorts.length == 1) {
                                                            componentType = componentType[0];
                                                        } else {
                                                            componentType = componentType[1];
                                                        }
                                                    } else {
                                                       if (diagram.cells[l].type == "fsa.State"){
                                                            componentName ='Exception'  
                                                       }else if(diagram.cells[l].type == 'bpmn.Gateway' || diagram.cells[l].type == 'bpmn.Event'
                                                                || diagram.cells[l].type == 'bpmn.DataObject' || diagram.cells[l].type == 'bpmn.Conversation' || diagram.cells[l].type == 'bpmn.Message'
                                                                || diagram.cells[l].type == 'bpmn.Group'){       
                                                            componentName = att['.label'].text;
                                                        }else if(diagram.cells[l].type=='bpmn.Choreography' || diagram.cells[l].type =='bpmn.Activity' || diagram.cells[l].type == 'bpmn.Annotation'){
                                                            componentName = att['.content'].html;
                                                        }else{
                                                            componentName = att.text.text;
                                                       } 
                                                       
                                                        if (diagram.cells[l].type == 'basic.Path') {
                                                            if (diagram.cells[l].name == 'AcceptEvent') {
                                                                componentType = componentType[1];
                                                            } else {
                                                                componentType = componentType[0];
                                                            }
                                                        }

                                                        if (diagram.cells[l].type == 'bpmn.Gateway') {
                                                            if (diagram.cells[l].icon == 'plus') {
                                                                componentType = "Gateway-Parllel";
                                                            } else if (diagram.cells[l].icon == 'circle') {
                                                                componentType = "Gateway-Inclusive";
                                                            }else {
                                                                componentType = "Gateway-Exclusive";
                                                            }
                                                        }

                                                        if (diagram.cells[l].type == 'bpmn.Event') {
                                                            if (diagram.cells[l].eventType == 'end') {
                                                                componentType = "Event-End";
                                                            } else if (diagram.cells[l].eventType == 'intermediate') {
                                                                componentType = "Event-Intermediate";
                                                            }else {
                                                                componentType = "Event-Start";
                                                            }
                                                        }


                                                    }
        
                                                    componentName=componentName+linkNameToAppend;
                                                         
                                                    if (excelMappedFields['COMPONENT NAME'] != undefined) {
                                                        componentNameExist=1;
                                                        var row4 = worksheet.getRow(start);
                                                        row4.getCell(Number(excelMappedFields['COMPONENT NAME'])).value = componentName;
                                                       if(excelMappedFields['COMPONENT TYPE'] != undefined){
                                                        row4.getCell(Number(excelMappedFields['COMPONENT TYPE'])).value = componentType;
                                                       } 
                                                    }
                                                    var flag = 0;
                                                    for (var key in node_desc_json) {
                                                        
                                                        if (key == node_value) {
                                                            var value = node_desc_json[key];
                                                            for (var ll = 0; ll < value.length; ll++) {
                                                                var row5 = worksheet.getRow(start);
        
                                                                if (value[ll] != '') {  
                                                                    if(componentNameExist==0){
                                                                    if (excelMappedFields['STEP ID'] != undefined) {
                                                                        row5.getCell(Number(excelMappedFields['STEP ID'])).value = "Step" + (stepCount++);
                                                                            }
                                                                    }else{
                                                                    if (excelMappedFields['STEP ID'] != undefined) {
                                                                        row5.getCell(Number(excelMappedFields['STEP ID'])).value = "Step" + (ll + 1);
                                                                            }
                                                                    }                                                                
                                                                    
                                                                    
                                                                    
                                                                    if (excelMappedFields['STEP DESCRIPTION'] != undefined) {
                                                                    
                                                                        row5.getCell(Number(excelMappedFields['STEP DESCRIPTION'])).value = value[ll];
                                                                    }
                                                                    
                                                                    if (excelMappedFields['EXPECTED RESULT'] != undefined) {
                                                                        if (value[ll].includes("Verify")) {
                                                                            if (value[ll].includes(" is ")) {
                                                                                row5.getCell(Number(excelMappedFields['EXPECTED RESULT'])).value = value[ll].replace("  is ", " should be ");
                                                                            } else {
                                                                                row5.getCell(Number(excelMappedFields['EXPECTED RESULT'])).value = value[ll];
                                                                            }
                                                                        } else {
                                                                            row5.getCell(Number(excelMappedFields['EXPECTED RESULT'])).value = "User should able to " + value[ll];
                                                                        }
                                                                    }
                                                                    
                                                                }else{
                                                                    stepCount--;
                                                                }
                                                                
                                                                start++;
                                                                
                                                            }
                                                            flag = 1;
                                                        }
                                                        
                                                    }                                                
                                                    if (flag == 0 && componentNameExist==1) {
                                                        start++;
                                                    }
        
                                                } /*else {
                                                   
                                                } */
                                        }
                                    }
                                  
                                    //var row6 = worksheet.getRow(start++);
                                    //row6.getCell(1).value = "";
                                }///end of for loop model
                            }
                            global.db.driver.execQuery('select sm.scenario_index,sm.path from scenario_master sm where sm.model_version_id=? and sm.scenario_index in ?', [versionid, selected_scenarios_Ids], function (err, scenariomodels) {
                                var datacount = 0;
                                if (err) {
                                    global.errorLog.error(err);
                                } else {
                                    var testcaserowstart = [];
        
        
                                    for (var smc = 0; smc < scenariomodels.length; smc++) {
        
                                        var ii = 0;
                                        var cells = 3;
                                        var cells2 = 2;
                                        var count = 1;
                                        var scenrio_index = scenariomodels[smc].scenario_index;
                                        var scenario_path = scenariomodels[smc].path;
                                        testcaserowstart.push(testdatastart);
                                        var row7 = testworksheet.getRow(testdatastart);
                                        row7.getCell(1).value = "Test Data For " + "Scenario" + scenrio_index;
                                        testdatastart++;
                                        var row8 = testworksheet.getRow(testdatastart);
                                        if (JSON.stringify(node_target_step_map_manual) !== '{}') {
                                            var scenario_path_value = scenario_path.split(",");
                                            for (var i = 0; i < scenario_path_value.length; i++) {
                                                if (i == 0) {
                                                    cells--;
                                                }
                                                if (node_target_step_map_manual[scenario_path_value[i]]) {
                                                    var scenario_details = node_target_step_map_manual[scenario_path_value[i]];
                                                    datacount++;
                                                    row8.getCell(1).value = "Serial ID";
                                                    var target_keys = [];
                                                    for (var k in scenario_details) {
                                                        target_keys.push(k);
                                                    }
                                                    for (var ll = 0; ll < target_keys.length; ll++) {
                                                        if (ii != 0) {
                                                            cells2++;
                                                        }
                                                        var target_key = target_keys[ll];
                                                        row8.getCell(cells).value = target_key;
        
                                                        var scenario_values = scenario_details[target_key];
        
                                                        var row = testdatastart;
                                                        row++;
                                                        for (var k = 0; k < scenario_values.length; k++) {
                                                            var row9 = testworksheet.getRow(row);
                                                            row9.getCell(1).value = k + 1;
                                                            row9.getCell(cells2).value = scenario_values[k];
                                                            row++;
                                                            ii++;
                                                        }
                                                        cells++;
        
                                                    }
                                                }
        
                                            }
        
                                        }
                                        if (datacount == 0) {
                                            var row10 = testworksheet.getRow(testdatastart);
                                            testdatastart++;
                                            row10.getCell(1).value = "Data not Avaliable";
                                        }
                                        testworksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                                            testdatastart = rowNumber;
                                        });
                                        testdatastart++;
        
                                    }
        
                                    if (excelMappedFields['STEP DATA'] != undefined) {
                                        for (var i = 0; i < datarowstart.length; i++) {
                                            var row11 = worksheet.getRow(datarowstart[i]);
                                            row11.getCell(Number(excelMappedFields['STEP DATA'])).value = { text: 'STEP DATA', hyperlink: '#\'Test Data\'!A' + testcaserowstart[i] };
                                            row11.getCell(Number(excelMappedFields['STEP DATA'])).font = {
                                                color: { argb: 'FFFF8C00' }
                                            }
                                            row11.getCell(Number(excelMappedFields['STEP DATA'])).showGridLines = true;
                                        }
                                    }
        
        
                                }
                                var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
                                workbook.xlsx.write(myWritableStreamBuffer).then(function () {
                                    var resp = {
                                        msg: global.errorDescs.errorDesc.desc.SUCCESS,
                                        code: "200",
                                        data: myWritableStreamBuffer.getContents(),
                                        proinfo: proj_info
                                    }
                                    response.end(JSON.stringify(resp));
        
                                }); 
        
                            });
                          /*  var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
                            workbook.xlsx.write(myWritableStreamBuffer).then(function () {
                                var resp = {
                                    msg: global.errorDescs.errorDesc.desc.SUCCESS,
                                    code: "200",
                                    data: myWritableStreamBuffer.getContents(),
                                    proinfo: proj_info
                                }
                                response.end(JSON.stringify(resp));
    
                            }); */
        
        
                        });
                    });
                });

               


               


            });


        });
    });

}


module.exports.service = {
    createExcel: createExceldata,
    testsuite: createTestSuite,
    comptestdata: createTestDD,
    manualtestcae: createmanualtestcase
};