const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'cicd_app',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    // Configuraciones adicionales para producción
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4',
    timezone: '+00:00'
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Event listeners para la conexión
pool.on('connection', (connection) => {
    console.log('New MySQL connection established as id ' + connection.threadId);
});

pool.on('error', (err) => {
    console.error('MySQL pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect to MySQL...');
    } else {
        throw err;
    }
});

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT NOW() as current_time');
        console.log('MySQL connection test:', rows[0]);
        connection.release();
        return true;
    } catch (err) {
        console.error('MySQL connection test failed:', err.message);
        return false;
    }
};

// Función helper para ejecutar queries
const query = async (sql, params = []) => {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return { rows, fields };
    } catch (error) {
        console.error('MySQL query error:', error.message);
        throw error;
    }
};

// Función para inicializar la base de datos
const initDatabase = async () => {
    try {
        // Crear la base de datos si no existe
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Database ${dbConfig.database} initialized`);
        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    query,
    testConnection,
    initDatabase
};