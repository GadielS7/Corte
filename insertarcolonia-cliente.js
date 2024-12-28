const mysql = require('mysql2');

// Configuración de la base de datos de origen (MariaDB)
const dbOrigen = mysql.createConnection({
  host: 'localhost',    // Dirección del servidor de la base de datos de origen
  user: 'root',           // Usuario de la base de datos de origen
  password: 'Bankai12@',  // Contraseña de la base de datos de origen
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
    const [resultados] = await dbOrigen.promise().query('SELECT nombre, telefono,id_colonia FROM cliente');

    // Insertar cada cliente en la base de datos de destino
    for (let cliente of resultados) {
      await dbDestino.promise().query(
        'INSERT INTO clientes (nombre, telefono, colonia_id) VALUES (?, ?, ?)',
        [cliente.nombre, cliente.telefono, cliente.id_colonia]
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
