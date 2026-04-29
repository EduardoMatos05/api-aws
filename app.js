require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDB } = require('./db');



const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const alumnosRouter = require('./routes/alumnos');
const profesoresRouter = require('./routes/profesores');


app.use('/alumnos', alumnosRouter);
app.use('/profesores', profesoresRouter);

// 404 global
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 8080;

// Iniciar DB y luego servidor
initDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al inicializar DB:', err);
    process.exit(1);
});
