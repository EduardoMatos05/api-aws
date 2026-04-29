const express = require('express');
const router = express.Router();
const { pool } = require('../db');

function validarProfesor(p) {
    if (!p) return false;
    if (!p.nombres || typeof p.nombres !== 'string') return false;
    if (!p.apellidos || typeof p.apellidos !== 'string') return false;
    if (typeof p.numeroEmpleado !== 'number' || p.numeroEmpleado < 0) return false;
    if (typeof p.horasClase !== 'number' || p.horasClase < 0) return false;
    return true;
}

router.get('/', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM profesores');
    res.status(200).json(rows);
});

router.get('/:id', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM profesores WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.status(200).json(rows[0]);
});

router.post('/', async (req, res) => {
    const p = req.body;
    if (!validarProfesor(p)) return res.status(400).json({ error: 'Datos inválidos' });
    const [result] = await pool.execute(
        'INSERT INTO profesores (nombres, apellidos, numeroEmpleado, horasClase) VALUES (?, ?, ?, ?)',
        [p.nombres, p.apellidos, p.numeroEmpleado, p.horasClase]
    );
    const [rows] = await pool.execute('SELECT * FROM profesores WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
    const p = req.body;
    if (!validarProfesor(p)) return res.status(400).json({ error: 'Datos inválidos' });
    const [check] = await pool.execute('SELECT * FROM profesores WHERE id = ?', [req.params.id]);
    if (check.length === 0) return res.status(404).json({ error: 'No encontrado' });
    await pool.execute(
        'UPDATE profesores SET nombres=?, apellidos=?, numeroEmpleado=?, horasClase=? WHERE id=?',
        [p.nombres, p.apellidos, p.numeroEmpleado, p.horasClase, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM profesores WHERE id = ?', [req.params.id]);
    res.status(200).json(rows[0]);
});

router.delete('/:id', async (req, res) => {
    const [check] = await pool.execute('SELECT * FROM profesores WHERE id = ?', [req.params.id]);
    if (check.length === 0) return res.status(404).json({ error: 'No encontrado' });
    await pool.execute('DELETE FROM profesores WHERE id = ?', [req.params.id]);
    res.status(200).json({});
});

router.delete('/', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

module.exports = router;