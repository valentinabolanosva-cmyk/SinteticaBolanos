const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor GestiCanchas funcionando correctamente.' });
});

// Arrancar el servidor
app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
    console.log('NOTA: Conecta tu base de datos MySQL usando el archivo backend/database/db_sintetica_bolanos.sql');
});
