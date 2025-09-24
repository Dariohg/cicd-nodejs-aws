const User = require('../models/userModel');

class UserController {
    /**
     * Crear un nuevo usuario
     */
    static async createUser(req, res, next) {
        try {
            const { name, email } = req.body;

            // Validaciones básicas
            if (!name || !email) {
                return res.status(400).json({
                    error: 'Name and email are required',
                    received: { name: !!name, email: !!email }
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Invalid email format'
                });
            }

            // Verificar si el email ya existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email already exists'
                });
            }

            const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim() });

            res.status(201).json({
                success: true,
                data: user,
                message: 'User created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener todos los usuarios
     */
    static async getUsers(req, res, next) {
        try {
            const users = await User.findAll();
            const total = await User.count();

            res.status(200).json({
                success: true,
                data: users,
                meta: {
                    total,
                    count: users.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener usuario por ID
     */
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    error: 'Invalid user ID format'
                });
            }

            const user = await User.findById(parseInt(id));

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    id: parseInt(id)
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar usuario
     */
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    error: 'Invalid user ID format'
                });
            }

            // Validaciones básicas
            if (!name || !email) {
                return res.status(400).json({
                    error: 'Name and email are required',
                    received: { name: !!name, email: !!email }
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Invalid email format'
                });
            }

            // Verificar si el usuario existe
            const existingUser = await User.findById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    error: 'User not found',
                    id: parseInt(id)
                });
            }

            // Verificar si el email ya existe en otro usuario
            const userWithEmail = await User.findByEmail(email.toLowerCase().trim());
            if (userWithEmail && userWithEmail.id !== parseInt(id)) {
                return res.status(409).json({
                    error: 'Email already exists'
                });
            }

            const user = await User.update(parseInt(id), {
                name: name.trim(),
                email: email.toLowerCase().trim()
            });

            res.status(200).json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar usuario
     */
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    error: 'Invalid user ID format'
                });
            }

            const user = await User.delete(parseInt(id));

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    id: parseInt(id)
                });
            }

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                data: { id: parseInt(id) }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;