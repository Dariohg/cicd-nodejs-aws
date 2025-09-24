require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

/**
 * Ejecutar todas las migraciones de la base de datos
 */
async function runMigrations() {
    console.log('Starting database migrations...');

    let connection;

    try {
        // Crear conexión a MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password'
        });

        // Crear base de datos si no existe
        const dbName = process.env.DB_NAME || 'cicd_app';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Database ${dbName} ready`);

        // Usar la base de datos
        await connection.query(`USE \`${dbName}\``);

        // Crear tabla de migraciones si no existe
        await createMigrationsTable(connection);

        // Obtener lista de migraciones ejecutadas
        const executedMigrations = await getExecutedMigrations(connection);
        console.log('Executed migrations:', executedMigrations.map(m => m.filename));

        // Leer archivos de migración
        const migrationsDir = path.join(__dirname, '../../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log('Found migration files:', migrationFiles);

        // Ejecutar migraciones pendientes
        let executedCount = 0;
        for (const file of migrationFiles) {
            if (!executedMigrations.some(m => m.filename === file)) {
                console.log(`Executing migration: ${file}`);
                await executeMigration(connection, file, migrationsDir);
                executedCount++;
            } else {
                console.log(`Skipping already executed migration: ${file}`);
            }
        }

        if (executedCount === 0) {
            console.log('No new migrations to execute. Database is up to date.');
        } else {
            console.log(`Successfully executed ${executedCount} migration(s).`);
        }

    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Crear tabla para tracking de migraciones
 */
async function createMigrationsTable(connection) {
    const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

    await connection.query(query);
    console.log('Migrations table ready');
}

/**
 * Obtener lista de migraciones ya ejecutadas
 */
async function getExecutedMigrations(connection) {
    const query = 'SELECT filename FROM migrations ORDER BY executed_at';
    const [rows] = await connection.query(query);
    return rows;
}

/**
 * Ejecutar una migración específica
 */
async function executeMigration(connection, filename, migrationsDir) {
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Comenzar transacción
    await connection.beginTransaction();

    try {
        // Ejecutar el SQL de la migración
        await connection.query(sql);

        // Registrar la migración como ejecutada
        await connection.query(
            'INSERT INTO migrations (filename) VALUES (?)',
            [filename]
        );

        await connection.commit();
        console.log(`Migration ${filename} executed successfully`);

    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to execute migration ${filename}: ${error.message}`);
    }
}

/**
 * Función para rollback (opcional)
 */
async function rollbackLastMigration() {
    console.log('Rollback functionality not implemented yet');
}

// Ejecutar migraciones si este archivo se ejecuta directamente
if (require.main === module) {
    runMigrations();
}

module.exports = {
    runMigrations,
    rollbackLastMigration
};