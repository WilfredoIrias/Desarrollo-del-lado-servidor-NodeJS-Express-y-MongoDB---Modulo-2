const mongoose = require('mongoose');
const { expect } = require('chai');
const Bicicleta = require('../../models/bicicleta');

describe('Modelo Bicicleta - Tests de Persistencia', () => {
    before(async () => {
        await mongoose.connect('mongodb://localhost:27017/red_bicicletas_test');
    });

    beforeEach(async () => {
        await Bicicleta.deleteMany({});
    });

    after(async () => {
        await mongoose.connection.close();
    });

    describe('Creación de bicicletas', () => {
        it('debería guardar una bicicleta correctamente', async () => {
            const bicicletaData = {
                code: 1,
                color: 'rojo',
                modelo: 'urbana',
                ubicacion: {
                    coordinates: [-34.6037, -58.3816]
                }
            };

            const bicicleta = new Bicicleta(bicicletaData);
            const guardada = await bicicleta.save();

            expect(guardada).to.have.property('code', 1);
            expect(guardada).to.have.property('color', 'rojo');
        });

        it('no debería guardar dos bicicletas con el mismo código', async () => {
            const bici1 = new Bicicleta({
                code: 1,
                color: 'rojo',
                modelo: 'urbana',
                ubicacion: { coordinates: [0, 0] }
            });
            await bici1.save();

            const bici2 = new Bicicleta({
                code: 1,
                color: 'azul',
                modelo: 'montaña',
                ubicacion: { coordinates: [1, 1] }
            });

            try {
                await bici2.save();
                expect.fail('Debería haber lanzado error por código duplicado');
            } catch (error) {
                expect(error).to.exist;
            }
        });
    });

    describe('Búsqueda de bicicletas', () => {
        it('debería encontrar una bicicleta por su código', async () => {
            await Bicicleta.create({
                code: 123,
                color: 'verde',
                modelo: 'carrera',
                ubicacion: { coordinates: [10, 20] }
            });

            const encontrada = await Bicicleta.findOne({ code: 123 });
            expect(encontrada).to.exist;
            expect(encontrada.color).to.equal('verde');
        });
    });

    describe('Actualización de bicicletas', () => {
        it('debería actualizar el color de una bicicleta', async () => {
            const bici = await Bicicleta.create({
                code: 456,
                color: 'amarillo',
                modelo: 'playera',
                ubicacion: { coordinates: [15, 25] }
            });

            bici.color = 'negro';
            await bici.save();

            const actualizada = await Bicicleta.findOne({ code: 456 });
            expect(actualizada.color).to.equal('negro');
        });
    });

    describe('Eliminación de bicicletas', () => {
        it('debería eliminar una bicicleta', async () => {
            const bici = await Bicicleta.create({
                code: 789,
                color: 'blanco',
                modelo: 'paseo',
                ubicacion: { coordinates: [30, 40] }
            });

            await Bicicleta.deleteOne({ code: 789 });

            const buscada = await Bicicleta.findOne({ code: 789 });
            expect(buscada).to.be.null;
        });
    });
});