const mysql = require('mysql2');

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

// Función para transferir los datos de la tabla colonia
async function transferirColonias() {
  try {
    // Obtener los datos de la tabla colonia en la base de datos de origen
    const [resultados] = await dbOrigen.promise().query('SELECT id_colonia, colonia FROM colonia');

    // Insertar cada colonia en la base de datos de destino
    for (let colonia of resultados) {
      await dbDestino.promise().query(
        'INSERT INTO colonia (id, nombre) VALUES (?, ?)',
        [colonia.id, colonia.colonia]
      );
      console.log('Colonia insertada correctamente:', colonia.colonia);
    }
  } catch (err) {
    console.error('Error al transferir las colonias:', err);
  } finally {
    // Cerrar las conexiones
    dbOrigen.end();
    dbDestino.end();
  }
}

// Llamar a la función para transferir los datos
transferirColonias();
