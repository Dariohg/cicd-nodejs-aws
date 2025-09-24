const request = require('supertest');
const app = require('../src/app');

describe('User API', () => {
    let createdUserId;

    // Test del endpoint de health check
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    // Tests para crear usuario
    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const userData = {
                name: 'Test User',
                email: `test${Date.now()}@example.com`
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(userData.name);
            expect(response.body.data.email).toBe(userData.email);

            createdUserId = response.body.data.id;
        });

        it('should return 400 if name is missing', async () => {
            const userData = {
                email: `test${Date.now()}@example.com`
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Name and email are required');
        });

        it('should return 400 if email is missing', async () => {
            const userData = {
                name: 'Test User 2'
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Name and email are required');
        });

        it('should return 400 for invalid email format', async () => {
            const userData = {
                name: 'Test User',
                email: 'invalid-email'
            };

            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(400);

            expect(response.body.error).toBe('Invalid email format');
        });
    });

    // Tests para obtener usuarios
    describe('GET /api/users', () => {
        it('should get all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body).toHaveProperty('meta');
            expect(response.body.meta).toHaveProperty('total');
        });
    });

    // Tests para obtener usuario por ID
    describe('GET /api/users/:id', () => {
        it('should get user by id', async () => {
            if (!createdUserId) {
                // Crear usuario para el test si no existe
                const userData = {
                    name: 'Test User For Get',
                    email: `testget${Date.now()}@example.com`
                };
                const createResponse = await request(app)
                    .post('/api/users')
                    .send(userData);
                createdUserId = createResponse.body.data.id;
            }

            const response = await request(app)
                .get(`/api/users/${createdUserId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', createdUserId);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/99999')
                .expect(404);

            expect(response.body.error).toBe('User not found');
        });

        it('should return 400 for invalid id format', async () => {
            const response = await request(app)
                .get('/api/users/invalid-id')
                .expect(400);

            expect(response.body.error).toBe('Invalid user ID format');
        });
    });

    // Tests para actualizar usuario
    describe('PUT /api/users/:id', () => {
        it('should update user', async () => {
            if (!createdUserId) {
                // Crear usuario para el test si no existe
                const userData = {
                    name: 'Test User For Update',
                    email: `testupdate${Date.now()}@example.com`
                };
                const createResponse = await request(app)
                    .post('/api/users')
                    .send(userData);
                createdUserId = createResponse.body.data.id;
            }

            const updateData = {
                name: 'Updated Test User',
                email: `updated${Date.now()}@example.com`
            };

            const response = await request(app)
                .put(`/api/users/${createdUserId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.email).toBe(updateData.email);
        });

        it('should return 404 for non-existent user', async () => {
            const updateData = {
                name: 'Updated User',
                email: `updated${Date.now()}@example.com`
            };

            const response = await request(app)
                .put('/api/users/99999')
                .send(updateData)
                .expect(404);

            expect(response.body.error).toBe('User not found');
        });
    });

    // Tests para eliminar usuario
    describe('DELETE /api/users/:id', () => {
        it('should delete user', async () => {
            // Crear usuario específico para este test
            const userData = {
                name: 'Test User For Delete',
                email: `testdelete${Date.now()}@example.com`
            };
            const createResponse = await request(app)
                .post('/api/users')
                .send(userData);
            const userIdToDelete = createResponse.body.data.id;

            const response = await request(app)
                .delete(`/api/users/${userIdToDelete}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User deleted successfully');

            // Verificar que el usuario ya no existe
            await request(app)
                .get(`/api/users/${userIdToDelete}`)
                .expect(404);
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .delete('/api/users/99999')
                .expect(404);

            expect(response.body.error).toBe('User not found');
        });
    });

    // Test para ruta no encontrada
    describe('404 handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body.error).toBe('Route not found');
        });
    });
});