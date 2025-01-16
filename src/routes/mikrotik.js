const express= require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');

router.get('/add', isLoggedIn,(req,res)=>{
    res.render('mikrotik/add');
});


router.post('/add', isLoggedIn, async (req,res)=>{
    const { nombre, telefono, megas_subida, megas_bajada, ip, comentarios, colonia, mikrotik, estado } = req.body;
    
    // Crea una consulta SQL con parámetros
    const query = `
        INSERT INTO clientes (nombre, telefono, megas_subida, megas_bajada, ip, comentarios, colonia_id, mikrotik_id, estado_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [nombre, telefono, megas_subida, megas_bajada, ip, comentarios, colonia, mikrotik, estado];
    
    try {
        // Ejecuta la consulta con los valores
        await pool.query(query, values);
        req.flash('success', 'El Cliente Se Registro Correctamente');
        res.redirect('/mikrotik');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al insertar los datos');
    }
});

/*router.get('/', async (req, res)=>{
    const mikrotik= await pool.query('SELECT *FROM clientes');
    res.render('mikrotik/main', {mikrotik});
    const mikrotiks = await pool.query('SELECT id, nombre FROM mikrotik'); // Ajusta el query según tu tabla
    res.render('/', { mikrotiks }); // Enviar datos a la vista
})*/

  
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const totalActivos = await pool.query('SELECT COUNT(*) AS total FROM clientes WHERE estado_id = 1');

        // Obtener solo los primeros 10 registros para la carga inicial
        const mikrotikData = await pool.query(`
            SELECT 
                c.*, 
                col.nombre AS colonia_nombre,
                m.nombre AS mikrotik_nombre,
                m.enlace AS mikrotik_enlace,
                est.nombre AS estado_nombre,
                CASE 
                    WHEN c.estado_id = 1 THEN '<i class="fa fa-circle text-success" title="Activo"></i>'
                    ELSE '<i class="fa fa-circle text-danger" title="Inactivo"></i>'
                END AS estado_icono
            FROM clientes c
            LEFT JOIN colonia col ON c.colonia_id = col.id
            LEFT JOIN mikrotik m ON c.mikrotik_id = m.id
            LEFT JOIN estado est ON c.estado_id = est.id
            LIMIT 10
        `);

        const mikrotiks = await pool.query('SELECT id, nombre FROM mikrotik');
        const estado = await pool.query('SELECT id, nombre FROM estado');
        const colonia = await pool.query('SELECT id, nombre FROM colonia');

        res.render('mikrotik/main', {
            mikrotik: mikrotikData,
            mikrotiks,
            estado,
            colonia,
            totalActivos: totalActivos[0].total
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar los datos');
    }
});

//busqueda
// Controlador para búsqueda en tiempo real
router.get('/search', isLoggedIn, async (req, res) => {
    const { query } = req.query; // Captura el término de búsqueda
    try {
        const searchQuery = `
            SELECT 
                c.*, 
                col.nombre AS colonia_nombre,
                m.nombre AS mikrotik_nombre,
                m.enlace AS mikrotik_enlace,
                est.nombre AS estado_nombre,
                CASE 
                    WHEN c.estado_id = 1 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                    WHEN c.estado_id = 2 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                    WHEN c.estado_id = 3 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="yellow" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                END AS estado_icono
            FROM clientes c
            LEFT JOIN colonia col ON c.colonia_id = col.id
            LEFT JOIN mikrotik m ON c.mikrotik_id = m.id
            LEFT JOIN estado est ON c.estado_id = est.id
            WHERE c.nombre LIKE ? OR c.telefono LIKE ?
            LIMIT 10
        `;

        const values = [`%${query}%`, `%${query}%`]; // Busca por nombre o teléfono
        const results = await pool.query(searchQuery, values);

        res.json(results); // Devuelve los resultados como JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
});


//
router.get('/paginar', isLoggedIn, async (req, res) => {
    try {
        const { page = 1, limit = 10, estado_id, mikrotik_id } = req.query; // Captura los parámetros de paginación y filtro
        const offset = (page - 1) * limit;

          // Initialize the WHERE clause
          let whereClause = '';
          const queryParams = [];
  
          // Handle the "sin mikrotik" filter
          if (estado_id === 'sin_mikrotik') {
              whereClause = 'WHERE c.mikrotik_id IS NULL';
          } else {
              // If estado_id is provided, add it to the WHERE clause
              if (estado_id) {
                  whereClause += whereClause ? ' AND c.estado_id = ?' : 'WHERE c.estado_id = ?';
                  queryParams.push(estado_id);
              }
  
              // Handle the Mikrotik filter
              if (mikrotik_id && mikrotik_id !== 'sin_mikrotik') {
                  whereClause += whereClause ? ' AND c.mikrotik_id = ?' : 'WHERE c.mikrotik_id = ?';
                  queryParams.push(mikrotik_id);
              }
          }
  
          // Add pagination parameters
          queryParams.push(parseInt(limit), parseInt(offset));

        // Consulta para obtener los datos paginados (incluyendo clientes sin mikrotik_id si es el caso)
        const mikrotikData = await pool.query(`
            SELECT 
                c.*, 
                col.nombre AS colonia_nombre,
                m.nombre AS mikrotik_nombre,
                m.enlace AS mikrotik_enlace,
                est.nombre AS estado_nombre,
                CASE 
                    WHEN c.estado_id = 1 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                    WHEN c.estado_id = 2 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                    WHEN c.estado_id = 3 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="yellow" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                END AS estado_icono
            FROM clientes c
            LEFT JOIN colonia col ON c.colonia_id = col.id
            LEFT JOIN mikrotik m ON c.mikrotik_id = m.id
            LEFT JOIN estado est ON c.estado_id = est.id
            ${whereClause}
            LIMIT ? OFFSET ?`, queryParams);

        // Consulta para obtener el total de registros
        const totalCountResult = await pool.query(`
            SELECT COUNT(*) AS totalCount
            FROM clientes c
            LEFT JOIN colonia col ON c.colonia_id = col.id
            LEFT JOIN mikrotik m ON c.mikrotik_id = m.id
            LEFT JOIN estado est ON c.estado_id = est.id
            ${whereClause}`, queryParams);

        const totalRecords = totalCountResult[0].totalCount;
        const totalPages = Math.ceil(totalRecords / limit); // Calcular el total de páginas
        
        
        // Consulta para contar clientes activos (estado_id = 1)
        const totalActivosResult = await pool.query(`
            SELECT COUNT(*) AS totalActivos
            FROM clientes c
            WHERE c.estado_id = 1`);
        const totalActivos = totalActivosResult[0].totalActivos;

        // Consulta para contar clientes inactivos (estado_id = 2)
        const totalInactivosResult = await pool.query(`
            SELECT COUNT(*) AS totalInactivos
            FROM clientes c
            WHERE c.estado_id = 2`);
        const totalInactivos = totalInactivosResult[0].totalInactivos;

        // Consulta para contar clientes dados de baja (estado_id = 3)
        const totalBajaResult = await pool.query(`
            SELECT COUNT(*) AS totalBaja
            FROM clientes c
            WHERE c.estado_id = 3`);
        const totalBaja = totalBajaResult[0].totalBaja;

        // Consulta para contar clientes sin mikrotik_id (mikrotik_id = NULL)
        const totalSinMikrotikResult = await pool.query(`
            SELECT COUNT(*) AS totalSinMikrotik
            FROM clientes c
            WHERE c.mikrotik_id IS NULL`);
        const totalSinMikrotik = totalSinMikrotikResult[0].totalSinMikrotik;

        // Inicializar las sumas
    let totalMegasSubida = 0;
    let totalMegasBajada = 0;

    // Sumar los megas de subida y bajada
    mikrotikData.forEach(cliente => {
        if (cliente.estado_id === 1) {  // Solo clientes activos
            if (cliente.megas_subida) {
                totalMegasSubida += parseMegas(cliente.megas_subida);
            }
            if (cliente.megas_bajada) {
                totalMegasBajada += parseMegas(cliente.megas_bajada);
            }
        }
    });

        // Respuesta con los datos obtenidos
        res.json({
            data: mikrotikData,
            totalPages: totalPages,
            totalActivos: totalActivos,
            totalInactivos: totalInactivos,
            totalCount: totalRecords,
            totalBaja: totalBaja,
            totalSinMikrotik: totalSinMikrotik, // Devolver el conteo de clientes sin mikrotik
            totalMegasSubida, // Agregar la suma de megas de subida
            totalMegasBajada   // Agregar la suma de megas de bajada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar los datos paginados' });
    }
});

// Función para convertir megas a un número
function parseMegas(megas) {
    const value = parseFloat(megas);
    const unit = megas.slice(-1).toUpperCase(); // Obtener la última letra (M o K)

    if (unit === 'M') {
        return value; // Megas se quedan como están
    } else if (unit === 'K') {
        return value / 1024; // Convertir K a M
    }
    return 0; // Si no es M o K, retornar 0
}

router.get('/delete/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    pool.query('DELETE FROM clientes WHERE ID = ?', [id]);
    req.flash('success','Cliente Removido Satisfactoriamente');
    res.redirect('/mikrotik');
});

/*router.get('/edit/:id', async (req, res)=>{
    const {id} = req.params;
    const mikrotik = await pool.query('SELECT *FROM clientes WHERE id=?',[id]);
    res.render('/mikrotik', {mikrotik:mikrotik[0]});
});
*/
router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    try {
        // Consulta el cliente específico
        const clientes = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);

        // Consulta las opciones de colonia, mikrotik y estado
        const colonias = await pool.query('SELECT id, nombre FROM colonia');
        const mikrotiks = await pool.query('SELECT id, nombre FROM mikrotik');
        const estados = await pool.query('SELECT id, nombre FROM estado');

        // Renderiza la vista con todos los datos necesarios
        res.render('mikrotik/edit', {
            clientes: clientes[0], // Cliente seleccionado
            colonias, // Lista de colonias
            mikrotiks, // Lista de Mikrotiks
            estados // Lista de estados
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar los datos para la edición');
    }
});

/*router.get('/edit/:id', async (req, res)=>{
    const {id} = req.params;
    const { nombre, telefono, megas_subida, megas_bajada, ip, comentarios, colonia, mikrotik, estado } = req.body;
    const newMikrotik={
        nombre,
        telefono,
        megas_subida,
        megas_bajada,
        ip,
        comentarios,
        colonia,
        mikrotik,
        estado
    };
    console.log(newMikrotik);
    await pool.query('UPDATE clientes set ? WHERE id =?', [newMikrotik, id]);
    res.redirect('/mikrotik');
});
*/
router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params; 
    const { nombre, telefono, megas_subida, megas_bajada, ip, comentarios, colonia, mikrotik, estado } = req.body;

    // Crear un array para los pares clave-valor y los valores
    const updates = [];
    const values = [];

    // Agregar solo los campos definidos a la consulta
    if (nombre) {
        updates.push('nombre = ?');
        values.push(nombre);
    }
    if (telefono) {
        updates.push('telefono = ?');
        values.push(telefono);
    }
    if (megas_subida) {
        updates.push('megas_subida = ?');
        values.push(megas_subida);
    }
    if (megas_bajada) {
        updates.push('megas_bajada = ?');
        values.push(megas_bajada);
    }
    if (ip) {
        updates.push('ip = ?');
        values.push(ip);
    }
    if (comentarios) {
        updates.push('comentarios = ?');
        values.push(comentarios);
    }
    if (colonia) {
        updates.push('colonia_id = ?');
        values.push(colonia);
    }
    if (mikrotik) {
        updates.push('mikrotik_id = ?');
        values.push(mikrotik);
    }
    if (estado) {
        updates.push('estado_id = ?');
        values.push(estado);
    }

    // Asegurarse de que hay algo que actualizar
    if (updates.length === 0) {
        req.flash('error', 'No se proporcionaron datos para actualizar');
        return res.redirect('/mikrotik');
    }

    // Construir la consulta dinámica
    const query = `
        UPDATE clientes 
        SET ${updates.join(', ')}
        WHERE id = ?
    `;

    // Agregar el ID al final de los valores
    values.push(id);

    try {
        await pool.query(query, values);
        req.flash('success', 'Cliente Actualizado Satisfactoriamente');
        res.redirect('/mikrotik');
    } catch (error) {
        console.error(error); // Mostrar el error en la consola para depuración
        res.status(500).send('Error al actualizar los datos');
    }
});

/*
router.get('/filtrar', async (req, res) => {
    const { estado_id } = req.query; // Captura el parámetro estado_id de la URL

    try {
        // Verifica si se proporcionó un estado_id
        if (!estado_id) {
            return res.status(400).json({ error: 'El parámetro estado_id es requerido' });
        }

        // Realiza la consulta para obtener los clientes filtrados por estado
        const clientesFiltrados = await pool.query(`
            SELECT 
                c.*, 
                col.nombre AS colonia_nombre,
                m.nombre AS mikrotik_nombre,
                m.enlace AS mikrotik_enlace,
                est.nombre AS estado_nombre,
                CASE 
                    WHEN c.estado_id = 1 THEN '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                    ELSE '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-circle-fill" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8"/>
                    </svg>'
                END AS estado_icono
            FROM clientes c
            LEFT JOIN colonia col ON c.colonia_id = col.id
            LEFT JOIN mikrotik m ON c.mikrotik_id = m.id
            LEFT JOIN estado est ON c.estado_id = est.id
            WHERE c.estado_id = ?
        `, [estado_id]);

        // Retorna los datos filtrados como respuesta JSON
        res.json(clientesFiltrados);
    } catch (error) {
        console.error(error); // Muestra el error en la consola para depuración
        res.status(500).json({ error: 'Error al filtrar los datos' });
    }
});

*/
module.exports= router;