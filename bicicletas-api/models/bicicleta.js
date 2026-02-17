const mongoose = require('mongoose');

const bicicletaSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    ubicacion: {
        type: [Number],
        index: '2dsphere',
        required: true,
        validate: {
            validator: function (ubicacion) {
                return ubicacion.length === 2 &&
                    ubicacion[0] >= -90 && ubicacion[0] <= 90 &&
                    ubicacion[1] >= -180 && ubicacion[1] <= 180;
            },
            message: 'Ubicacion debe ser [latitud, longitud] valida'
        }
    }
}, {
    timestamps: true
});

bicicletaSchema.methods.toString = function () {
    return `Bicicleta ID: ${this._id} | Color: ${this.color} | Modelo: ${this.modelo}`;
};

const Bicicleta = mongoose.model('Bicicleta', bicicletaSchema);

module.exports = Bicicleta;