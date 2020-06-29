const util = require('util');
const mysql = require('mysql2');
const config = require('../../external/dbconf');

module.exports = function Database() {
    const connection = mysql.createConnection(config);
    return {
        query(sql, args) {
            return util.promisify(connection.query).call(connection, sql, args);
        },
        close(){
            return util.promisify(connection.end).call(connection);
        },
        beginTransaction(){
            return util.promisify(connection.beginTransaction).call(connection);
        },
        commit(){
            return util.promisify(connection.commit).call(connection);
        },
        rollback(){
            return util.promisify(connection.rollback).call(connection);
        }
    };
}