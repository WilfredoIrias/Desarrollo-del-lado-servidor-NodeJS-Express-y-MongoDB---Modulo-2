const mongoose = require('mongoose');
const Bicicleta = require('../../models/bicicleta');

describe('Modelo Bicicleta', () => {
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

    test('debe crear una bicicleta correctamente', async () => {
        const biciData = {
            color: 'Rojo',
            modelo: 'Urbana',
            ubicacion: [41.3879, 2.1699]
        };

        const bici = new Bicicleta(biciData);
        const biciGuardada = await bici.save();

        expect(biciGuardada._id).toBeDefined();
        expect(biciGuardada.color).toBe(biciData.color);
        expect(biciGuardada.modelo).toBe(biciData.modelo);
        expect(biciGuardada.ubicacion).toEqual(biciData.ubicacion);
        expect(biciGuardada.createdAt).toBeDefined();
        expect(biciGuardada.updatedAt).toBeDefined();
    });

    test('debe validar que el color es requerido', async () => {
        const biciData = {
            modelo: 'Urbana',
            ubicacion: [41.3879, 2.1699]
        };

        const bici = new Bicicleta(biciData);
        await expect(bici.save()).rejects.toThrow();
    });

    test('debe validar que la ubicacion tiene coordenadas validas', async () => {
        const biciData = {
            color: 'Rojo',
            modelo: 'Urbana',
            ubicacion: [100, 200] // Latitud invalida
        };

        const bici = new Bicicleta(biciData);
        await expect(bici.save()).rejects.toThrow();
    });

    test('debe encontrar una bicicleta por id', async () => {
        const bici = await Bicicleta.create({
            color: 'Azul',
            modelo: 'Montana',
            ubicacion: [41.3825, 2.1769]
        });

        const biciEncontrada = await Bicicleta.findById(bici._id);
        expect(biciEncontrada).toBeDefined();
        expect(biciEncontrada.color).toBe('Azul');
    });

    test('debe actualizar una bicicleta', async () => {
        const bici = await Bicicleta.create({
            color: 'Verde',
            modelo: 'Plegable',
            ubicacion: [41.3851, 2.1734]
        });

        bici.color = 'Amarillo';
        await bici.save();

        const biciActualizada = await Bicicleta.findById(bici._id);
        expect(biciActualizada.color).toBe('Amarillo');
    });

    test('debe eliminar una bicicleta', async () => {
        const bici = await Bicicleta.create({
            color: 'Negro',
            modelo: 'Electrica',
            ubicacion: [41.3888, 2.1580]
        });

        await Bicicleta.findByIdAndDelete(bici._id);
        const biciEliminada = await Bicicleta.findById(bici._id);
        expect(biciEliminada).toBeNull();
    });

    test('debe listar todas las bicicletas', async () => {
        await Bicicleta.create([
            { color: 'Rojo', modelo: 'Urbana', ubicacion: [41.3879, 2.1699] },
            { color: 'Azul', modelo: 'Montana', ubicacion: [41.3825, 2.1769] }
        ]);

        const bicicletas = await Bicicleta.find();
        expect(bicicletas.length).toBe(2);
    });
});