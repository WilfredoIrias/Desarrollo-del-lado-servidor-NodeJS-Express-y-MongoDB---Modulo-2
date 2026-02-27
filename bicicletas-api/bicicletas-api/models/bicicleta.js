const mongoose = require('mongoose');

const bicicletaSchema = new mongoose.Schema({
    code: {
        type: Number,
        required: [true, 'El código es obligatorio'],
        unique: true
    },
    color: {
        type: String,
        required: [true, 'El color es obligatorio']
    },
    modelo: {
        type: String,
        required: [true, 'El modelo es obligatorio']
    },
    ubicacion: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Las coordenadas son obligatorias']
        }
    }
});

module.exports = mongoose.model('Bicicleta', bicicletaSchema);