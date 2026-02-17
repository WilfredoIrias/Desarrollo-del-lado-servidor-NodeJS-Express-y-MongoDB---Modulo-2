const mongoose = require('mongoose');
const Bicicleta = require('../models/bicicleta');

describe('Tests de persistencia del modelo Bicicleta', () => {
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

    test('debe guardar y recuperar una bicicleta de la base de datos', async () => {
        const biciData = {
            color: 'Rojo',
            modelo: 'Urbana',
            ubicacion: [41.3879, 2.1699]
        };

        const biciGuardada = await Bicicleta.create(biciData);

        const biciRecuperada = await Bicicleta.findById(biciGuardada._id);
        expect(biciRecuperada).toBeDefined();
        expect(biciRecuperada.color).toBe('Rojo');
        expect(biciRecuperada.modelo).toBe('Urbana');
        expect(biciRecuperada.ubicacion).toEqual([41.3879, 2.1699]);
    });

    test('debe persistir multiples bicicletas y recuperarlas', async () => {
        const bicicletas = [
            { color: 'Rojo', modelo: 'Urbana', ubicacion: [41.3879, 2.1699] },
            { color: 'Azul', modelo: 'Montana', ubicacion: [41.3825, 2.1769] },
            { color: 'Verde', modelo: 'Plegable', ubicacion: [41.3851, 2.1734] }
        ];

        await Bicicleta.insertMany(bicicletas);

        const todas = await Bicicleta.find();
        expect(todas.length).toBe(3);
    });

    test('debe actualizar una bicicleta persistida', async () => {
        const bici = await Bicicleta.create({
            color: 'Negro',
            modelo: 'Electrica',
            ubicacion: [41.3888, 2.1580]
        });

        await Bicicleta.findByIdAndUpdate(
            bici._id,
            { color: 'Gris', modelo: 'Electrica Pro' }
        );

        const biciActualizada = await Bicicleta.findById(bici._id);
        expect(biciActualizada.color).toBe('Gris');
        expect(biciActualizada.modelo).toBe('Electrica Pro');
    });

    test('debe eliminar una bicicleta persistida', async () => {
        const bici = await Bicicleta.create({
            color: 'Amarillo',
            modelo: 'BMX',
            ubicacion: [41.3900, 2.1700]
        });

        await Bicicleta.findByIdAndDelete(bici._id);

        const biciEliminada = await Bicicleta.findById(bici._id);
        expect(biciEliminada).toBeNull();
    });

    test('debe buscar bicicletas por color', async () => {
        await Bicicleta.create([
            { color: 'Rojo', modelo: 'Urbana', ubicacion: [41.3879, 2.1699] },
            { color: 'Rojo', modelo: 'Montana', ubicacion: [41.3825, 2.1769] },
            { color: 'Azul', modelo: 'Plegable', ubicacion: [41.3851, 2.1734] }
        ]);

        const rojas = await Bicicleta.find({ color: 'Rojo' });
        expect(rojas.length).toBe(2);
        expect(rojas[0].color).toBe('Rojo');
        expect(rojas[1].color).toBe('Rojo');
    });

    test('debe validar coordenadas antes de persistir', async () => {
        const biciInvalida = new Bicicleta({
            color: 'Rojo',
            modelo: 'Urbana',
            ubicacion: [100, 200] // Coordenadas invalidas
        });

        await expect(biciInvalida.save()).rejects.toThrow();
    });
});