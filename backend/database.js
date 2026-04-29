const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0845',
    database: 'SIGAS'
}).promise();

module.exports = pool;