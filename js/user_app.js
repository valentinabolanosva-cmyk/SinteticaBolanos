// Guardián de Ruta
const stSession = localStorage.getItem('gesticanchas_session');
if (!stSession) {
    window.location.href = 'login.html';
} else {
    const jSession = JSON.parse(stSession);
    if (jSession.role === 'admin') {
        window.location.href = 'index.html';
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

function marcarComoLista(codigo) {
    if (confirm('¿Ya jugaste tu partido y deseas marcar esta reserva como completada?')) {
        const reservas = getReservas();
        const index = reservas.findIndex(r => r.id === codigo);
        if (index !== -1) {
            reservas[index].estado = 'Completada';
            localStorage.setItem(DB_RESERVAS, JSON.stringify(reservas));
            window.location.reload();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // --- DATOS DEL USUARIO ---
    const sessionData = JSON.parse(localStorage.getItem('gesticanchas_session'));
    if (sessionData && sessionData.name) {
        document.getElementById('sidebar-user-name').textContent = sessionData.name;
        document.getElementById('greeting-name').textContent = sessionData.name.split(' ')[0];
    }

    // --- NAVEGACIÓN ---
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

    // --- FECHA ACTUAL ---
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    // --- MODAL DE RESERVA ---
    const modalReserva = document.getElementById('modal-reserva');
    const closeModalBtn = document.getElementById('close-modal');

    // --- MODAL DE SOPORTE (crear dinámicamente) ---
    let modalSoporte = document.getElementById('modal-soporte');
    if (!modalSoporte) {
        modalSoporte = document.createElement('div');
        modalSoporte.id = 'modal-soporte';
        modalSoporte.className = 'modal-overlay';
        modalSoporte.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3 class="modal-title">Reportar Problema</h3>
                    <button class="modal-close" id="close-modal-soporte">&times;</button>
                </div>
                <form id="form-soporte">
                    <div style="margin-bottom:1rem;">
                        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Título del Problema</label>
                        <input id="input-titulo-ticket" type="text" placeholder="Ej. Reflector dañado en Cancha 2" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:var(--radius-md);font-family:inherit;">
                    </div>
                    <div style="margin-bottom:1rem;">
                        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Cancha Afectada</label>
                        <select id="select-cancha-ticket" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:var(--radius-md);font-family:inherit;">
                            <option>Cancha 1</option>
                            <option>Cancha 2</option>
                            <option>Cancha 3</option>
                            <option>Cancha de Tenis</option>
                            <option>Cancha de Baloncesto</option>
                            <option>Área General</option>
                        </select>
                    </div>
                    <div style="margin-bottom:1rem;">
                        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Prioridad</label>
                        <select id="select-prioridad-ticket" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:var(--radius-md);font-family:inherit;">
                            <option>Baja</option>
                            <option>Media</option>
                            <option selected>Alta</option>
                            <option>Crítica</option>
                        </select>
                    </div>
                    <div style="margin-bottom:1rem;">
                        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Descripción</label>
                        <textarea id="input-desc-ticket" rows="3" placeholder="Describe el problema en detalle..." style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:var(--radius-md);font-family:inherit;resize:vertical;"></textarea>
                    </div>
                    <button id="btn-submit-ticket" type="button" class="btn btn-primary" style="width:100%;padding:0.8rem;margin-top:0.5rem;">
                        Enviar Reporte
                    </button>
                </form>
            </div>
        `;
        document.querySelector('.app-container').appendChild(modalSoporte);

        // Eventos del modal soporte
        document.getElementById('close-modal-soporte').addEventListener('click', () => {
            modalSoporte.classList.remove('active');
        });
        modalSoporte.addEventListener('click', (e) => {
            if (e.target === modalSoporte) modalSoporte.classList.remove('active');
        });
        document.getElementById('btn-submit-ticket').addEventListener('click', () => {
            const titulo = document.getElementById('input-titulo-ticket').value;
            const cancha = document.getElementById('select-cancha-ticket').value;
            const prioridad = document.getElementById('select-prioridad-ticket').value;
            const desc = document.getElementById('input-desc-ticket').value;

            if (!titulo || !desc) {
                alert('Por favor completa el título y la descripción.');
                return;
            }

            saveTicket({ titulo, cancha, prioridad, descripcion: desc, estado: 'Abierto', creadoPor: 'user' });
            alert('¡Reporte enviado con éxito! El equipo de mantenimiento lo revisará pronto.');
            modalSoporte.classList.remove('active');
            window.location.reload();
        });
    }

    // --- BOTÓN DE ACCIÓN TOPBAR ---
    if (btnAction) {
        btnAction.addEventListener('click', () => {
            const text = btnAction.textContent.trim();
            if (text.includes('Nueva Reserva')) {
                if (modalReserva) modalReserva.classList.add('active');
            } else if (text.includes('Reportar Problema')) {
                modalSoporte.classList.add('active');
            }
        });
    }

    if (closeModalBtn && modalReserva) {
        closeModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalReserva.classList.remove('active');
        });
    }
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
            const comentario = document.getElementById('input-comentario') ? document.getElementById('input-comentario').value : '';

            if (!fecha || !horario) {
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
                alert('Lo sentimos, este horario ya no está disponible para esta cancha. Por favor, elige otro horario.');
                return;
            }

            saveReserva({
                cliente, email: emailCliente, cancha: canchaText,
                fecha, horario, precio: precioStr, comentario: comentario,
                estado: 'Pendiente', creadoPor: 'user'
            });

            alert("¡Reserva solicitada con éxito! Está pendiente de aprobación.");
            window.location.reload();
        });
    }

    // --- RENDERIZADO DINÁMICO DE RESERVAS (USER) ---
    const tbodyUser = document.getElementById('tbody-reservas-user');
    const nextReservaContainer = document.getElementById('next-reserva-container');
    const sessionObj = JSON.parse(localStorage.getItem('gesticanchas_session'));
    const emailCliente = sessionObj ? sessionObj.email : '';
    if (tbodyUser && emailCliente) {
        const reservasBD = getReservas();
        
        // Filtrar reservas del usuario actual
        const misReservas = reservasBD.filter(res => res.email === emailCliente || res.cliente === sessionObj.name);
        
        // Limpiar tabla (quitar las de demo)
        tbodyUser.innerHTML = '';
        
        misReservas.slice().reverse().forEach(res => {
            const formatFecha = new Date(res.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
            let colorClass = res.estado === 'Confirmada' ? 'bg-green' : (res.estado === 'Cancelada' ? 'bg-danger' : 'bg-gray');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatFecha}</td>
                <td>
                    <span class="fw-bold">${res.cancha}</span><br>
                    <small style="color:var(--text-muted)">${res.id}</small>
                    ${res.comentario ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background-color: #f8fafc; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-size: 0.8rem; font-style: italic; color: #555; max-width: 250px;">💬 ${res.comentario}</div>` : ''}
                </td>
                <td>${res.horario}</td>
                <td><span class="badge-status ${colorClass}">${res.estado}</span></td>
            `;
            tbodyUser.insertBefore(tr, tbodyUser.firstChild);
        });

        // Buscar próxima reserva confirmada (la más reciente hacia el futuro)
        // Para simplificar, buscamos la primera confirmada en la lista (que por orden de inserción es la más reciente o próxima si no tenemos validación de fechas pasadas)
        if (nextReservaContainer) {
            const proximas = misReservas.filter(res => res.estado === 'Confirmada');
            if (proximas.length > 0) {
                // Tomamos la última creada o idealmente la más cercana en fecha
                // Como las nuevas se agregan al inicio del array en saveReserva, la [0] es la más recientemente creada
                const proxima = proximas[0];
                const formatFecha = new Date(proxima.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                
                nextReservaContainer.innerHTML = `
                    <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h4 style="margin: 0; color: var(--primary); font-size: 1.1rem; margin-bottom: 0.25rem;">${proxima.cancha}</h4>
                            <p style="margin: 0; color: var(--text-dark); font-weight: 500;">${formatFecha}</p>
                            <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;"><i class='bx bx-time'></i> ${proxima.horario}</p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                            <div>
                                <span class="badge-status bg-green" style="margin-bottom: 0.25rem; display: inline-block;">Confirmada</span>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">${proxima.id}</div>
                            </div>
                            <button class="btn" style="padding: 0.5rem 1.5rem; font-size: 0.95rem; font-weight: bold; color: #000; background-color: #fff; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="marcarComoLista('${proxima.id}')">
                                <i class='bx bx-check' style="font-size: 1.2rem; color: #10b981;"></i> LISTO
                            </button>
                        </div>
                    </div>
                `;
            } else {
                nextReservaContainer.innerHTML = `
                    <div style="background-color: #f8fafc; border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: var(--text-muted);">
                        No tienes reservas próximas confirmadas.
                    </div>
                `;
            }
        }
    }

    // --- RENDERIZADO DINÁMICO DE TICKETS, MANTENIMIENTOS Y NOTIFICACIONES (USER) ---
    const ticketList = document.querySelector('#view-soporte .ticket-list');
    const alertsContainer = document.getElementById('maintenance-alerts-container');
    const selectCanchaDropdown = document.getElementById('select-cancha');
    const recentActivityContainer = document.getElementById('recent-activity-container');
    
    // Elementos de Notificaciones (Campana)
    const btnNotificationsUser = document.getElementById('btn-notifications-user');
    const notifDropdownUser = document.getElementById('notif-dropdown-user');
    const notifBadgeUser = document.getElementById('notif-badge-user');
    const notifCountTextUser = document.getElementById('notif-count-text-user');
    const notifListUser = document.getElementById('notif-list-user');

    if (ticketList || alertsContainer || recentActivityContainer || btnNotificationsUser) {
        const ticketsBD = getTickets();
        const reservasBD = getReservas();
        const canchasEnMantenimiento = [];
        
        let notificaciones = [];
        let activityHTML = '';

        // Procesar Tickets
        ticketsBD.forEach(ticket => {
            // Recopilar canchas en mantenimiento
            if (ticket.estado === 'En Mantenimiento') {
                canchasEnMantenimiento.push(ticket.cancha);
            }

            // Mis tickets (del usuario actual) o simulados para la demo
            // Para la demo, si creadoPor !== 'admin', asumimos que es del usuario
            if (ticket.creadoPor !== 'admin') {
                // Agregar a actividad reciente
                const badgeColor = ticket.prioridad === 'Crítica' ? 'badge-danger' : (ticket.prioridad === 'Alta' ? 'badge-dark' : 'badge-secondary');
                const isResuelto = ticket.estado === 'Resuelto';
                
                let activityItem = `
                    <div class="ticket-item" style="border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; ${isResuelto ? 'background-color: #f8fafc;' : ''}">
                        <div class="flex-between mb-2">
                            <span class="badge ${badgeColor}">${ticket.id}</span>
                            <span class="badge badge-outline" style="${isResuelto ? 'color: var(--success); border-color: var(--success);' : ''}">${ticket.estado}</span>
                        </div>
                        <p class="text-dark" style="font-weight: 500;">${ticket.titulo}</p>
                        ${isResuelto ? `<p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;"><i class='bx bx-check-circle' style="color:var(--success);"></i> Tu reporte ha sido solucionado. ¡Gracias por avisarnos!</p>` : `<p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">Reportado el ${ticket.fecha}</p>`}
                    </div>
                `;
                activityHTML += activityItem;

                // Generar notificación si está resuelto y no fue vista
                if (isResuelto && !ticket.notificadaUser) {
                    notificaciones.push({
                        type: 'ticket',
                        id: ticket.id,
                        title: 'Ticket Resuelto',
                        desc: `Tu reporte de ${ticket.cancha} ha sido solucionado.`,
                        time: 'Reciente',
                        obj: ticket
                    });
                }
            }

            // Renderizar ticket en lista de soporte (solo si existe el contenedor)
            if (ticketList) {
                const badgeColor = ticket.prioridad === 'Crítica' ? 'badge-danger' : (ticket.prioridad === 'Alta' ? 'badge-dark' : 'badge-secondary');
                const div = document.createElement('div');
                div.className = 'ticket-item';
                div.innerHTML = `
                    <div class="ticket-info-top">
                        <span class="ticket-id">${ticket.id}</span>
                        <span class="badge ${badgeColor}">${ticket.prioridad}</span>
                        <span class="badge badge-outline">${ticket.estado}</span>
                    </div>
                    <h4 class="ticket-title">${ticket.titulo}</h4>
                    <p class="ticket-meta">${ticket.cancha} • Reportado el ${ticket.fecha}</p>
                    ${ticket.motivo ? `<p style="margin-top:0.5rem; font-size:0.85rem; color:#555;"><i>Motivo: ${ticket.motivo}</i></p>` : ''}
                `;
                ticketList.insertBefore(div, ticketList.firstChild);
            }
        });

        // Procesar Reservas para Notificaciones
        if (emailCliente) {
            reservasBD.forEach(res => {
                if ((res.email === emailCliente || res.cliente === sessionObj.name) && res.estado !== 'Pendiente' && !res.notificadaUser) {
                    notificaciones.push({
                        type: 'reserva',
                        id: res.id,
                        title: `Reserva ${res.estado}`,
                        desc: `Tu reserva para ${res.cancha} ha sido ${res.estado.toLowerCase()}.`,
                        time: res.fecha,
                        obj: res
                    });
                }
            });
        }

        // Mostrar Actividad Reciente
        if (recentActivityContainer) {
            if (activityHTML === '') {
                recentActivityContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay actividad reciente.</div>`;
            } else {
                recentActivityContainer.innerHTML = activityHTML;
            }
        }

        // Funcionalidad de la Campana de Notificaciones
        function renderNotifications() {
            if (!notifListUser) return;
            
            if (notificaciones.length > 0) {
                notifBadgeUser.style.display = 'block';
                notifBadgeUser.textContent = notificaciones.length;
                notifCountTextUser.textContent = `${notificaciones.length} Nuevas`;
                
                notifListUser.innerHTML = '';
                notificaciones.forEach(notif => {
                    const item = document.createElement('div');
                    item.style.cssText = "padding: 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;";
                    item.onmouseover = () => item.style.background = '#f1f5f9';
                    item.onmouseout = () => item.style.background = 'white';
                    
                    const iconColor = notif.title.includes('Cancelada') ? 'var(--danger)' : 'var(--success)';
                    const iconType = notif.type === 'ticket' ? 'bx-wrench' : (notif.title.includes('Cancelada') ? 'bx-x-circle' : 'bx-check-circle');

                    item.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.25rem;">
                            <strong style="color:${iconColor}; font-size: 0.9rem;"><i class='bx ${iconType}'></i> ${notif.title}</strong>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">${notif.time}</span>
                        </div>
                        <div style="font-size: 0.85rem; margin-bottom: 0.25rem;">${notif.desc}</div>
                    `;
                    item.addEventListener('click', () => {
                        notifDropdownUser.style.display = 'none';
                        
                        // Marcar como vista
                        if (notif.type === 'ticket') {
                            const dbTickets = getTickets();
                            const index = dbTickets.findIndex(t => t.id === notif.id);
                            if (index !== -1) {
                                dbTickets[index].notificadaUser = true;
                                localStorage.setItem(DB_TICKETS, JSON.stringify(dbTickets));
                            }
                        } else {
                            const dbReservas = getReservas();
                            const index = dbReservas.findIndex(r => r.id === notif.id);
                            if (index !== -1) {
                                dbReservas[index].notificadaUser = true;
                                localStorage.setItem(DB_RESERVAS, JSON.stringify(dbReservas));
                            }
                        }
                        
                        // Recargar para limpiar
                        window.location.reload();
                    });
                    notifListUser.appendChild(item);
                });
            } else {
                notifBadgeUser.style.display = 'none';
                notifCountTextUser.textContent = `0 Nuevas`;
                notifListUser.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No tienes notificaciones nuevas</div>';
            }
        }

        renderNotifications();

        if (btnNotificationsUser && notifDropdownUser) {
            btnNotificationsUser.addEventListener('click', (e) => {
                e.stopPropagation();
                notifDropdownUser.style.display = notifDropdownUser.style.display === 'none' ? 'block' : 'none';
            });
            document.addEventListener('click', (e) => {
                if (!notifDropdownUser.contains(e.target) && e.target !== btnNotificationsUser && !btnNotificationsUser.contains(e.target)) {
                    notifDropdownUser.style.display = 'none';
                }
            });
        }

        // Mostrar alertas y deshabilitar opciones
        if (canchasEnMantenimiento.length > 0) {
            // Eliminar duplicados
            const uniqueCanchas = [...new Set(canchasEnMantenimiento)];
            
            if (alertsContainer) {
                uniqueCanchas.forEach(cancha => {
                    const alertDiv = document.createElement('div');
                    alertDiv.style.cssText = "background-color: #fffbeb; border: 1px solid #f59e0b; color: #b45309; padding: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;";
                    alertDiv.innerHTML = `<i class='bx bx-error' style="font-size: 1.2rem;"></i> <strong>Atención:</strong> La ${cancha} se encuentra en mantenimiento y no está disponible para reservas.`;
                    alertsContainer.appendChild(alertDiv);
                });
            }

            // Deshabilitar del select
            if (selectCanchaDropdown) {
                Array.from(selectCanchaDropdown.options).forEach(opt => {
                    if (uniqueCanchas.includes(opt.text)) {
                        opt.disabled = true;
                        opt.text += ' (En Mantenimiento)';
                    }
                });
            }
        }
    }

    // --- CIERRE DE SESIÓN ---
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('gesticanchas_session');
            window.location.href = 'login.html';
        });
    }
});
