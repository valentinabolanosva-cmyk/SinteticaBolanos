// Guardián de Ruta: Proteger el Portal de Usuario
const stSession = localStorage.getItem('gesticanchas_session');
if (!stSession) {
    window.location.href = 'login.html';
} else {
    // Si hay sesión pero es administrador, expulsar hacia el panel de Admin
    const jSession = JSON.parse(stSession);
    if (jSession.role === 'admin') {
        window.location.href = 'index.html';
    }
}

// LÓGICA DE BASE DE DATOS LOCAL
const DB_RESERVAS = 'gesticanchas_reservas';
function getReservas() {
    return JSON.parse(localStorage.getItem(DB_RESERVAS)) || [];
}
function saveReserva(reserva) {
    const reservas = getReservas();
    reserva.id = 'RES-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000);
    reservas.unshift(reserva); // Añadir al principio
    localStorage.setItem(DB_RESERVAS, JSON.stringify(reservas));
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Obtener datos del usuario
    const sessionData = JSON.parse(localStorage.getItem('gesticanchas_session'));
    if (sessionData && sessionData.name) {
        document.getElementById('sidebar-user-name').textContent = sessionData.name;
        document.getElementById('greeting-name').textContent = sessionData.name.split(' ')[0]; // Solo el primer nombre
    }

    // Lógica de Navegación del Usuario
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const btnAction = document.getElementById('btn-action');

    const viewTitles = {
        'inicio': { title: 'Mi Resumen', subtitle: 'Bienvenido a tu portal personal', action: false },
        'mis-reservas': { title: 'Mis Reservas', subtitle: 'Historial y próximas canchas separadas', action: true, actionText: 'Nueva Reserva', actionIcon: 'bx-calendar-plus' },
        'soporte': { title: 'Centro de Soporte', subtitle: 'Tus reportes de mantenimiento activos', action: true, actionText: 'Reportar Problema', actionIcon: 'bx-error-circle' }
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(`view-${target}`).classList.add('active');

            if (viewTitles[target]) {
                pageTitle.textContent = viewTitles[target].title;
                pageSubtitle.textContent = viewTitles[target].subtitle;
                
                if (viewTitles[target].action) {
                    btnAction.style.display = 'inline-flex';
                    btnAction.innerHTML = `<i class='bx ${viewTitles[target].actionIcon}'></i> ${viewTitles[target].actionText}`;
                } else {
                    btnAction.style.display = 'none';
                }
            }
        });
    });

    // Formato de Fecha Actual
    const dateElement = document.getElementById('current-date');
    dateElement.textContent = "Lunes, 9 de Marzo 2026"; // Mockup consistency

    // --- LÓGICA DEL MODAL DE RESERVAS ---
    const modalReserva = document.getElementById('modal-reserva');
    const closeModalBtn = document.getElementById('close-modal');
    
    if (btnAction && modalReserva) {
        btnAction.addEventListener('click', () => {
            // Verificar si estamos en la pestaña de reservas comprobando el texto del botón
            if (btnAction.textContent.includes('Nueva Reserva')) {
                modalReserva.classList.add('active');
            } else {
                alert("Función de demostración temporalmente no disponible en esta pantalla.");
            }
        });
    }

    if (closeModalBtn && modalReserva) {
        closeModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalReserva.classList.remove('active');
        });
    }

    const selectCancha = document.getElementById('select-cancha');
    const precioReserva = document.getElementById('precio-reserva');
    if (selectCancha && precioReserva) {
        selectCancha.addEventListener('change', (e) => {
            const precio = parseInt(e.target.value).toLocaleString('es-CO');
            precioReserva.textContent = `$${precio} COP`;
        });
    }

    // --- GUARDADO DINÁMICO DE RESERVA (USER) ---
    const btnSubmitReserva = document.getElementById('btn-submit-reserva');
    if (btnSubmitReserva) {
        btnSubmitReserva.addEventListener('click', () => {
            const sessionObj = JSON.parse(localStorage.getItem('gesticanchas_session'));
            const cliente = sessionObj ? sessionObj.name : 'Usuario Desconocido';
            const emailCliente = sessionObj ? sessionObj.email : '';
            
            const fecha = document.getElementById('input-fecha').value;
            const horario = document.getElementById('select-horario').value;
            const selCancha = document.getElementById('select-cancha');
            const canchaText = selCancha.options[selCancha.selectedIndex].text;
            const precioStr = document.getElementById('precio-reserva').textContent;

            if (!fecha || !horario) {
                alert("Por favor completa los campos.");
                return;
            }

            const nuevaReserva = {
                cliente: cliente,
                email: emailCliente,
                cancha: canchaText,
                fecha: fecha,
                horario: horario,
                precio: precioStr,
                estado: 'Pendiente', // El admin aprueba o cancela
                creadoPor: 'user'
            };

            saveReserva(nuevaReserva);
            alert("¡Reserva solicitada con éxito! Está en pendiente.");
            window.location.reload(); 
        });
    }

    // --- RENDERIZADO DINÁMICO DE RESERVAS GUARDADAS (USER) ---
    const tbodyUser = document.getElementById('tbody-reservas-user');
    const sessionObj = JSON.parse(localStorage.getItem('gesticanchas_session'));
    const emailCliente = sessionObj ? sessionObj.email : '';
    if (tbodyUser && emailCliente) {
        const reservasBD = getReservas();
        reservasBD.reverse().forEach(res => { 
            // Solo renderizar si la reserva pertenece al usuario actual (por email idealmente o nombre si no hay email en obj)
            if (res.email === emailCliente || res.cliente === sessionObj.name) {
                const formatFecha = new Date(res.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                let colorClass = res.estado === 'Confirmada' ? 'bg-green' : (res.estado === 'Cancelada' ? 'bg-red' : 'bg-gray');
                if (res.estado === 'Cancelada') colorClass = 'bg-gray'; // Keep user view simple
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatFecha}</td>
                    <td><span class="fw-bold">${res.cancha}</span><br><small style="color:var(--text-muted)">${res.id}</small></td>
                    <td>${res.horario}</td>
                    <td><span class="badge-status ${colorClass}">${res.estado}</span></td>
                `;
                tbodyUser.insertBefore(tr, tbodyUser.firstChild);
            }
        });
    }

    // --- LÓGICA DE CIERRE DE SESIÓN ---
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('gesticanchas_session');
            window.location.href = 'login.html';
        });
    }
});
