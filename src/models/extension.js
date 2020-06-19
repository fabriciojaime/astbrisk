var connDB = require('./database');

class Extension {
    rExtensions(callback){
        let sql = "select * from pjsip_extensions"

        connDB.query(sql,(err, extensions)=>{
            callback(err, extensions);
        });
    }

    rExtension(id,callback){
        return "Ramal "+id;
    }

    cExtension(){

    }

    dExtension(){

    }

    uExtension(){

    }
}

module.exports = new Extension();