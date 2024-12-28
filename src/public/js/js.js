document.addEventListener('DOMContentLoaded', function () {
    const rowsPerPage = 10; // Número de filas por página
    const maxVisibleButtons = 5; // Número máximo de botones visibles
    let currentPage = 1;
    let totalPages = 1; // Asegúrate de tener una página inicial para `totalPages`

    const tableBody = document.querySelector('table tbody');
    const paginationContainer = document.querySelector('.pagination-container');
    const pageButtonsContainer = document.querySelector('.page-buttons');
    const prevButton = document.querySelector('.prev-page');
    const nextButton = document.querySelector('.next-page');
    const estadoFiltro = document.getElementById('estadoFiltro');
    const mikrotikFiltro = document.getElementById('mikrotikFiltro');  // Filtro de Mikrotik

    // Función para cargar datos con paginación y filtro
    async function loadPage(page = 1, estadoId = null, mikrotikId = null) {
        try {
            const url = new URL('/mikrotik/paginar', window.location.origin);
            url.searchParams.append('page', page);
            url.searchParams.append('limit', rowsPerPage);
            if (estadoId) {
                url.searchParams.append('estado_id', estadoId);
            }
            if (mikrotikId) {
                url.searchParams.append('mikrotik_id', mikrotikId);  // Agregar el filtro de Mikrotik
            }

            const response = await fetch(url);
            const data = await response.json();

            // Actualizar los totales de clientes activos e inactivos
            if (estadoId === '1') {
                // Mostrar clientes activos
                document.getElementById('clientesActivos').style.display = 'block';
                document.getElementById('clientesInactivos').style.display = 'none';
                document.getElementById('totalBaja').style.display = 'none';
                document.getElementById('clientesSinMikrotik').style.display = 'none';
                document.getElementById('totalActivos').textContent = data.totalActivos;
            } else if (estadoId === '2') {
                // Mostrar clientes inactivos
                document.getElementById('clientesActivos').style.display = 'none';
                document.getElementById('clientesInactivos').style.display = 'block';
                document.getElementById('totalBaja').style.display = 'none';
                document.getElementById('clientesSinMikrotik').style.display = 'none';
                document.getElementById('totalInactivos').textContent = data.totalInactivos;
            } else if (estadoId === '3') {
                // Mostrar clientes de baja
                document.getElementById('clientesActivos').style.display = 'none';
                document.getElementById('clientesInactivos').style.display = 'none';
                document.getElementById('totalBaja').style.display = 'block';
                document.getElementById('clientesSinMikrotik').style.display = 'none';
                document.getElementById('totalBaja').innerHTML = '<h3>Total de Baja: ' + data.totalBaja + '</h3>';
            } else if (estadoId === 'sin_mikrotik') {
                // Mostrar clientes sin Mikrotik
                document.getElementById('clientesActivos').style.display = 'none';
                document.getElementById('clientesInactivos').style.display = 'none';
                document.getElementById('totalBaja').style.display = 'none';
                document.getElementById('clientesSinMikrotik').style.display = 'block';
                document.getElementById('totalSinMikrotik').textContent = data.totalSinMikrotik;
            } else {
                // Mostrar todos los clientes
                document.getElementById('clientesActivos').style.display = 'none';
                document.getElementById('clientesInactivos').style.display = 'none';
                document.getElementById('totalBaja').style.display = 'none';
                document.getElementById('clientesSinMikrotik').style.display = 'none';
                document.getElementById('totalClientes').style.display = 'block';
                document.getElementById('totalClientes').innerHTML = `<h3>Total de Clientes: ${data.totalCount}</h3>`;
            }

             // Mostrar las sumas de megas de subida y bajada
            document.getElementById('totalMegasSubida').textContent = `Total Megas de Subida: ${data.totalMegasSubida}M`;
            document.getElementById('totalMegasBajada').textContent = `Total Megas de Bajada: ${data.totalMegasBajada}M`;

            if (Array.isArray(data.data)) {
                renderTable(data.data);
                totalPages = data.totalPages || 1; // Actualiza el total de páginas dinámicamente
                renderButtons();
            } else {
                console.error('Formato de respuesta inesperado:', data);
            }
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    }

    //buscar 
    document.getElementById('searchQuery').addEventListener('input', async function () {
        const query = this.value;
    
        try {
            const response = await fetch(`/mikrotik/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
    
            renderTable(data); // Llama a la función para actualizar la tabla
        } catch (error) {
            console.error('Error al realizar la búsqueda:', error);
        }
    });
    

    // Función para renderizar la tabla
    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.estado_icono || ''}</td>
                <td>${row.nombre || ''}</td>
                <td>${row.colonia_nombre || ''}</td>
                <td>${row.megas_subida || ''}</td>
                <td>${row.megas_bajada || ''}</td>
                <td>${row.telefono || ''}</td>
                <td>
                        <!-- Ver -->
                        <a href="" class="text-primary" title="Ver" 
                            data-bs-toggle="modal" 
                            data-bs-target="#viewMikrotikModal" 
                            data-mikrotik-nombre="${row.mikrotik_nombre || ''}"
                            data-mikrotik-link="${row.mikrotik_enlace || ''}" 
                            data-mikrotik-megas-subida="${row.megas_subida || ''}" 
                            data-mikrotik-megas-bajada="${row.megas_bajada || ''}" 
                            data-mikrotik-cliente="${row.nombre || ''}" 
                            data-mikrotik-ip="${row.ip || ''}" 
                            data-mikrotik-comments="${row.comentarios || ''} ">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                            </svg>
                        </a>
                        <span class="mx-2"></span>
                        <!-- Editar -->
                        <a href="/mikrotik/edit/${row.id}" class="text-warning" title="Editar">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                            </svg>
                        </a>
                        <span class="mx-2"></span>
                        <!-- Eliminar -->
                        <a href="#" class="text-danger" title="Eliminar" onclick="confirmDelete(event, '${row.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                            </svg>
                        </a>

                    </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Función para renderizar los botones de paginación
    function renderButtons() {
        pageButtonsContainer.innerHTML = ''; // Limpiar botones anteriores

        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        if (endPage - startPage < maxVisibleButtons - 1) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.className = `btn btn-success ${i === currentPage ? 'active' : ''}`;
            button.textContent = i;
            button.dataset.page = i;

            button.addEventListener('click', () => {
                const estadoId = estadoFiltro.value || null;
                const mikrotikId = mikrotikFiltro.value || null;
                loadPage(i, estadoId, mikrotikId);
            });

            pageButtonsContainer.appendChild(button);
        }

        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
    }

    // Manejar clic en "Anterior"
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage -= 1; // Actualiza currentPage
            const estadoId = estadoFiltro.value || null;
            const mikrotikId = mikrotikFiltro.value || null;
            loadPage(currentPage, estadoId, mikrotikId);
        }
    });

    // Manejar clic en "Siguiente"
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage += 1; // Actualiza currentPage
            const estadoId = estadoFiltro.value || null;
            const mikrotikId = mikrotikFiltro.value || null;
            loadPage(currentPage, estadoId, mikrotikId);
        }
    });

    // Cargar la página por defecto
    loadPage(currentPage);

    // Cambiar de filtro de estado y cargar la página
    estadoFiltro.addEventListener('change', function () {
        const mikrotikId = mikrotikFiltro.value || null;
        currentPage = 1;
        loadPage(currentPage, this.value, mikrotikId);
    });

    // Cambiar de filtro de Mikrotik y cargar la página
    mikrotikFiltro.addEventListener('change', function () {
        const estadoId = estadoFiltro.value || null;
        currentPage = 1;
        loadPage(currentPage, estadoId, this.value);
    });


    // Cambiar de filtro de estado y cargar la página
    estadoFiltro.addEventListener('change', function () {
        // Bloquear/desbloquear filtros
        mikrotikFiltro.disabled = true;  // Deshabilitar Mikrotik
        this.disabled = false;  // Asegurarse de que el filtro de estado está habilitado

        const mikrotikId = mikrotikFiltro.value || null;
        currentPage = 1;
        loadPage(currentPage, this.value, mikrotikId);
    });

    // Cambiar de filtro de Mikrotik y cargar la página
    mikrotikFiltro.addEventListener('change', function () {
        // Bloquear/desbloquear filtros
        estadoFiltro.disabled = true;  // Deshabilitar Estado
        this.disabled = false;  // Asegurarse de que el filtro de Mikrotik está habilitado

        const estadoId = estadoFiltro.value || null;
        currentPage = 1;
        loadPage(currentPage, estadoId, this.value);
    });

   
});
