const request = require('supertest');
const mongoose = require('mongoose');
const { expect } = require('chai');
const { app, Bicicleta } = require('../app');

describe('API de Bicicletas - Tests de Integración', () => {
    before(async () => {
        // Conectar a base de datos de prueba
        await mongoose.connect('mongodb://localhost:27017/red_bicicletas_test');
    });

    beforeEach(async () => {
        // Limpiar colección antes de cada test
        await Bicicleta.deleteMany({});
    });

    after(async () => {
        // Desconectar después de los tests
        await mongoose.connection.close();
    });

    // TEST 1: Crear bicicleta (POST)
    describe('POST /api/bicicletas', () => {
        it('debería crear una nueva bicicleta', async () => {
            const nuevaBici = {
                code: 100,
                color: 'rojo',
                modelo: 'urbana',
                ubicacion: {
                    coordinates: [-34.6037, -58.3816]
                }
            };

            const response = await request(app)
                .post('/api/bicicletas')
                .send(nuevaBici)
                .expect(201);

            expect(response.body).to.have.property('code', 100);
            expect(response.body).to.have.property('color', 'rojo');
        });

        it('debería devolver error si falta el código', async () => {
            const biciInvalida = {
                color: 'azul',
                modelo: 'montaña'
            };

            const response = await request(app)
                .post('/api/bicicletas')
                .send(biciInvalida)
                .expect(400);

            expect(response.body).to.have.property('error');
        });
    });

    // TEST 2: Obtener todas las bicicletas (GET)
    describe('GET /api/bicicletas', () => {
        it('debería obtener todas las bicicletas', async () => {
            // Crear dos bicicletas de prueba
            await Bicicleta.create([
                { code: 1, color: 'rojo', modelo: 'urbana', ubicacion: { coordinates: [0, 0] } },
                { code: 2, color: 'azul', modelo: 'montaña', ubicacion: { coordinates: [1, 1] } }
            ]);

            const response = await request(app)
                .get('/api/bicicletas')
                .expect(200);

            expect(response.body).to.be.an('array');
            expect(response.body.length).to.equal(2);
        });
    });

    // TEST 3: Obtener bicicleta por código (GET)
    describe('GET /api/bicicletas/:code', () => {
        it('debería obtener una bicicleta por su código', async () => {
            await Bicicleta.create({
                code: 123,
                color: 'verde',
                modelo: 'carrera',
                ubicacion: { coordinates: [10, 20] }
            });

            const response = await request(app)
                .get('/api/bicicletas/123')
                .expect(200);

            expect(response.body).to.have.property('code', 123);
            expect(response.body).to.have.property('color', 'verde');
        });

        it('debería devolver 404 si la bicicleta no existe', async () => {
            const response = await request(app)
                .get('/api/bicicletas/999')
                .expect(404);

            expect(response.body).to.have.property('error');
        });
    });

    // TEST 4: Actualizar bicicleta (PUT)
    describe('PUT /api/bicicletas/:code', () => {
        it('debería actualizar una bicicleta existente', async () => {
            await Bicicleta.create({
                code: 456,
                color: 'amarillo',
                modelo: 'playera',
                ubicacion: { coordinates: [15, 25] }
            });

            const response = await request(app)
                .put('/api/bicicletas/456')
                .send({ color: 'negro', modelo: 'playera' })
                .expect(200);

            expect(response.body).to.have.property('color', 'negro');
        });
    });

    // TEST 5: Eliminar bicicleta (DELETE)
    describe('DELETE /api/bicicletas/:code', () => {
        it('debería eliminar una bicicleta existente', async () => {
            await Bicicleta.create({
                code: 789,
                color: 'blanco',
                modelo: 'paseo',
                ubicacion: { coordinates: [30, 40] }
            });

            await request(app)
                .delete('/api/bicicletas/789')
                .expect(200);

            // Verificar que fue eliminada
            const buscada = await Bicicleta.findOne({ code: 789 });
            expect(buscada).to.be.null;
        });
    });
});