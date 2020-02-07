function validation(type,value,size){
//console.log("type===="+value.length+"-----"+value);
var validFlag = '';
var res = new Object();
	switch(type){
		case "empty" : //RegEx = /[^\s]/;
				try{
						if(value.length > 0){
						return true;
						}else{
						return false;
						}
						}catch(e){
						return false;
						}break;
		case "maxlength" : 
			if(value.length > size)
				return false;
				else
				return true;
						break;
		case "minlength" : 
			if(value.length < size)
				return false;
				else
				return true;
						break;
		case "mobile":
        RegEx = /^\d{10}$/;
        break;
		case "longstringwithspaces":
        RegEx = /^[\sa-zA-Z]+$/;
        break;
		case "userid":
        RegEx = /^[a-zA-Z0-9_.]+$/;
        break;
		case "password":
        RegEx = /^[a-zA-Z0-9!@#\$\*_]+$/;
        break;
		case "quizNames":
        RegEx = /^[a-zA-Z0-9\s\?.]+$/;
        break;
		case "email":
        RegEx =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        break;
	}
	 if( !RegEx.test(value) )
        validFlag = false;
    else
        validFlag = true;
		
	if(validFlag!== ''){
	return validFlag;
	}else{
	return 0;
	}
}

