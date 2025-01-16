const mysql = require('mysql2');


//insertar primero las colonias luego ajustar el id de las colonias a la BD original y luego ejecutar el ionsertar clientes colonia
//usar este archivo al final por si acaso insertar clientes;


// Configuración de la base de datos de origen (MariaDB)
const dbOrigen = mysql.createConnection({
  host: '100.64.0.5',    // Dirección del servidor de la base de datos de origen
  user: 'root',           // Usuario de la base de datos de origen
  password: 'solucionespc',  // Contraseña de la base de datos de origen
  database: 'soluciones_pc'  // Nombre de la base de datos de origen
});

// Configuración de la base de datos de destino (MySQL)
const dbDestino = mysql.createConnection({
  host: 'localhost',     // Dirección del servidor de la base de datos de destino
  user: 'root',          // Usuario de la base de datos de destino
  password: 'Bankai12@', // Contraseña de la base de datos de destino
  database: 'corte'      // Nombre de la base de datos de destino
});

// Función para obtener los clientes de la base de datos de origen y luego insertarlos en la base de datos de destino
async function transferirDatos() {
  try {
    // Obtener los clientes de la base de datos de origen
    const [resultados] = await dbOrigen.promise().query('SELECT nombre, telefono FROM cliente');

    // Insertar cada cliente en la base de datos de destino
    for (let cliente of resultados) {
      await dbDestino.promise().query(
        'INSERT INTO clientes (nombre, telefono) VALUES (?, ?)',
        [cliente.nombre, cliente.telefono]
      );
      console.log('Cliente insertado correctamente:', cliente.nombre);
    }
  } catch (err) {
    console.error('Error al transferir los datos:', err);
  } finally {
    // Cerrar las conexiones
    dbOrigen.end();
    dbDestino.end();
  }
}

// Llamar a la función para transferir los datos
transferirDatos();
