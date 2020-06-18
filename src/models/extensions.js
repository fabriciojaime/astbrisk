var db = require('../config/database');

function extensions() {}
extensions.prototype.getExtensions = function(callback) {
    
    sql = "select * from ps_auths;"

    db.query(sql,function(err, ramais){
        callback(err, ramais);
    });
};

module.exports = function(){
  return extensions;
}
