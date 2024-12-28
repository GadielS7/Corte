//script para mensajes
document.addEventListener('DOMContentLoaded', () => {
    const successMessage = sessionStorage.getItem('successMessage');
    const errorMessage = sessionStorage.getItem('errorMessage'); // Si deseas manejar mensajes de error también

    if (successMessage) {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-success', 'alert-dismissible', 'fade', 'show', 'custom-alert');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.id = 'success-alert';
        alertDiv.innerHTML = `
            ${successMessage}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);

        // Desvanecer y eliminar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 2000);

        sessionStorage.removeItem('successMessage');
    }

    if (errorMessage) {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show', 'custom-alert');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.id = 'error-alert';
        alertDiv.innerHTML = `
            ${errorMessage}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);

        // Desvanecer y eliminar el mensaje de error después de 5 segundos
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 2000);

        sessionStorage.removeItem('errorMessage');
    }
});

// CSS para personalizar los estilos de alerta
const style = document.createElement('style');
style.innerHTML = `
    .custom-alert {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1050; /* Asegura que quede encima de otros elementos */
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(style);

////script para modal
    document.addEventListener('DOMContentLoaded', () => {

        // Función para cerrar el modal y eliminar el fondo gris
        function closeModalAndRemoveBackdrop(modalId) {
            const modalElement = document.getElementById(modalId);
            const modal = bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }

            // Remover el backdrop residual
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            
            // Remover la clase 'modal-open' del body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        // Cargar datos en el modal de edición
        document.querySelectorAll('.edit-colonia-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const nombre = button.dataset.nombre;

                if (id && nombre) {
                    document.getElementById('editColoniaId').value = id;
                    document.getElementById('editColoniaNombre').value = nombre;
                } else {
                    console.error('Datos incompletos en el botón de edición.');
                }
            });
        });

        // Manejar el envío del formulario de edición con AJAX
        document.getElementById('editColoniaForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const id = document.getElementById('editColoniaId').value;
            const nombre = document.getElementById('editColoniaNombre').value;

            try {
                const response = await fetch('/colonia/edit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, nombre }),
                });

                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor.');
                }

                const result = await response.json();
                if (result.success) {
                    // Actualizar el nombre en la tabla
                    const row = document.getElementById(`colonia-${id}`);
                    row.querySelector('.colonia-nombre').textContent = nombre;

                    // Cerrar el modal y limpiar el backdrop
                    closeModalAndRemoveBackdrop('editColoniaModal');
                    
                     sessionStorage.setItem('successMessage', result.message);
            window.location.reload();  // Esto recarga la página
                } else {
                    alert(result.message || 'Error al actualizar la colonia.');
                }
            } catch (error) {
                console.error('Error al actualizar la colonia:', error);
                alert('Hubo un problema al conectar con el servidor. Por favor, inténtalo de nuevo.');
            }
        });
    });

