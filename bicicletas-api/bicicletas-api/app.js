const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a MongoDB (PUNTO 7)
mongoose.connect('mongodb://localhost:27017/red_bicicletas', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', () => {
    console.log('✅ Conectado a MongoDB - base: red_bicicletas');
});

// Modelo Bicicleta (PUNTO 8)
const bicicletaSchema = new mongoose.Schema({
    code: { type: Number, required: true, unique: true },
    color: { type: String, required: true },
    modelo: { type: String, required: true },
    ubicacion: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    }
});

const Bicicleta = mongoose.model('Bicicleta', bicicletaSchema);

// ========== RUTAS DE LA API ==========

// CREATE - Crear bicicleta
app.post('/api/bicicletas', async (req, res) => {
    try {
        const bicicleta = new Bicicleta(req.body);
        await bicicleta.save();
        res.status(201).json(bicicleta);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// READ ALL - Obtener todas las bicicletas
app.get('/api/bicicletas', async (req, res) => {
    try {
        const bicicletas = await Bicicleta.find();
        res.json(bicicletas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ ONE - Obtener una bicicleta por código
app.get('/api/bicicletas/:code', async (req, res) => {
    try {
        const bicicleta = await Bicicleta.findOne({ code: req.params.code });
        if (!bicicleta) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        res.json(bicicleta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE - Actualizar bicicleta
app.put('/api/bicicletas/:code', async (req, res) => {
    try {
        const bicicleta = await Bicicleta.findOneAndUpdate(
            { code: req.params.code },
            req.body,
            { new: true, runValidators: true }
        );
        if (!bicicleta) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        res.json(bicicleta);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Eliminar bicicleta
app.delete('/api/bicicletas/:code', async (req, res) => {
    try {
        const bicicleta = await Bicicleta.findOneAndDelete({ code: req.params.code });
        if (!bicicleta) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        res.json({ message: 'Bicicleta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
if (require.main === module) {
    app.listen(port, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${port}`);
    });
}

module.exports = { app, Bicicleta };