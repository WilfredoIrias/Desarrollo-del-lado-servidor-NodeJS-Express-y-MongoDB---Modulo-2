const express = require('express');
const mongoose = require('mongoose');
const Bicicleta = require('./models/bicicleta');

const app = express();
const PORT = 3000;
const MONGODB_URI = 'mongodb://localhost:27017/red_bicicletas';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB - red_bicicletas');
        inicializarDatos();
    })
    .catch(err => console.error('❌ Error conectando a MongoDB:', err));

async function inicializarDatos() {
    try {
        const count = await Bicicleta.countDocuments();
        if (count === 0) {
            await Bicicleta.insertMany([
                { color: 'Rojo', modelo: 'Urbana', ubicacion: [41.3879, 2.1699] },
                { color: 'Azul', modelo: 'Montana', ubicacion: [41.3825, 2.1769] },
                { color: 'Verde', modelo: 'Plegable', ubicacion: [41.3851, 2.1734] },
                { color: 'Negro', modelo: 'Electrica', ubicacion: [41.3888, 2.1580] }
            ]);
            console.log('📦 Datos iniciales cargados en MongoDB');
        }
    } catch (error) {
        console.error('Error inicializando datos:', error);
    }
}

app.get('/', (req, res) => {
    const mensaje = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Bienvenido a Express - BikeAPI</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 3rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            h1 { font-size: 3.5em; margin-bottom: 20px; }
            h2 { font-size: 2em; margin-bottom: 30px; }
            .links { margin-top: 30px; }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                margin: 10px;
                background: white;
                color: #667eea;
                text-decoration: none;
                border-radius: 50px;
                font-weight: bold;
                transition: transform 0.3s;
            }
            .btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚲 BIKEAPI</h1>
            <h2>¡Bienvenido a Express con MongoDB!</h2>
            <p>Servidor funcionando correctamente</p>
            <p>Base de datos: red_bicicletas</p>
            <div class="links">
                <a href="/mapa" class="btn">🗺️ Ver Mapa de Bicicletas</a>
                <a href="/api/bicicletas" class="btn">📡 Ver API</a>
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(mensaje);
});

app.get('/mapa', async (req, res) => {
    try {
        const bicicletas = await Bicicleta.find();

        const mapaHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mapa de Bicicletas - Barcelona</title>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; }
                #header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                #map { height: calc(100vh - 120px); width: 100%; }
                .info {
                    background: rgba(0,0,0,0.1);
                    padding: 5px 15px;
                    border-radius: 20px;
                    display: inline-block;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div id="header">
                <h1>🗺️ Bicicletas Disponibles - Barcelona</h1>
                <div class="info">Total: ${bicicletas.length} bicicletas</div>
            </div>
            <div id="map"></div>

            <script>
                const map = L.map('map').setView([41.3851, 2.1734], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                const bikeIcon = L.icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40]
                });

                const centerIcon = L.icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                    popupAnchor: [0, -30]
                });

                L.marker([41.3851, 2.1734], {icon: centerIcon})
                    .addTo(map)
                    .bindPopup('<b>Centro de Barcelona</b><br>Plaça Catalunya');

                const bicicletas = ${JSON.stringify(bicicletas)};

                bicicletas.forEach(bici => {
                    const marker = L.marker(bici.ubicacion, {icon: bikeIcon}).addTo(map);
                    marker.bindPopup(\`
                        <b>🚲 Bicicleta</b><br>
                        ID: \${bici._id.substring(0,8)}...<br>
                        Color: \${bici.color}<br>
                        Modelo: \${bici.modelo}<br>
                    \`);
                });

                L.circle([41.3851, 2.1734], {
                    color: '#667eea',
                    fillColor: '#764ba2',
                    fillOpacity: 0.1,
                    radius: 500
                }).addTo(map).bindTooltip('Zona Centro');
            </script>
        </body>
        </html>
        `;

        res.send(mapaHTML);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/bicicletas', async (req, res) => {
    try {
        const bicicletas = await Bicicleta.find();
        res.json({
            success: true,
            data: bicicletas,
            total: bicicletas.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bicicletas/:id', async (req, res) => {
    try {
        const bici = await Bicicleta.findById(req.params.id);
        if (bici) {
            res.json({ success: true, data: bici });
        } else {
            res.status(404).json({
                success: false,
                error: 'Bicicleta no encontrada'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/bicicletas', async (req, res) => {
    try {
        const { color, modelo, lat, lng } = req.body;

        if (!color || !modelo || !lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Faltan datos requeridos (color, modelo, lat, lng)'
            });
        }

        const nuevaBici = new Bicicleta({
            color,
            modelo,
            ubicacion: [parseFloat(lat), parseFloat(lng)]
        });

        await nuevaBici.save();

        res.status(201).json({
            success: true,
            data: nuevaBici,
            message: 'Bicicleta creada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/bicicletas/:id', async (req, res) => {
    try {
        const { color, modelo, lat, lng } = req.body;

        const datosActualizados = {};
        if (color) datosActualizados.color = color;
        if (modelo) datosActualizados.modelo = modelo;
        if (lat && lng) datosActualizados.ubicacion = [parseFloat(lat), parseFloat(lng)];

        const biciActualizada = await Bicicleta.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { new: true, runValidators: true }
        );

        if (biciActualizada) {
            res.json({
                success: true,
                data: biciActualizada,
                message: 'Bicicleta actualizada exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Bicicleta no encontrada'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/bicicletas/:id', async (req, res) => {
    try {
        const eliminado = await Bicicleta.findByIdAndDelete(req.params.id);

        if (eliminado) {
            res.json({
                success: true,
                message: 'Bicicleta eliminada exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Bicicleta no encontrada'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('\n=================================');
        console.log('🚲 SERVIDOR INICIADO CORRECTAMENTE');
        console.log('=================================');
        console.log(`📍 URL Local: http://localhost:${PORT}`);
        console.log(`🗺️  Mapa: http://localhost:${PORT}/mapa`);
        console.log(`📡 API: http://localhost:${PORT}/api/bicicletas`);
        console.log(`📊 MongoDB: red_bicicletas`);
        console.log('=================================\n');
    });
}

module.exports = app;