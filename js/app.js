// Guardián de Ruta
const stSession = localStorage.getItem('gesticanchas_session');
if (!stSession) {
    window.location.href = 'login.html';
} else {
    const jSession = JSON.parse(stSession);
    if (jSession.role !== 'admin') {
        window.location.href = 'usuario.html';
    }
}

// LÓGICA DE BASE DE DATOS LOCAL
const DB_RESERVAS = 'gesticanchas_reservas';
const DB_TICKETS = 'gesticanchas_tickets';

function getReservas() {
    return JSON.parse(localStorage.getItem(DB_RESERVAS)) || [];
}
function saveReserva(reserva) {
    const reservas = getReservas();
    reserva.id = 'RES-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 9000 + 1000);
    reservas.unshift(reserva);
    localStorage.setItem(DB_RESERVAS, JSON.stringify(reservas));
}

function getTickets() {
    return JSON.parse(localStorage.getItem(DB_TICKETS)) || [];
}
function saveTicket(ticket) {
    const tickets = getTickets();
    ticket.id = 'TKT-' + Math.floor(Math.random() * 9000 + 1000);
    ticket.fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    tickets.unshift(ticket);
    localStorage.setItem(DB_TICKETS, JSON.stringify(tickets));
}

// --- FUNCIONES HELPER PARA ACCIONES DE RESERVAS ---
function verReserva(codigo) {
    const reservas = getReservas();
    const res = reservas.find(r => r.id === codigo);
    if (!res) {
        alert('Reserva estática de demostración. Los detalles dinámicos aplican para nuevas reservas.');
        return;
    }

    document.getElementById('ver-res-codigo').textContent = res.id;
    document.getElementById('ver-res-cliente').textContent = res.cliente;
    document.getElementById('ver-res-cancha').textContent = res.cancha;
    document.getElementById('ver-res-fecha').textContent = res.fecha;
    document.getElementById('ver-res-horario').textContent = res.horario;
    
    const estadoEl = document.getElementById('ver-res-estado');
    estadoEl.textContent = res.estado;
    estadoEl.className = 'badge-status ' + (res.estado === 'Confirmada' ? 'bg-green' : (res.estado === 'Cancelada' ? 'bg-danger' : 'bg-gray'));
    
    document.getElementById('ver-res-precio').textContent = res.precio;
    document.getElementById('ver-res-comentario').textContent = res.comentario || 'Sin comentarios.';

    const modalVer = document.getElementById('modal-ver-reserva');
    if (modalVer) modalVer.classList.add('active');
}

function cancelarReserva(btn) {
    const motivo = prompt('¿Seguro que deseas cancelar esta reserva?\nSi lo deseas, escribe el motivo o comentario (opcional):');
    if (motivo !== null) { // null if user clicked Cancel
        var row = btn.closest('tr');
        var codigo = row.cells[0].textContent.trim();

        // Update DB
        const reservas = getReservas();
        const index = reservas.findIndex(r => r.id === codigo);
        if (index !== -1) {
            reservas[index].estado = 'Cancelada';
            if (motivo.trim() !== '') {
                reservas[index].comentario = (reservas[index].comentario ? reservas[index].comentario + ' | Admin: ' : 'Admin: ') + motivo;
            }
            localStorage.setItem(DB_RESERVAS, JSON.stringify(reservas));
        }

        window.location.reload();
    }
}

function confirmarReserva(btn) {
    var row = btn.closest('tr');
    var codigo = row.cells[0].textContent.trim();

    const reservas = getReservas();
    const targetRes = reservas.find(r => r.id === codigo);

    if (!targetRes) return;

    // VALIDACIÓN DE CONFLICTO
    const conflicto = reservas.some(r => 
        r.id !== codigo && 
        r.estado === 'Confirmada' && 
        r.cancha === targetRes.cancha && 
        r.fecha === targetRes.fecha && 
        r.horario === targetRes.horario
    );

    if (conflicto) {
        alert('Este horario ya no está disponible. Ya existe una reserva confirmada para esta cancha en la misma fecha y hora.');
        return;
    }

    const mensaje = prompt('¿Deseas agregar algún comentario de confirmación? (Opcional):');
    if (mensaje !== null) {
        const index = reservas.findIndex(r => r.id === codigo);
        if (index !== -1) {
            reservas[index].estado = 'Confirmada';
            if (mensaje.trim() !== '') {
                reservas[index].comentario = (reservas[index].comentario ? reservas[index].comentario + ' | Admin: ' : 'Admin: ') + mensaje;
            }
            localStorage.setItem(DB_RESERVAS, JSON.stringify(reservas));
        }

        alert('¡Reserva Confirmada Oficialmente!');
        window.location.reload();
    }
}

