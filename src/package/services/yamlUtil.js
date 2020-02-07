var typeOf = require('remedial').typeOf;

function stringify(data) {
  var handlers
    , indentLevel = ''
    ;

  handlers = {
      "undefined": function () {
        // objects will not have `undefined` converted to `null`
        // as this may have unintended consequences
        // For arrays, however, this behavior seems appropriate
        return 'null';
      }
    , "null": function () {
        return 'null';
      }
    , "number": function (x) {
        return x;
      }
    , "boolean": function (x) {
        return x ? 'true' : 'false';
      }
    , "string": function (x) {
        // to avoid the string "true" being confused with the
        // the literal `true`, we always wrap strings in quotes
        return x;
      }
    , "array": function (x,from) {
        var output = ''
          ;

        if (0 === x.length) {
          output += '[]';
          return output;
        }

        indentLevel = indentLevel.replace(/$/, '  ');
        var count=1;        
        x.forEach(function (y) {
          // TODO how should `undefined` be handled?
          var handler = handlers[typeOf(y)]
            ;

          if (!handler) {
            throw new Error('what the crap: ' + typeOf(y));
          }
          var newLineStr='\n';          
          if(typeOf(y)=='object'){
            if(count==1){
              newLineStr='';
            }
            output += newLineStr + indentLevel + handler(y,'array');
          }else{
            output += newLineStr + indentLevel + '- ' + handler(y);              
          }
          count++;           
        });
        indentLevel = indentLevel.replace(/  /, '');
        
        return output;
      }
    , "object": function (x,from) {
        var output = ''
          ;

        if (0 === Object.keys(x).length) {
          output += '{}';
          return output;
        }
        if(from=='START'){
          indentLevel = '';
        } else{
          indentLevel = indentLevel.replace(/$/, '  ');          
        }
        var keycount=1;        
        Object.keys(x).forEach(function (k) {
          var val = x[k]
            , handler = handlers[typeOf(val)]
            ;

          if ('undefined' === typeof val) {
            // the user should do
            // delete obj.key
            // and not
            // obj.key = undefined
            // but we'll error on the side of caution
            return;
          }

          if (!handler) {
            throw new Error('what the crap: ' + typeOf(val));
          }
          var newLine='\n';

          if(from=='array'){
            if(keycount==1){
              output += '\n' + indentLevel +'- ' +k + ': ' + handler(val,typeOf(val));         
            }else{
              output += '\n' + indentLevel +'  ' +k + ': ' + handler(val,typeOf(val));         
            }
          }else if(from=='START'){
            if( keycount==1){
              newLine='';
            }
            output += newLine + indentLevel + k + ': ' + handler(val,typeOf(val));            
          }else{
            output += newLine + indentLevel +'  ' +k + ': ' + handler(val,typeOf(val));            
          }
          keycount++;           
        });
        indentLevel = indentLevel.replace(/  /, '');

        return output;
      }
    , "function": function () {
        // TODO this should throw or otherwise be ignored
        return '[object Function]';
      }
  };

  return handlers[typeOf(data)](data,'START') + '\n';
}

module.exports = {
  stringify :stringify
};
