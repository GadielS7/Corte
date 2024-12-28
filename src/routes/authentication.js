const express= require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');

const bcrypt= require ('bcryptjs');
const {isLoggedIn, isNotLoggedIn} = require('../lib/auth');

//router.get('/signup',(req,res)=>{
   // res.render('auth/usuarios')
//});

// Ruta para mostrar el formulario de registro y la tabla de usuarios
router.get('/signup', isLoggedIn, async (req, res) => {
    try {
        // Obtener la información de los usuarios desde la base de datos
        const usuarios = await pool.query('SELECT id, nombre, username FROM users'); // Asegúrate de que la consulta sea correcta según tu base de datos

        // Renderizar la vista y pasar los datos de los usuarios
        res.render('auth/usuarios', { usuarios });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        req.flash('error', 'Error al cargar los usuarios.');
    }
});


/*router.post('/signup',(req,res)=>{
    passport.authenticate('local.signup',{
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    })
    res.send('received');
});
*/

router.get('/edit/:id',async (req,res)=>{
    const{id} = req.params;
    const usuarios = await pool.query('SELECT *FROM users WHERE id = ?', [id]);
    res.render('auth/edit', {usuarios:usuarios[0]});
})

/*router.post('/edit/:id',async(req,res)=>{
    const {id} = req.params;
    const {nombre, username, password}= req.body;
    const newUser ={
        nombre,
        username,
        password
    };
    await pool.query('UPDATE users set ? WHERE id = ?',[newUser,id]);
    res.redirect('/signup');
});
*/

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, username, password } = req.body;

    // Crea un objeto para almacenar los campos que se van a actualizar
    const updatedFields = {};

    // Solo agrega los campos que están presentes en la solicitud
    if (nombre) {
        updatedFields.nombre = nombre;
    }
    if (username) {
        updatedFields.username = username;
    }
    if (password) {
        // Si se proporciona una nueva contraseña, encripta la contraseña
        updatedFields.password = await bcrypt.hash(password, 10); // Asegúrate de tener bcrypt instalado
    }

    // Verifica si hay campos para actualizar
    if (Object.keys(updatedFields).length > 0) {
        await pool.query('UPDATE users SET ? WHERE id = ?', [updatedFields, id]);
    }

    req.flash('success', 'Usuario actualizado correctamente.');
    res.redirect('/signup'); // Redirige a la página de usuarios
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar el usuario.' });
    }
});

router.post('/signup',passport.authenticate('local.signup',{
        successRedirect: '/mikrotik',
        failureRedirect: '/signup',
        failureFlash: true
}))

router.get('/signin', isNotLoggedIn,(req,res)=>{
    res.render('auth/signin');
});

router.post('/signin',(req,res,next)=>{
    passport.authenticate('local.signin',{
        successRedirect: '/mikrotik',
        failureRedirect: '/signin',
        failureFlash: true
    })(req,res,next);
});



// Ruta para cerrar sesión
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/signin'); // Redirigir a una página de error o perfil
        }
        res.redirect('/signin'); // Redirigir a la página de inicio de sesión
    });
});

module.exports= router