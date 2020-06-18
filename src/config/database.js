const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '192.168.0.240',
    user: 'asterisk',
    password: 'asterisk',
    database: 'asterisk'
});

// AUTENTICAÇÃO DATABASE
connection.connect((erro) => {
    if (!erro){
        console.log("Banco de dados conectado!")
    }else{
        console.log("Não foi possível conectar no banco de dados.");
    }
});


module.exports = connection;