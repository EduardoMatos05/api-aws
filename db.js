const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'sicei',
    waitForConnections: true,
    connectionLimit: 10
});

async function initDB() {
    const tempConn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    await tempConn.query('CREATE DATABASE IF NOT EXISTS sicei');
    await tempConn.end();

    const conn = await pool.getConnection();

    await conn.execute(`
        CREATE TABLE IF NOT EXISTS alumnos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombres VARCHAR(255) NOT NULL,
            apellidos VARCHAR(255) NOT NULL,
            matricula VARCHAR(255) NOT NULL,
            promedio DOUBLE NOT NULL,
            password VARCHAR(255) NOT NULL,
            fotoPerfilUrl VARCHAR(500) DEFAULT NULL
        )
    `);

    await conn.execute(`
        CREATE TABLE IF NOT EXISTS profesores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombres VARCHAR(255) NOT NULL,
            apellidos VARCHAR(255) NOT NULL,
            numeroEmpleado INT NOT NULL,
            horasClase INT NOT NULL
        )
    `);

    conn.release();
    console.log('Base de datos inicializada');
}

module.exports = { pool, initDB };