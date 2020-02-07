var session = function(){
this.allOperatingSystems = [];
this.allBrowsers = [];
this.allBrowsersVersions = [];
this.allVMS = [];
this.particularOS = [];
this.pendingReverts = [];
this.projs = [];
this.userDetails = '';
this.loginTime = '';
this.logoutTime = '';

}
function userDetails(){
this.id = '';
this.name = '';
this.role = '';

}
function allOperatingSystems(){
this.id = '';
this.name = '';
}
function allBrowsers(){
this.id = '';
this.name = '';
}
function allBrowsersVersions(){
this.id = '';
this.browser_id = '';
this.version = '';
}
function allVMS(){
this.id = '';
this.vm_os_id = '';
this.vm_browser_id = '';
this.vm_browser_version_id = '';
this.snapshot_id = '';
}
function particularOS(){
this.osDetails = [];
}
function osDetails(){
this.browserId = '';
this.snapId = '';
this.id = '';
}
function pendingReverts(){
this.osid = '';
this.snapId = '';
}
function projsList(){
this.id = '';
this.name = '';
this.description = '';
}
