const express = require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');

// Ruta para mostrar la lista de enlaces
router.get('/', isLoggedIn, async (req, res) => {
    const enlace= await pool.query('SELECT *FROM mikrotik');
    res.render('enlaces/main',{enlace});
});

// Ruta para añadir un nuevo enlace
router.get('/add', isLoggedIn, async(req, res) => {
    res.render('enlaces/add');
});

// Ruta para guardar un nuevo enlace
router.post('/add', isLoggedIn, async(req, res) => {
    const { nombre, enlace } = req.body;
        
        // Crea una consulta SQL con parámetros
        const query = `
            INSERT INTO mikrotik (nombre, enlace)
            VALUES (?, ?)
        `;
        
        const values = [nombre, enlace];
        
        try {
            // Ejecuta la consulta con los valores
            await pool.query(query, values);
            req.flash('success', 'El mikrotik se registro con exito');
            res.redirect('/enlaces');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al insertar los datos');
        }
});

router.get('/delete/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    pool.query('DELETE FROM mikrotik WHERE ID = ?', [id]);
    req.flash('success','Mikrotik Removido Satisfactoriamente');
    res.redirect('/enlaces');
});


router.post('/edit', isLoggedIn, async (req, res) => {
    const { id, nombre, enlace } = req.body;

    if (!id || !nombre || !enlace) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    try {
        const query = 'UPDATE mikrotik SET nombre = ?, enlace = ? WHERE id = ?';
        const result = await pool.query(query, [nombre, enlace, id]);

        if (result.affectedRows === 1) {
            res.json({ success: true, message: 'Colonia actualizada correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'No se encontró el enlace o no se pudo actualizar.' });
        }
    } catch (error) {
        console.error('Error al actualizar enlace:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});


module.exports = router;
