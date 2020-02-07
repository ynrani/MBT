var cipher = require('../api/cipher.js');
module.exports = {
encrypttxt : function(pass)
{
  return cipher.security.encrypt(pass);
},
decrypttxt : function(pass){
  return cipher.security.decrypt(pass)
}
};
require('make-runnable');
