const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// ENDPOINTS DE INVENTARIO (CRUD)
// ==========================================

// Obtener todo el inventario
app.get('/api/inventario', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.id, i.codigo, i.nombre, i.descripcion, i.estado, i.valor_estimado, c.nombre as categoria 
            FROM inventario i 
            LEFT JOIN categorias_inventario c ON i.categoria_id = c.id
            ORDER BY i.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un activo de inventario
app.post('/api/inventario', async (req, res) => {
    const { codigo, nombre, descripcion, categoria_id, valor_estimado, estado } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO inventario (codigo, nombre, descripcion, categoria_id, valor_estimado, estado, fecha_adquisicion) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
            [codigo, nombre, descripcion, categoria_id || 1, valor_estimado, estado || 'Bueno']
        );
        res.status(201).json({ id: result.insertId, message: 'Activo creado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un activo (Ej. estado)
app.put('/api/inventario/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await db.query('UPDATE inventario SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: 'Activo actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un activo
app.delete('/api/inventario/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM inventario WHERE id = ?', [id]);
        res.json({ message: 'Activo eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ENDPOINTS DE TICKETS DE SOPORTE (CRUD)
// ==========================================

// Obtener todos los tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, u.nombre as creador, c.nombre as cancha_nombre 
            FROM tickets_soporte t 
            LEFT JOIN usuarios u ON t.usuario_reporta_id = u.id 
            LEFT JOIN canchas c ON t.cancha_asociada_id = c.id
            ORDER BY t.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un ticket
app.post('/api/tickets', async (req, res) => {
    const { titulo, descripcion, usuario_reporta_id, prioridad } = req.body;
    const codigo = 'TKT-' + Math.floor(Math.random() * 9000 + 1000);
    try {
        const [result] = await db.query(
            'INSERT INTO tickets_soporte (codigo, titulo, descripcion, usuario_reporta_id, prioridad, estado) VALUES (?, ?, ?, ?, ?, ?)',
            [codigo, titulo, descripcion, usuario_reporta_id || 2, prioridad || 'Media', 'Abierto']
        );
        res.status(201).json({ id: result.insertId, codigo, message: 'Ticket creado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar estado de ticket (Ej. Resuelto o En Progreso)
app.put('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await db.query('UPDATE tickets_soporte SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: 'Ticket actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ENDPOINTS DE RESERVAS
// ==========================================

// Obtener reservas
app.get('/api/reservas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reservas ORDER BY fecha_reserva DESC, hora_inicio ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(\`Servidor GestiCanchas API corriendo en http://localhost:\${port}\`);
});
