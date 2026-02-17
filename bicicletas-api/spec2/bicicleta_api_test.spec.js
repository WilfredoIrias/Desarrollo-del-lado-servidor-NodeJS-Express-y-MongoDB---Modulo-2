const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Bicicleta = require('../models/bicicleta');

describe('API de Bicicletas', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/red_bicicletas_test');
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Bicicleta.deleteMany({});
    });

    describe('GET /api/bicicletas', () => {
        test('debe retornar lista vacia cuando no hay bicicletas', async () => {
            const response = await request(app)
                .get('/api/bicicletas')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(response.body.total).toBe(0);
        });

        test('debe retornar lista de bicicletas', async () => {
            await Bicicleta.create([
                { color: 'Rojo', modelo: 'Urbana', ubicacion: [41.3879, 2.1699] },
                { color: 'Azul', modelo: 'Montana', ubicacion: [41.3825, 2.1769] }
            ]);

            const response = await request(app)
                .get('/api/bicicletas')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.total).toBe(2);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('GET /api/bicicletas/:id', () => {
        test('debe retornar una bicicleta por id', async () => {
            const bici = await Bicicleta.create({
                color: 'Rojo',
                modelo: 'Urbana',
                ubicacion: [41.3879, 2.1699]
            });

            const response = await request(app)
                .get(`/api/bicicletas/${bici._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.color).toBe('Rojo');
            expect(response.body.data.modelo).toBe('Urbana');
        });

        test('debe retornar 404 si la bicicleta no existe', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/bicicletas/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Bicicleta no encontrada');
        });
    });

    describe('POST /api/bicicletas', () => {
        test('debe crear una nueva bicicleta', async () => {
            const nuevaBici = {
                color: 'Verde',
                modelo: 'Plegable',
                lat: 41.3851,
                lng: 2.1734
            };

            const response = await request(app)
                .post('/api/bicicletas')
                .send(nuevaBici)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.color).toBe(nuevaBici.color);
            expect(response.body.data.modelo).toBe(nuevaBici.modelo);
            expect(response.body.data.ubicacion).toEqual([nuevaBici.lat, nuevaBici.lng]);

            const biciEnDB = await Bicicleta.findById(response.body.data._id);
            expect(biciEnDB).not.toBeNull();
        });

        test('debe validar datos requeridos', async () => {
            const response = await request(app)
                .post('/api/bicicletas')
                .send({ color: 'Rojo' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Faltan datos requeridos');
        });
    });

    describe('PUT /api/bicicletas/:id', () => {
        test('debe actualizar una bicicleta', async () => {
            const bici = await Bicicleta.create({
                color: 'Negro',
                modelo: 'Electrica',
                ubicacion: [41.3888, 2.1580]
            });

            const response = await request(app)
                .put(`/api/bicicletas/${bici._id}`)
                .send({ color: 'Gris', modelo: 'Urbana Plus' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.color).toBe('Gris');
            expect(response.body.data.modelo).toBe('Urbana Plus');

            const biciActualizada = await Bicicleta.findById(bici._id);
            expect(biciActualizada.color).toBe('Gris');
            expect(biciActualizada.modelo).toBe('Urbana Plus');
        });

        test('debe retornar 404 si la bicicleta no existe', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/bicicletas/${fakeId}`)
                .send({ color: 'Gris' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Bicicleta no encontrada');
        });
    });

    describe('DELETE /api/bicicletas/:id', () => {
        test('debe eliminar una bicicleta', async () => {
            const bici = await Bicicleta.create({
                color: 'Amarillo',
                modelo: 'BMX',
                ubicacion: [41.3900, 2.1700]
            });

            const response = await request(app)
                .delete(`/api/bicicletas/${bici._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Bicicleta eliminada exitosamente');

            const biciEliminada = await Bicicleta.findById(bici._id);
            expect(biciEliminada).toBeNull();
        });

        test('debe retornar 404 si la bicicleta no existe', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/bicicletas/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Bicicleta no encontrada');
        });
    });
});