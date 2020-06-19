var mysql = require('mysql2'),
    dbparams = require('./dbconf');
 
var connDB = mysql.createConnection(dbparams);

connDB.connect((err) => {
    if (err) throw ("Não foi possível conectar no banco de dados.");
});

module.exports = connDB;