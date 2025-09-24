const { query } = require('../config/database');

class User {
    /**
     * Crear un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.name - Nombre del usuario
     * @param {string} userData.email - Email del usuario
     * @returns {Promise<Object>} Usuario creado
     */
    static async create(userData) {
        const { name, email } = userData;
        const sql = `
      INSERT INTO users (name, email, created_at, updated_at) 
      VALUES (?, ?, NOW(), NOW())
    `;
        const values = [name, email];

        try {
            const result = await query(sql, values);
            // Obtener el usuario creado
            const createdUser = await this.findById(result.rows.insertId);
            return createdUser;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener todos los usuarios
     * @returns {Promise<Array>} Lista de usuarios
     */
    static async findAll() {
        const sql = 'SELECT * FROM users ORDER BY created_at DESC';

        try {
            const result = await query(sql);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';

        try {
            const result = await query(sql, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener usuario por email
     * @param {string} email - Email del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';

        try {
            const result = await query(sql, [email]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar usuario
     * @param {number} id - ID del usuario
     * @param {Object} userData - Nuevos datos del usuario
     * @returns {Promise<Object|null>} Usuario actualizado o null
     */
    static async update(id, userData) {
        const { name, email } = userData;
        const sql = `
      UPDATE users 
      SET name = ?, email = ?, updated_at = NOW() 
      WHERE id = ?
    `;

        try {
            const result = await query(sql, [name, email, id]);

            if (result.rows.affectedRows === 0) {
                return null;
            }

            // Retornar el usuario actualizado
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Eliminar usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario eliminado o null
     */
    static async delete(id) {
        // Primero obtener el usuario antes de eliminarlo
        const user = await this.findById(id);

        if (!user) {
            return null;
        }

        const sql = 'DELETE FROM users WHERE id = ?';

        try {
            const result = await query(sql, [id]);

            if (result.rows.affectedRows === 0) {
                return null;
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Contar total de usuarios
     * @returns {Promise<number>} Total de usuarios
     */
    static async count() {
        const sql = 'SELECT COUNT(*) as total FROM users';

        try {
            const result = await query(sql);
            return parseInt(result.rows[0].total);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;