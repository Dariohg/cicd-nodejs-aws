const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Public
 */
router.post('/', UserController.createUser);

/**
 * @route GET /api/users
 * @desc Obtener todos los usuarios
 * @access Public
 */
router.get('/', UserController.getUsers);

/**
 * @route GET /api/users/:id
 * @desc Obtener usuario por ID
 * @access Public
 */
router.get('/:id', UserController.getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Actualizar usuario
 * @access Public
 */
router.put('/:id', UserController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar usuario
 * @access Public
 */
router.delete('/:id', UserController.deleteUser);

module.exports = router;