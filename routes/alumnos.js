const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { subirFoto } = require('../s3');
const { enviarEmail } = require('../sns');
const { crearSesion, buscarSesion, desactivarSesion } = require('../dynamo');

const upload = multer({ storage: multer.memoryStorage() });

function validarAlumno(a) {
    if (!a) return false;
    if (!a.nombres || typeof a.nombres !== 'string') return false;
    if (!a.apellidos || typeof a.apellidos !== 'string') return false;
    if (!a.matricula || typeof a.matricula !== 'string') return false;
    if (typeof a.promedio !== 'number' || a.promedio < 0) return false;
    return true;
}

function getRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// GET /alumnos
router.get('/', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM alumnos');
    res.status(200).json(rows);
});

// GET /alumnos/:id
router.get('/:id', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.status(200).json(rows[0]);
});

// POST /alumnos
router.post('/', async (req, res) => {
    const a = req.body;
    if (!validarAlumno(a)) return res.status(400).json({ error: 'Datos inválidos' });

    const [result] = await pool.execute(
        'INSERT INTO alumnos (nombres, apellidos, matricula, promedio, password) VALUES (?, ?, ?, ?, ?)',
        [a.nombres, a.apellidos, a.matricula, a.promedio, a.password || '']
    );

    const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
});

// PUT /alumnos/:id
router.put('/:id', async (req, res) => {
    const a = req.body;
    if (!validarAlumno(a)) return res.status(400).json({ error: 'Datos inválidos' });

    const [check] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    if (check.length === 0) return res.status(404).json({ error: 'No encontrado' });

    await pool.execute(
        'UPDATE alumnos SET nombres=?, apellidos=?, matricula=?, promedio=? WHERE id=?',
        [a.nombres, a.apellidos, a.matricula, a.promedio, req.params.id]
    );

    const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    res.status(200).json(rows[0]);
});

// DELETE /alumnos/:id
router.delete('/:id', async (req, res) => {
    const [check] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    if (check.length === 0) return res.status(404).json({ error: 'No encontrado' });

    await pool.execute('DELETE FROM alumnos WHERE id = ?', [req.params.id]);
    res.status(200).json({});
});

// Bloquear DELETE /alumnos
router.delete('/', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

// POST /alumnos/:id/fotoPerfil
router.post('/:id/fotoPerfil', upload.single('foto'), async (req, res) => {
    const [check] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    if (check.length === 0) return res.status(404).json({ error: 'No encontrado' });

    const file = req.file;
    const filename = `fotos/${req.params.id}-${uuidv4()}.jpg`;
    const url = await subirFoto(file.buffer, filename, file.mimetype);

    await pool.execute('UPDATE alumnos SET fotoPerfilUrl=? WHERE id=?', [url, req.params.id]);

    res.status(200).json({ fotoPerfilUrl: url });
});

// POST /alumnos/:id/email
router.post('/:id/email', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });

    await enviarEmail(rows[0]);
    res.status(200).json({ message: 'Email enviado' });
});

// POST /alumnos/:id/session/login
router.post('/:id/session/login', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });

    const alumno = rows[0];
    if (alumno.password !== req.body.password) {
        return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const sessionString = getRandomString(128);
    const sesion = await crearSesion(alumno.id, sessionString);
    res.status(200).json(sesion);
});

// POST /alumnos/:id/session/verify
router.post('/:id/session/verify', async (req, res) => {
    const sesion = await buscarSesion(parseInt(req.params.id), req.body.sessionString);
    if (!sesion || !sesion.active) {
        return res.status(400).json({ error: 'Sesión inválida' });
    }
    res.status(200).json(sesion);
});

// POST /alumnos/:id/session/logout
router.post('/:id/session/logout', async (req, res) => {
    const sesion = await buscarSesion(parseInt(req.params.id), req.body.sessionString);
    if (!sesion) return res.status(400).json({ error: 'Sesión no encontrada' });

    await desactivarSesion(sesion.id);
    res.status(200).json({ message: 'Sesión cerrada' });
});

module.exports = router;