function quitarMantenimiento(ticketId) {
    if (confirm('¿Seguro que deseas finalizar el mantenimiento de esta cancha/resolver este ticket?')) {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);
        if (index !== -1) {
            tickets[index].estado = 'Resuelto';
            localStorage.setItem(DB_TICKETS, JSON.stringify(tickets));
            window.location.reload();
        }
    }
}

function ponerEnMantenimiento(ticketId) {
    if (confirm('¿Seguro que deseas mandar esta cancha a mantenimiento? Esto bloqueará las reservas para los usuarios.')) {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);
        if (index !== -1) {
            tickets[index].estado = 'En Mantenimiento';
            localStorage.setItem(DB_TICKETS, JSON.stringify(tickets));
            window.location.reload();
        }
    }
}

function renderCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = ''; // Limpiar placeholders hardcodeados
    
    const today = new Date();
    const reservas = getReservas();
    
    // Generar próximos 7 días
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        
        // Formato YYYY-MM-DD para comparar con bd
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayName = currentDate.toLocaleDateString('es-ES', { weekday: 'short' });
        const dayNum = currentDate.getDate();
        const dayMonth = currentDate.toLocaleDateString('es-ES', { month: 'short' });
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'cal-day' + (i === 0 ? ' active' : '');
        
        let eventsHTML = '';
        
        // Buscar reservas para este día
        const dayReservations = reservas.filter(r => r.fecha === dateStr && r.estado !== 'Cancelada');
        
        // Ordenar por hora
        dayReservations.sort((a, b) => a.horario.localeCompare(b.horario));
        
        dayReservations.forEach(r => {
            const timeStr = r.horario.split(' ')[0]; // ej. "18:00 - 19:00" -> "18:00"
            let shortCancha = 'C?';
            if (r.cancha.includes('Cancha 1')) shortCancha = 'C1';
            else if (r.cancha.includes('Cancha 2')) shortCancha = 'C2';
            else if (r.cancha.includes('Cancha 3')) shortCancha = 'C3';
            else if (r.cancha.includes('Cancha 4')) shortCancha = 'C4';
            else if (r.cancha.includes('Cancha 5')) shortCancha = 'C5';
            else if (r.cancha.toLowerCase().includes('tenis')) shortCancha = 'CT';
            else if (r.cancha.toLowerCase().includes('baloncesto')) shortCancha = 'CB';
            else if (r.cancha.toLowerCase().includes('voleibol')) shortCancha = 'CV';
            
            // Botón interactivo
            eventsHTML += `<div class="event-pill" style="cursor: pointer;" onclick="verReserva('${r.id}')" title="${r.cliente} (${r.estado})">${timeStr} ${shortCancha}</div>`;
        });
        
        if (eventsHTML === '') {
            eventsHTML = `<div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem;">Libre</div>`;
        }
        
        dayDiv.innerHTML = `
            <div class="cal-day-header">
                <span class="day-name">${dayName}</span>
                <span class="day-num">${dayNum}</span>
                <span class="day-month">${dayMonth}.</span>
            </div>
            <div class="cal-events">
                ${eventsHTML}
            </div>
        `;
        
        calendarGrid.appendChild(dayDiv);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Renderizar Calendario Dinámico
    renderCalendar();
    
    // Cerrar modal de ver detalles
    const modalVer = document.getElementById('modal-ver-reserva');
    const closeVerBtn = document.getElementById('close-modal-ver');
    if (closeVerBtn) {
        closeVerBtn.addEventListener('click', () => modalVer.classList.remove('active'));
    }
    if (modalVer) {
        modalVer.addEventListener('click', (e) => {
            if (e.target === modalVer) modalVer.classList.remove('active');
        });
    }
    // --- NAVEGACIÓN ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const btnShare = document.getElementById('btn-share');

    const viewTitles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Vista general del sistema de gestión' },
        'inventario': { title: 'Inventario de Activos', subtitle: 'Gestión de activos de canchas sintéticas' },
        'reservas': { title: 'Gestión de Reservas y Tickets', subtitle: 'Administración de reservas y tickets de mantenimiento' },
        'reportes': { title: 'Reportes y Análisis', subtitle: 'Estadísticas y métricas del sistema' }
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

                if (target === 'reportes') {
                    btnShare.style.display = 'none';
                } else if (target === 'inventario') {
                    btnShare.style.display = 'inline-flex';
                    btnShare.innerHTML = "<i class='bx bx-plus'></i> Nuevo Activo";
                    btnShare.className = "btn btn-success";
                } else if (target === 'reservas') {
                    btnShare.style.display = 'inline-flex';
                    btnShare.innerHTML = "<i class='bx bx-plus'></i> Nueva Reserva";
                    btnShare.className = "btn btn-success";
                } else {
                    btnShare.style.display = 'none';
                }
            }
        });
    });

    btnShare.style.display = 'none';

    // --- FECHA ACTUAL ---
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    // --- LÓGICA DE NOTIFICACIONES (NUEVAS RESERVAS) ---
    const btnNotifications = document.getElementById('btn-notifications');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifBadge = document.getElementById('notif-badge');
    const notifCountText = document.getElementById('notif-count-text');
    const notifList = document.getElementById('notif-list');

    function checkNotifications() {
        if (!notifList) return;
        const allReservas = getReservas();
        // Filtrar reservas que están pendientes Y que no han sido notificadas/vistas
        const pendingReservas = allReservas.filter(res => res.estado === 'Pendiente' && !res.notificada);
        
        if (pendingReservas.length > 0) {
            notifBadge.style.display = 'block';
            notifBadge.textContent = pendingReservas.length;
            notifCountText.textContent = `${pendingReservas.length} Nuevas`;
            
            notifList.innerHTML = '';
            pendingReservas.forEach(res => {
                const item = document.createElement('div');
                item.style.cssText = "padding: 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;";
                item.onmouseover = () => item.style.background = '#f1f5f9';
                item.onmouseout = () => item.style.background = 'white';
                
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.25rem;">
                        <strong style="color:var(--primary); font-size: 0.9rem;">${res.id}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${res.fecha}</span>
                    </div>
                    <div style="font-size: 0.85rem; margin-bottom: 0.25rem;"><strong>${res.cliente}</strong> solicitó <strong>${res.cancha}</strong></div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${res.horario}</div>
                `;
                item.addEventListener('click', () => {
                    notifDropdown.style.display = 'none';
                    
                    // Marcar como vista
                    const dbReservas = getReservas();
                    const index = dbReservas.findIndex(r => r.id === res.id);
                    if (index !== -1) {
                        dbReservas[index].notificada = true;
                        localStorage.setItem(DB_RESERVAS, JSON.stringify(dbReservas));
                    }
                    
                    // Actualizar campanita
                    checkNotifications();

                    // Navegar a Reservas
                    const navReservas = document.querySelector('[data-target="reservas"]');
                    if (navReservas) navReservas.click();
                    
                    // Abrir modal de detalles
                    setTimeout(() => verReserva(res.id), 200);
                });
                notifList.appendChild(item);
            });
        } else {
            notifBadge.style.display = 'none';
            notifCountText.textContent = `0 Nuevas`;
            notifList.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No hay notificaciones nuevas</div>';
        }
    }



    // Ejecutar chequeo de notificaciones al cargar
    checkNotifications();

    // --- BÚSQUEDA Y FILTROS DE INVENTARIO ---
    const searchInput = document.querySelector('.search-box input');
    const categoryFilter = document.querySelector('.filter-box:nth-child(2) select');
    const statusFilter = document.querySelector('.filter-box:nth-child(3) select');
    const inventoryTable = document.querySelector('#view-inventario .table tbody');

    // Poblar opciones de filtro
    if (categoryFilter && inventoryTable) {
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option><option value="Infraestructura">Infraestructura</option><option value="Equipamiento">Equipamiento</option><option value="Iluminación">Iluminación</option>';
    }
    if (statusFilter && inventoryTable) {
        statusFilter.innerHTML = '<option value="">Todos los estados</option><option value="Excelente">Excelente</option><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Malo">Malo</option>';
    }

    function filterInventory() {
        if (!inventoryTable) return;
        const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
        const catVal = categoryFilter ? categoryFilter.value : '';
        const statVal = statusFilter ? statusFilter.value : '';
        const rows = inventoryTable.querySelectorAll('tr');

        rows.forEach(row => {
            const codigo = (row.cells[0] && row.cells[0].textContent || '').toLowerCase();
            const nombre = (row.cells[1] && row.cells[1].textContent || '').toLowerCase();
            const categoria = (row.cells[2] && row.cells[2].textContent || '').trim();
            const estado = (row.cells[3] && row.cells[3].textContent || '').trim();

            const matchSearch = !searchVal || codigo.includes(searchVal) || nombre.includes(searchVal);
            const matchCat = !catVal || categoria === catVal;
            const matchStat = !statVal || estado === statVal;

            row.style.display = (matchSearch && matchCat && matchStat) ? '' : 'none';
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterInventory);
    if (categoryFilter) categoryFilter.addEventListener('change', filterInventory);
    if (statusFilter) statusFilter.addEventListener('change', filterInventory);

    // --- PESTAÑAS (TABS) RESERVAS / TICKETS ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const reservasContent = document.querySelector('#view-reservas .grid-4kpi');
    const calendarCard = document.querySelector('#view-reservas .card.full-width-card.mb-4');
    const reservasTable = document.querySelector('#view-reservas .card.full-width-card:last-child');

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (index === 0) {
                // Pestaña Reservas
                if (reservasContent) reservasContent.style.display = '';
                if (calendarCard) calendarCard.style.display = '';
                if (reservasTable) reservasTable.style.display = '';
                // Ocultar tickets
                const ticketSection = document.getElementById('tickets-section');
                if (ticketSection) ticketSection.style.display = 'none';
            } else {
                // Pestaña Tickets
                if (reservasContent) reservasContent.style.display = 'none';
                if (calendarCard) calendarCard.style.display = 'none';
                if (reservasTable) reservasTable.style.display = 'none';
                // Mostrar o crear sección de tickets
                let ticketSection = document.getElementById('tickets-section');
                if (!ticketSection) {
                    ticketSection = document.createElement('div');
                    ticketSection.id = 'tickets-section';
                    ticketSection.className = 'card full-width-card';
                    ticketSection.innerHTML = `
                        <div class="card-header pb-2"><h3 class="card-title"><i class='bx bx-wrench mr-2'></i> Tickets de Mantenimiento</h3></div>
                        <div class="ticket-list" id="admin-ticket-list">
                        </div>
                    `;
                    document.querySelector('#view-reservas').appendChild(ticketSection);

                    const adminTicketList = document.getElementById('admin-ticket-list');
                    const allTickets = getTickets();
                    
                    if (allTickets.length === 0) {
                        adminTicketList.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No hay tickets ni reportes registrados.</div>';
                    } else {
                        allTickets.forEach(ticket => {
                            const badgeColor = ticket.prioridad === 'Crítica' ? 'badge-danger' : (ticket.prioridad === 'Alta' ? 'badge-dark' : 'badge-secondary');
                            const isResuelto = ticket.estado === 'Resuelto';
                            const estadoColor = isResuelto ? 'border-color:#10b981;color:#10b981;' : '';
                            
                            const div = document.createElement('div');
                            div.className = 'ticket-item';
                            div.innerHTML = `
                                <div class="ticket-info-top">
                                    <span class="ticket-id">${ticket.id}</span>
                                    <span class="badge ${badgeColor}">${ticket.prioridad || 'Sugerencia'}</span>
                                    <span class="badge badge-outline" style="${estadoColor}">${ticket.estado}</span>
                                </div>
                                <h4 class="ticket-title">${ticket.titulo}</h4>
                                <p class="ticket-meta">${ticket.cancha} • Reportado el ${ticket.fecha} • Por: <span class="assigned">${ticket.creadoPor === 'user' ? 'Usuario' : 'Admin'}</span></p>
                                <p style="margin-top:0.5rem; font-size:0.85rem; color:#555;"><i>Detalle: ${ticket.descripcion || ticket.motivo || 'Sin detalles'}</i></p>
                                ${!isResuelto ? `
                                    <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;" onclick="quitarMantenimiento('${ticket.id}')">Marcar como Resuelto</button>
                                        ${ticket.estado !== 'En Mantenimiento' ? `<button class="btn" style="background-color: var(--danger); color: white; border: none; font-size: 0.8rem; padding: 0.3rem 0.6rem;" onclick="ponerEnMantenimiento('${ticket.id}')">Mandar a Mantenimiento</button>` : `<span class="badge" style="background: var(--warning); color: #000; align-self: center;">Actualmente en Mantenimiento</span>`}
                                    </div>
                                ` : ''}
                            `;
                            adminTicketList.appendChild(div);
                        });
                    }
                }
                ticketSection.style.display = '';
            }
        });
    });

    // --- "VER TODOS" TICKETS LINK ---
    const verTodosLink = document.querySelector('.link-action');
    if (verTodosLink) {
        verTodosLink.onclick = function(e) {
            e.preventDefault();
            // Navegar a Reservas > pestaña Tickets
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            document.querySelector('[data-target="reservas"]').classList.add('active');
            document.getElementById('view-reservas').classList.add('active');
            pageTitle.textContent = viewTitles['reservas'].title;
            pageSubtitle.textContent = viewTitles['reservas'].subtitle;
            btnShare.style.display = 'inline-flex';
            btnShare.innerHTML = "<i class='bx bx-plus'></i> Nueva Reserva";
            btnShare.className = "btn btn-success";
            // Activar pestaña Tickets
            setTimeout(() => { if (tabBtns[1]) tabBtns[1].click(); }, 100);
        };
    }

    // --- BOTÓN TOPBAR (NUEVO ACTIVO / NUEVA RESERVA / EXPORTAR) ---
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            const text = btnShare.textContent.trim();
            if (text.includes('Nueva Reserva')) {
                const modalReserva = document.getElementById('modal-reserva');
                if (modalReserva) modalReserva.classList.add('active');
            } else if (text.includes('Nuevo Activo')) {
                const modalActivo = document.getElementById('modal-activo');
                if (modalActivo) modalActivo.classList.add('active');
            } else if (text.includes('Exportar')) {
                alert('Reporte exportado exitosamente (demostración). En producción se generaría un PDF/Excel.');
            }
        });
    }

    // --- LÓGICA MODAL ACTIVO ---
    const modalActivo = document.getElementById('modal-activo');
    const closeActivoBtn = document.getElementById('close-modal-activo');
    const btnSubmitActivo = document.getElementById('btn-submit-activo');

    if (closeActivoBtn && modalActivo) {
        closeActivoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalActivo.classList.remove('active');
        });
    }
    if (modalActivo) {
        modalActivo.addEventListener('click', (e) => {
            if (e.target === modalActivo) modalActivo.classList.remove('active');
        });
    }
    if (btnSubmitActivo) {
        btnSubmitActivo.addEventListener('click', () => {
            const codigo = document.getElementById('input-codigo-activo').value;
            const nombre = document.getElementById('input-nombre-activo').value;
            const desc = document.getElementById('input-desc-activo').value;
            const cat = document.getElementById('select-categoria-activo').value;
            const estado = document.getElementById('select-estado-activo').value;
            const cancha = document.getElementById('select-cancha-activo').value;
            const valor = document.getElementById('input-valor-activo').value;

            if (!codigo || !nombre || !valor) {
                alert('Por favor, completa al menos el código, nombre y valor.');
                return;
            }

            // Crear nueva fila en la tabla de inventario
            const tbody = document.querySelector('#view-inventario .table tbody');
            if (tbody) {
                const tr = document.createElement('tr');
                const fecha = new Date().toLocaleDateString('es-ES', {day: 'numeric', month: 'numeric', year: 'numeric'});
                const valorFormat = '$' + parseInt(valor).toLocaleString('es-CO');
                const estadoClass = estado === 'Excelente' ? 'dark' : (estado === 'Bueno' ? 'success' : (estado === 'Regular' ? 'secondary' : 'danger'));

                tr.innerHTML = `
                    <td class="fw-bold text-dark">${codigo}</td>
                    <td>
                        <div class="item-name">${nombre}</div>
                        <div class="item-desc">${desc || 'Sin descripción'}</div>
                    </td>
                    <td>${cat}</td>
                    <td><span class="badge-status ${estadoClass}">${estado}</span></td>
                    <td>${cancha}</td>
                    <td>${fecha}</td>
                    <td>${valorFormat}</td>
                `;
                tbody.insertBefore(tr, tbody.firstChild);
            }

            alert('¡Activo registrado con éxito!');
            document.getElementById('form-activo').reset();
            modalActivo.classList.remove('active');
        });
    }

    // --- MODAL RESERVA ---
    const modalReserva = document.getElementById('modal-reserva');
    const closeModalBtn = document.getElementById('close-modal');

    if (closeModalBtn && modalReserva) {
        closeModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalReserva.classList.remove('active');
        });
    }
    // Cerrar modal al hacer click fuera
    if (modalReserva) {
        modalReserva.addEventListener('click', (e) => {
            if (e.target === modalReserva) modalReserva.classList.remove('active');
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
            const comentario = document.getElementById('input-comentario') ? document.getElementById('input-comentario').value : '';

            if (!cliente || !fecha || !horario) {
                alert("Por favor completa los campos.");
                return;
            }

            // VALIDACIÓN DE CONFLICTO
            const reservas = getReservas();
            const conflicto = reservas.some(r => 
                r.estado === 'Confirmada' && 
                r.cancha === canchaText && 
                r.fecha === fecha && 
                r.horario === horario
            );

            if (conflicto) {
                alert('Ese horario ya no está disponible para esta cancha. Ya existe una reserva confirmada.');
                return;
            }

            const nuevaReserva = {
                cliente: cliente,
                cancha: canchaText,
                fecha: fecha,
                horario: horario,
                precio: precioStr,
                comentario: comentario,
                estado: 'Confirmada',
                creadoPor: 'admin'
            };

            saveReserva(nuevaReserva);
            alert("¡Reserva guardada con éxito!");
            window.location.reload();
        });
    }

    // --- RENDERIZADO DINÁMICO DE RESERVAS (ADMIN) ---
    const tbodyAdmin = document.getElementById('tbody-reservas-admin');
    if (tbodyAdmin) {
        const reservasBD = getReservas();
        reservasBD.reverse().forEach(res => {
            const formatFecha = new Date(res.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            const tr = document.createElement('tr');
            // Agregamos data-estado y data-fecha para filtrado fácil
            tr.setAttribute('data-estado', res.estado);
            tr.setAttribute('data-fecha', res.fecha);
            
            tr.innerHTML = `
                <td class="fw-bold text-primary">${res.id}</td>
                <td>
                    <div class="item-name">${res.cliente}</div>
                    <div class="item-desc">Registrado por ${res.creadoPor === 'admin' ? 'Admin' : 'Usuario'}</div>
                    ${res.comentario ? `<div class="item-desc" style="font-style: italic; font-size: 0.8rem; color: #666; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${res.comentario}">💬 ${res.comentario}</div>` : ''}
                </td>
                <td><span class="badge-outline rounded-sm">${res.cancha}</span></td>
                <td>${formatFecha}</td>
                <td>${res.horario}</td>
                <td>-</td>
                <td><span class="badge-status ${res.estado === 'Confirmada' ? 'bg-green' : (res.estado === 'Pendiente' ? 'bg-gray' : 'bg-danger')}">${res.estado}</span></td>
                <td>${res.precio}</td>
                <td>
                    <button class="btn-icon" title="Ver" onclick="verReserva('${res.id}')"><i class='bx bx-show'></i></button>
                    ${res.estado === 'Pendiente' ? `<button class="btn-icon text-success" title="Confirmar" onclick="confirmarReserva(this)"><i class='bx bx-check-circle'></i></button>` : ''}
                    <button class="btn-icon text-danger" title="Cancelar" onclick="cancelarReserva(this)"><i class='bx bx-x-circle'></i></button>
                </td>
            `;
            tbodyAdmin.insertBefore(tr, tbodyAdmin.firstChild);
        });

        // --- LÓGICA DE KPI CARDS Y FILTRADO DE TABLA ---
        const rows = tbodyAdmin.querySelectorAll('tr');
        let countHoy = 0, countConf = 0, countPend = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        // Calcular estáticos y dinámicos
        rows.forEach(row => {
            const estadoSpan = row.querySelector('.badge-status');
            const estado = estadoSpan ? estadoSpan.textContent.trim() : '';
            const dataFecha = row.getAttribute('data-fecha'); // Solo dinámicos tienen esto
            
            if (estado === 'Confirmada') countConf++;
            if (estado === 'Pendiente') countPend++;
            if (dataFecha === todayStr) countHoy++;
        });

        // Actualizar UI
        const elHoy = document.getElementById('count-hoy');
        const elConf = document.getElementById('count-confirmadas');
        const elPend = document.getElementById('count-pendientes');
        const elTodas = document.getElementById('count-todas');

        if (elHoy) elHoy.textContent = countHoy;
        if (elConf) elConf.textContent = countConf;
        if (elPend) elPend.textContent = countPend;
        if (elTodas) elTodas.textContent = rows.length;

        // Agregar eventos click a las tarjetas para filtrar
        const cardHoy = document.getElementById('kpi-reservas-hoy');
        const cardConf = document.getElementById('kpi-reservas-confirmadas');
        const cardPend = document.getElementById('kpi-reservas-pendientes');
        const cardTodas = document.getElementById('kpi-reservas-todas');

        function filterTable(filterType) {
            rows.forEach(row => {
                const estadoSpan = row.querySelector('.badge-status');
                const estado = estadoSpan ? estadoSpan.textContent.trim() : '';
                const dataFecha = row.getAttribute('data-fecha');

                let show = false;
                if (filterType === 'hoy') {
                    show = (dataFecha === todayStr);
                } else if (filterType === 'confirmadas') {
                    show = (estado === 'Confirmada');
                } else if (filterType === 'pendientes') {
                    show = (estado === 'Pendiente');
                } else {
                    show = true; // todas
                }
                row.style.display = show ? '' : 'none';
            });
            
            // Efecto visual en las tarjetas
            [cardHoy, cardConf, cardPend, cardTodas].forEach(c => {
                if(c) c.style.opacity = '0.5';
            });
            if (filterType === 'hoy' && cardHoy) cardHoy.style.opacity = '1';
            else if (filterType === 'confirmadas' && cardConf) cardConf.style.opacity = '1';
            else if (filterType === 'pendientes' && cardPend) cardPend.style.opacity = '1';
            else if (cardTodas) cardTodas.style.opacity = '1';
        }

        if (cardHoy) cardHoy.addEventListener('click', () => filterTable('hoy'));
        if (cardConf) cardConf.addEventListener('click', () => filterTable('confirmadas'));
        if (cardPend) cardPend.addEventListener('click', () => filterTable('pendientes'));
        if (cardTodas) cardTodas.addEventListener('click', () => filterTable('todas'));
        
        // Inicializar opacidad
        if (cardTodas) cardTodas.style.opacity = '1';
        [cardHoy, cardConf, cardPend].forEach(c => {
            if(c) c.style.opacity = '0.5';
        });
    }

    // --- NOTIFICACIONES DEL ADMINISTRADOR (CAMPANA) ---
    const btnNotificationsAdmin = document.getElementById('btn-notifications');
    const notifDropdownAdmin = document.getElementById('notif-dropdown');
    const notifBadgeAdmin = document.getElementById('notif-badge');
    const notifCountTextAdmin = document.getElementById('notif-count-text');
    const notifListAdmin = document.getElementById('notif-list');

    if (btnNotificationsAdmin && notifListAdmin) {
        const allTicketsBD = getTickets();
        const allReservasBD = getReservas();
        let adminNotifs = [];

        // 1. Tickets reportados por el usuario
        allTicketsBD.forEach(ticket => {
            if (ticket.creadoPor !== 'admin' && !ticket.notificadaAdmin) {
                adminNotifs.push({
                    type: 'ticket',
                    id: ticket.id,
                    title: 'Nuevo Reporte de Usuario',
                    desc: `Un usuario reportó: ${ticket.titulo} en ${ticket.cancha}.`,
                    time: ticket.fecha,
                    obj: ticket
                });
            }
        });

        // 2. Nuevas reservas pendientes
        allReservasBD.forEach(res => {
            if (res.estado === 'Pendiente' && !res.notificadaAdmin) {
                adminNotifs.push({
                    type: 'reserva',
                    id: res.id,
                    title: 'Nueva Reserva Pendiente',
                    desc: `${res.cliente} ha solicitado ${res.cancha}.`,
                    time: res.fecha,
                    obj: res
                });
            }
        });

        // Renderizar notificaciones
        if (adminNotifs.length > 0) {
            notifBadgeAdmin.style.display = 'block';
            notifBadgeAdmin.textContent = adminNotifs.length;
            if (notifCountTextAdmin) notifCountTextAdmin.textContent = `${adminNotifs.length} Nuevas`;

            notifListAdmin.innerHTML = '';
            adminNotifs.forEach(notif => {
                const item = document.createElement('div');
                item.style.cssText = "padding: 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;";
                item.onmouseover = () => item.style.background = '#f8fafc';
                item.onmouseout = () => item.style.background = 'white';
                
                const iconType = notif.type === 'ticket' ? 'bx-error-circle' : 'bx-calendar-event';
                const iconColor = notif.type === 'ticket' ? 'var(--danger)' : 'var(--primary)';

                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.25rem;">
                        <strong style="color:${iconColor}; font-size: 0.9rem;"><i class='bx ${iconType}'></i> ${notif.title}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${notif.time}</span>
                    </div>
                    <div style="font-size: 0.85rem; margin-bottom: 0.25rem; color: var(--text-dark);">${notif.desc}</div>
                `;
                
                item.addEventListener('click', () => {
                    notifDropdownAdmin.style.display = 'none';
                    
                    if (notif.type === 'ticket') {
                        const dbT = getTickets();
                        const i = dbT.findIndex(t => t.id === notif.id);
                        if (i !== -1) {
                            dbT[i].notificadaAdmin = true;
                            localStorage.setItem(DB_TICKETS, JSON.stringify(dbT));
                        }
                    } else {
                        const dbR = getReservas();
                        const i = dbR.findIndex(r => r.id === notif.id);
                        if (i !== -1) {
                            dbR[i].notificadaAdmin = true;
                            localStorage.setItem(DB_RESERVAS, JSON.stringify(dbR));
                        }
                    }
                    window.location.reload();
                });
                notifListAdmin.appendChild(item);
            });
        } else {
            notifBadgeAdmin.style.display = 'none';
            if (notifCountTextAdmin) notifCountTextAdmin.textContent = `0 Nuevas`;
            notifListAdmin.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No hay notificaciones nuevas.</div>';
        }

        // Toggle del Dropdown
        btnNotificationsAdmin.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifDropdownAdmin) {
                notifDropdownAdmin.style.display = notifDropdownAdmin.style.display === 'none' ? 'block' : 'none';
            }
        });
        document.addEventListener('click', (e) => {
            if (notifDropdownAdmin && !notifDropdownAdmin.contains(e.target) && e.target !== btnNotificationsAdmin && !btnNotificationsAdmin.contains(e.target)) {
                notifDropdownAdmin.style.display = 'none';
            }
        });
    }

    // --- CIERRE DE SESIÓN ---
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('gesticanchas_session');
            window.location.href = 'login.html';
        });
    }

    // --- ALERTS DE MANTENIMIENTO (ADMIN) ---
    const adminAlertsContainer = document.getElementById('admin-maintenance-alerts');
    const badgeAdminTickets = document.getElementById('badge-admin-tickets');
    if (adminAlertsContainer) {
        const allTickets = getTickets();
        const activeMaintenance = allTickets.filter(t => t.estado === 'En Mantenimiento');
        
        if (badgeAdminTickets) {
            badgeAdminTickets.textContent = activeMaintenance.length;
            if (activeMaintenance.length === 0) {
                badgeAdminTickets.style.display = 'none';
            }
        }

        activeMaintenance.forEach(ticket => {
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = "background-color: #fffbeb; border: 1px solid #f59e0b; color: #b45309; padding: 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;";
            alertDiv.innerHTML = `
                <div>
                    <i class='bx bx-error' style="font-size: 1.2rem; vertical-align: middle;"></i> 
                    <strong>${ticket.cancha}</strong> en Mantenimiento desde ${ticket.fecha}. 
                    <i style="color: #555; font-size: 0.9rem;">(Motivo: ${ticket.motivo})</i>
                </div>
                <button onclick="quitarMantenimiento('${ticket.id}')" class="btn" style="background-color: #10b981; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.85rem;">
                    <i class='bx bx-check'></i> Finalizar
                </button>
            `;
            adminAlertsContainer.appendChild(alertDiv);
        });
    }

    // --- MODAL DE MANTENIMIENTO ---
    const modalMant = document.getElementById('modal-mantenimiento');
    const btnOpenMant = document.getElementById('btn-open-mantenimiento');
    const closeMant = document.getElementById('close-modal-mantenimiento');
    const btnSubmitMant = document.getElementById('btn-submit-mantenimiento');

    if (btnOpenMant && modalMant) {
        btnOpenMant.addEventListener('click', () => modalMant.classList.add('active'));
    }
    if (closeMant && modalMant) {
        closeMant.addEventListener('click', () => modalMant.classList.remove('active'));
    }

    if (btnSubmitMant) {
        btnSubmitMant.addEventListener('click', () => {
            const cancha = document.getElementById('select-cancha-mant').value;
            const motivo = document.getElementById('input-motivo-mant').value;

            if (!motivo) {
                alert("Por favor ingresa un motivo para el mantenimiento.");
                return;
            }

            saveTicket({
                titulo: `Mantenimiento Programado`,
                cancha: cancha,
                prioridad: 'Alta',
                estado: 'En Mantenimiento',
                motivo: motivo,
                creadoPor: 'admin'
            });

            alert(`La ${cancha} ha sido puesta en mantenimiento exitosamente.`);
            window.location.reload();
        });
    }

});
