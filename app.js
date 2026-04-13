const express = require('express');
const app = express();

app.use(express.json());

const path = require('path');

// frontend (carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// ====== DATA EN MEMORIA ======
let alumnos = [];
let profesores = [];

// ====== VALIDACIONES ======
function validarAlumno(a) {
    if (!a) return false;
    if (typeof a.id !== 'number') return false;
    if (!a.nombres || typeof a.nombres !== 'string') return false;
    if (!a.apellidos || typeof a.apellidos !== 'string') return false;
    if (!a.matricula || typeof a.matricula !== 'string') return false;
    if (typeof a.promedio !== 'number' || a.promedio < 0) return false;
    return true;
}

function validarProfesor(p) {
    if (!p) return false;
    if (typeof p.id !== 'number') return false;
    if (!p.nombres || typeof p.nombres !== 'string') return false;
    if (!p.apellidos || typeof p.apellidos !== 'string') return false;
    if (typeof p.numeroEmpleado !== 'number' || p.numeroEmpleado < 0) return false;
    if (typeof p.horasClase !== 'number' || p.horasClase < 0) return false;
    return true;
}

// ====== ALUMNOS ======

app.get('/alumnos', (req, res) => {
    res.status(200).json(alumnos);
});

app.get('/alumnos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const alumno = alumnos.find(a => a.id === id);
    if (!alumno) return res.status(404).json({ error: 'No encontrado' });
    res.status(200).json(alumno);
});

app.post('/alumnos', (req, res) => {
    const alumno = req.body;

    if (!validarAlumno(alumno)) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    alumnos.push(alumno);
    res.status(201).json(alumno);
});

app.put('/alumnos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = alumnos.findIndex(a => a.id === id);

    if (index === -1) return res.status(404).json({ error: 'No encontrado' });

    if (!validarAlumno(req.body)) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    alumnos[index] = req.body;
    res.status(200).json(req.body);
});

app.delete('/alumnos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = alumnos.findIndex(a => a.id === id);

    if (index === -1) return res.status(404).json({ error: 'No encontrado' });

    alumnos.splice(index, 1);
    res.status(200).json({});
});

// bloquear DELETE /alumnos
app.delete('/alumnos', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

// ====== PROFESORES ======

app.get('/profesores', (req, res) => {
    res.status(200).json(profesores);
});

app.get('/profesores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const profesor = profesores.find(p => p.id === id);

    if (!profesor) return res.status(404).json({ error: 'No encontrado' });

    res.status(200).json(profesor);
});

app.post('/profesores', (req, res) => {
    const profesor = req.body;

    if (!validarProfesor(profesor)) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    profesores.push(profesor);
    res.status(201).json(profesor);
});

app.put('/profesores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = profesores.findIndex(p => p.id === id);

    if (index === -1) return res.status(404).json({ error: 'No encontrado' });

    if (!validarProfesor(req.body)) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    profesores[index] = req.body;
    res.status(200).json(req.body);
});

app.delete('/profesores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = profesores.findIndex(p => p.id === id);

    if (index === -1) return res.status(404).json({ error: 'No encontrado' });

    profesores.splice(index, 1);
    res.status(200).json({});
});

// bloquear DELETE /profesores
app.delete('/profesores', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

// ====== 404 GLOBAL ======
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ====== SERVER ======
app.listen(8080, () => {
    console.log('Servidor corriendo en puerto 8080');
});