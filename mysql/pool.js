const mysql = require('mysql2/promise');
const config = require('../config.json');

const sql = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    supportBigNumbers: true,
    bigNumberStrings: true,
    charset: 'utf8mb4'
});

sql.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection) connection.release();
});


query = `CREATE TABLE IF NOT EXISTS ${config.mysql.discordAddonDb}.tpg_maps (
    id INT NOT NULL AUTO_INCREMENT,
    steamid TEXT NOT NULL,
    map TEXT NOT NULL,
    used_timestamp BIGINT NOT NULL,
    days INT NOT NULL,
    executed CHAR NULL DEFAULT NULL,
    expired CHAR NULL DEFAULT NULL,
    UNIQUE INDEX id (id) USING BTREE
)`;
sql.query(query);

module.exports = {sql};