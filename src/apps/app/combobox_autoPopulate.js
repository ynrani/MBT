function populateDropDown(){
 
/* Clear the entire subjects drop down*/
document.getElementById("tes_cond_targettype").options.length = 0;
 
/* adding a Default "Select" option in Subjects Menu*/
var optn = document.createElement("OPTION");
optn.text = "Select";
tes_cond_targettype.options.add(optn);
 
/* This can be changed according to the rest of the code instead of hard coded values*/
var selectedIndexVal = document.getElementById("tes_cond_action").selectedIndex;
var targetTypeValList =document.getElementById("tes_cond_action").options[selectedIndexVal].value;
var targetTypeValArray=targetTypeValList.split(",");
for(var j=0;j<targetTypeValArray.length;j++){
var optn = document.createElement("OPTION");
optn.text = targetTypeValArray[j];
optn.value = targetTypeValArray[j];
tes_cond_targettype.options.add(optn);
}
 
}