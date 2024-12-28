const express = require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');

// Ruta para mostrar la lista de enlaces
router.get('/', isLoggedIn, async (req, res) => {
    const colonia= await pool.query('SELECT *FROM colonia');
    res.render('colonia/main',{colonia});
});

// Ruta para añadir un nuevo enlace
router.get('/add', isLoggedIn, async(req, res) => {
    res.render('colonia/add');
});

// Ruta para guardar un nuevo enlace
router.post('/add', isLoggedIn,  async(req, res) => {
    const { nombre, enlace } = req.body;
        
        // Crea una consulta SQL con parámetros
        const query = `
            INSERT INTO colonia (nombre)
            VALUES (?)
        `;
        
        const values = [nombre];
        
        try {
            // Ejecuta la consulta con los valores
            await pool.query(query, values);
            req.flash('success', 'La Colonia se registro con exito');
            res.redirect('/colonia');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al insertar los datos');
        }
});

router.get('/delete/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    pool.query('DELETE FROM colonia WHERE ID = ?', [id]);
    req.flash('success','Colonia Removido Satisfactoriamente');
    res.redirect('/colonia');
});

/*router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const colonia = await pool.query('SELECT * FROM colonia WHERE id = ?', [id]);

    // Enviar los datos como respuesta JSON
    res.json(colonia);
});
*/
/*router.get('/edit/:id', async (req, res)=>{
    const {id} = req.params;
    const colonia = await pool.query('SELECT *FROM colonia WHERE id=?',[id]);
    res.render('/colonia', {colonia:colonia[0]});
});
*/
/*router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const colonia = await pool.query('SELECT * FROM colonia WHERE id = ?', [id]);
        if (colonia.length === 0) {
            return res.status(404).json({ error: 'Colonia no encontrada' });
        }
        res.render('colonia/main', { colonia: colonia[0] }); // Renderiza la vista y pasa los datos de la colonia
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos de la colonia' });
    }
});*/

router.post('/edit', isLoggedIn, async (req, res) => {
    const { id, nombre } = req.body;

    try {
        await pool.query('UPDATE colonia SET nombre = ? WHERE id = ?', [nombre, id]);
        res.json({ success: true, message: 'Colonia actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al actualizar la colonia' });
    }
});





module.exports = router;
