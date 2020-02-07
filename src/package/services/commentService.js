var HashMap = require('hashmap');

var MONTH_NAMES = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

function createComment(response, data, userData){
	try{
         var commentObject = {
            comment_txt   :  data["commentTxt"],
            user_id   :  userData[0].userID,
            parent_id   :data["pId"],
            created_date: new Date(data["postedDt"]),
            model_version_id: data["verId"]
        };
        global.appConstants.dbConstants.tableObj.modelComments.create([commentObject], function (err, items) {
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
                    data:[]
                }
                response.end(JSON.stringify(resp));
            }
        });		
    }catch(e){
		global.errorLog.error(e);
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}	
}


function getAllComments(response, data, userDetails){
	try{	
        var versionId = data["verId"];
        var inputParams=[versionId];
        var commentsOrder=[];
        var query = 'SELECT mc.id,mc.comment_txt,mc.parent_id,mc.created_date,r.userName,mc.user_id FROM model_comments mc left join register r on (mc.user_id=r.userID)  where mc.model_version_id=? order by mc.created_date desc, mc.id desc';
        var commentMap=new HashMap();         
        global.db.driver.execQuery(query,inputParams, function(err, comments) {
            if(err){
                global.errorLog.error(err);
                var resp={
                    msg:global.errorDescs.errorDesc.desc.DB_IO_ERROR,
                    code:global.errorCodes.errorCode.codes.DB_IO_ERROR
                }
                response.end(JSON.stringify(resp));
            }else if(comments.length > 0){
                var length=comments.length;
                for(var index=0;index<length;index++){
                    var commentRow=comments[index];
                    var createdDate=parseDate(commentRow.created_date);
                    if(commentRow.parent_id!=null){
                        var replyObject={
                            id:commentRow.id,
                            text:commentRow.comment_txt,
                            date:createdDate,
                            userName:commentRow.userName,
                            userId:commentRow.user_id
                        }
                        if(commentMap.get(commentRow.parent_id)==undefined){
                            commentMap.set(commentRow.parent_id,{
                                id:commentRow.parent_id,
                                text:'',
                                date:'',
                                userName:'',
                                userId:'',
                                replies:[replyObject]
                           });
                        }else{
                            var commentObj=commentMap.get(commentRow.parent_id);
                            commentObj.replies.push(replyObject);
                        }
                    }else{
                        if(commentMap.get(commentRow.id)==undefined){
                            commentMap.set(commentRow.id,{
                                id:commentRow.id,
                                text:commentRow.comment_txt,
                                date:createdDate,
                                userName:commentRow.userName,
                                userId:commentRow.user_id,
                                replies:[]
                            });
                        }else{
                            var commentObj=commentMap.get(commentRow.id);
                            commentObj.id=commentRow.id;
                            commentObj.text=commentRow.comment_txt;
                            commentObj.date=createdDate;
                            commentObj.userName=commentRow.userName; 
                            commentObj.userId=commentRow.user_id;                            
                        }
                        commentsOrder.push(commentRow.id);                        
                    }
                }                
            }
            var resp={
                msg:global.errorDescs.errorDesc.desc.SUCCESS,
                code:"200",
                data:{comments:commentMap,order:commentsOrder}
            }
            response.end(JSON.stringify(resp));
        });		
	}catch(e){
		global.errorLog.error(e);
		var resp={
			msg:global.errorDescs.errorDesc.desc.SYNTAX_ERROR,
			code:global.errorCodes.errorCode.codes.SYNTAX_ERROR
		}
		response.end(JSON.stringify(resp));
	}
}


function parseDate(dateTime){
	var year =dateTime.getFullYear()+'';
    //var month=dateTime.getMonth()+1+'';
    var monthName=MONTH_NAMES[dateTime.getMonth()];    
    var date=dateTime.getDate()+'';
    var hours=dateTime.getHours()+'';
    var minutes=dateTime.getMinutes()+'';
    //var seconds=dateTime.getSeconds()+'';
	/*if(month.length<2){
		month='0'+month;
    }*/    
	if(date.length<2){
		date='0'+date;
    }
    if(hours.length<2){
		hours='0'+hours;
    }
    if(minutes.length<2){
		minutes='0'+minutes;
    }
    /*if(seconds.length<2){
		seconds='0'+seconds;
    }*/
	return hours+":"+minutes+", "+date+" "+monthName+" "+year;
}


module.exports.service = {
	create:createComment,
	getAll:getAllComments
};
