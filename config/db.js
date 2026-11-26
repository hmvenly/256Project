const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'yams_user',
    password: 'yams_password',
    database: 'yams_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();