const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');

const { database } = require('./keys');
// Inicializaciones
const app = express();
require('./lib/passport');

const handlebars = require('handlebars');
// Configuración
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

// Configuración de Handlebars
app.engine('.hbs', exphbs.engine({ // Cambiar exphbs() por exphbs.engine()
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars') // Verifica que el archivo ./lib/handlebars exista
}));
app.set('view engine', '.hbs');
// Función para manejar la comparación para vista de edicion de clientes
handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if (v1 == v2) {
        return options.fn(this); // Si es igual, devuelve lo que está dentro de {{#ifCond}}
    }
    return options.inverse(this); // Si no es igual, devuelve el bloque invertido (vacío)
});
// Middlewares
app.use(session({
    secret: 'solucionespc',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));

app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// Variables globales
//app.use((req, res, next) => {
  //  app.locals.success = req.flash('success');
   // next();
//});

app.use((req, res, next) => {
    res.locals.success = req.flash('success'); // Para mensajes de éxito
    res.locals.message = req.flash('message');     // Opcional, para mensajes de error
    app.locals.user = req.user;
    next();
});
// Routes
app.use(require('./routes/'));
app.use(require('./routes/authentication'));
app.use('/mikrotik',require('./routes/mikrotik'));
app.use('/enlaces', require('./routes/enlaces'));
app.use('/colonia', require('./routes/colonia'));



// Public
app.use(express.static(path.join(__dirname,'public')));

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});
