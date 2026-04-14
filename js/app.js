// Guardián de Ruta: Proteger el Dashboard comprobando sesión activa y ROL de Administrador
const stSession = localStorage.getItem('gesticanchas_session');
if (!stSession) {
    window.location.href = 'login.html';
} else {
    // Si hay sesión pero no es administrador, expulsar
    const jSession = JSON.parse(stSession);
    if (jSession.role !== 'admin') {
        window.location.href = 'usuario.html';
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
    // Nav Navigation logic
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const btnShare = document.getElementById('btn-share');

    const viewTitles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Vista general del sistema de gestión', share: false },
        'inventario': { title: 'Inventario de Activos', subtitle: 'Gestión de activos de canchas sintéticas', share: false },
        'reservas': { title: 'Gestión de Reservas y Tickets', subtitle: 'Administración de reservas y tickets de mantenimiento', share: false },
        'reportes': { title: 'Reportes y Análisis', subtitle: 'Estadísticas y métricas del sistema', share: true } // Reportes has Exportar/Compartir in mockup
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            // Add active to clicked nav
            item.classList.add('active');

            // Show target view
            const target = item.getAttribute('data-target');
            document.getElementById(`view-${target}`).classList.add('active');

            // Update topbar title
            if(viewTitles[target]) {
                pageTitle.textContent = viewTitles[target].title;
                pageSubtitle.textContent = viewTitles[target].subtitle;
                
                // Botón compartir en Reportes (as per mockup "Exportar Reporte")
                if(target === 'reportes') {
                    btnShare.style.display = 'inline-flex';
                    btnShare.innerHTML = "<i class='bx bx-download'></i> Exportar Reporte";
                    btnShare.className = "btn btn-success"; // Green in reportes
                } else if(target === 'inventario') {
                    btnShare.style.display = 'inline-flex';
                    btnShare.innerHTML = "<i class='bx bx-plus'></i> Nuevo Activo";
                    btnShare.className = "btn btn-success";
                } else if(target === 'reservas') {
                    btnShare.style.display = 'inline-flex';
                    btnShare.innerHTML = "<i class='bx bx-plus'></i> Nueva Reserva";
                    btnShare.className = "btn btn-success";
                } else {
                    btnShare.style.display = 'none'; // hidden in dashboard right side usually, or share. The mockup shows a subtle 'Compartir' at very top right but we unified the toolbar. Let's hide it in dashboard.
                }
            }
        });
    });
    
    // Default Topbar Action for Dashboard (none or share)
    btnShare.style.display = 'none';

    // Current Date formatting
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(2026, 2, 9); // Hardcoded Monday, 9 de Marzo 2026 based on mockup
    
    // To format exactly as mockup: "Lunes, 9 de Marzo 2026"
    dateElement.textContent = "Lunes, 9 de Marzo 2026";

    // --- LÓGICA DE PESTAÑAS (TABS) DENTRO DE VISTAS ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de hermanos
            const parent = btn.parentElement;
            parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            // Activar este
            btn.classList.add('active');
            
            // Simular carga o cambio
            alert("Cambiando de pestaña en modo demostración: " + btn.textContent.trim());
        });
    });

    // --- LÓGICA DEL MODAL DE RESERVAS ---
    const modalReserva = document.getElementById('modal-reserva');
    const closeModalBtn = document.getElementById('close-modal');
    
    if (btnShare && modalReserva) {
        btnShare.addEventListener('click', () => {
            // Check if button text indicates opening reservation modal
            if (btnShare.textContent.includes('Nueva Reserva')) {
                modalReserva.classList.add('active');
            } else {
                alert("Función de exportación/compartir en demostración.");
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

    // --- GUARDADO DINÁMICO DE RESERVA (ADMIN) ---
    const btnSubmitReserva = document.getElementById('btn-submit-reserva');
    if (btnSubmitReserva) {
        btnSubmitReserva.addEventListener('click', () => {
            const cliente = document.getElementById('input-cliente').value;
            const fecha = document.getElementById('input-fecha').value;
            const horario = document.getElementById('select-horario').value;
            const selCancha = document.getElementById('select-cancha');
            const canchaText = selCancha.options[selCancha.selectedIndex].text;
            const precioStr = document.getElementById('precio-reserva').textContent;

            if (!cliente || !fecha || !horario) {
                alert("Por favor completa los campos.");
                return;
            }

            const nuevaReserva = {
                cliente: cliente,
                cancha: canchaText,
                fecha: fecha,
                horario: horario,
                precio: precioStr,
                estado: 'Confirmada',
                creadoPor: 'admin'
            };

            saveReserva(nuevaReserva);
            alert("¡Reserva guardada con éxito en la base de datos!");
            window.location.reload(); // Recargar para observar cambios en tabla
        });
    }

    // --- RENDERIZADO DINÁMICO DE RESERVAS GUARDADAS (ADMIN) ---
    const tbodyAdmin = document.getElementById('tbody-reservas-admin');
    if (tbodyAdmin) {
        const reservasBD = getReservas();
        reservasBD.reverse().forEach(res => { // Reverse para prepender en orden si usamos unshift
            const formatFecha = new Date(res.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold text-primary">${res.id}</td>
                <td>
                    <div class="item-name">${res.cliente}</div>
                    <div class="item-desc">Registrado por Admin</div>
                </td>
                <td><span class="badge-outline rounded-sm">${res.cancha}</span></td>
                <td>${formatFecha}</td>
                <td>${res.horario}</td>
                <td>-</td>
                <td><span class="badge-status bg-green">${res.estado}</span></td>
                <td>${res.precio}</td>
                <td>
                    <button class="btn-icon" title="Ver" onclick="alert('Detalles de reserva: ${res.id}')"><i class='bx bx-show'></i></button>
                    ${res.estado === 'Pendiente' ? `<button class="btn-icon text-success" title="Confirmar" onclick="this.closest('tr').cells[6].innerHTML='<span class=\\'badge-status bg-green\\'>Confirmada</span>'; this.style.display='none'; alert('¡Reserva Confirmada Oficialmente!');"><i class='bx bx-check-circle'></i></button>` : ''}
                    <button class="btn-icon text-danger" title="Cancelar" onclick="if(confirm('¿Seguro que deseas cancelar esta reserva?')) { this.closest('tr').cells[6].innerHTML='<span class=\\'badge-status\\' style=\\'background-color:#fee2e2; color:#dc3545; border:1px solid #fca5a5\\'>Cancelada</span>'; const confBtn = this.parentElement.querySelector('.text-success'); if(confBtn) confBtn.style.display='none'; this.style.display='none'; }"><i class='bx bx-x-circle'></i></button>
                </td>
            `;
            tbodyAdmin.insertBefore(tr, tbodyAdmin.firstChild);
        });
    }

    // --- LÓGICA DE CIERRE DE SESIÓN ---
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Eliminar sesión
            localStorage.removeItem('gesticanchas_session');
            // Redirigir al inicio de sesión
            window.location.href = 'login.html';
        });
    }
});
