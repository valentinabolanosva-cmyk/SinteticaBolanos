// Sistema básico de Autenticación con LocalStorage

document.addEventListener('DOMContentLoaded', () => {
    
    // Configuración base de base de datos mock (localStorage)
    const DB_USERS_KEY = 'gesticanchas_users';
    const DB_SESSION_KEY = 'gesticanchas_session';

    // Inicializar el arreglo de usuarios si no existe
    if (!localStorage.getItem(DB_USERS_KEY)) {
        // Crear un usuario administrador de prueba por defecto
        const defaultUsers = [
            { email: 'admin@gesticanchas.com', password: 'password123', name: 'Administrador', role: 'admin' }
        ];
        localStorage.setItem(DB_USERS_KEY, JSON.stringify(defaultUsers));
    }

    // Funciones Helper
    const getUsers = () => JSON.parse(localStorage.getItem(DB_USERS_KEY));
    const setUsers = (users) => localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    
    // --- MIGRACIÓN DE DATOS (Por si tenías cuentas registradas antes de la actualización de Roles) ---
    let existingUsers = getUsers();
    if (existingUsers) {
        let needsUpdate = false;
        existingUsers.forEach(u => {
            if (!u.role) { // Si la cuenta no tiene rol (cuenta antigua)
                u.role = (u.email === 'admin@gesticanchas.com') ? 'admin' : 'user';
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            setUsers(existingUsers);
        }
    }

    // Si ya hay sesión activa y estamos en página de login/register, prevenir acceso (mandar al dashboard correcto)
    const activeSessionStr = localStorage.getItem(DB_SESSION_KEY);
    if (activeSessionStr) {
        let session = JSON.parse(activeSessionStr);
        // Migración de sesión si no tiene rol cacheado
        if (!session.role) {
            session.role = (session.email === 'admin@gesticanchas.com') ? 'admin' : 'user';
            localStorage.setItem(DB_SESSION_KEY, JSON.stringify(session));
        }
        window.location.href = session.role === 'admin' ? 'index.html' : 'usuario.html';
        return; // Detener ejecución aquí
    }

    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const errorMsg = document.getElementById('login-error');
            
            errorMsg.style.display = 'none'; // ocultar anterior

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Iniciar sesión
                const sessionA = { email: user.email, name: user.name, role: user.role };
                localStorage.setItem(DB_SESSION_KEY, JSON.stringify(sessionA));
                
                // Redirigir según el rol
                if (user.role === 'admin') {
                    window.location.href = 'index.html';
                } else {
                    window.location.href = 'usuario.html';
                }
            } else {
                // Error de credenciales
                errorMsg.style.display = 'block';
            }
        });
    }

    // --- LÓGICA DE REGISTRO ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            
            const errorMsg = document.getElementById('register-error');
            const successMsg = document.getElementById('register-success');
            
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            const users = getUsers();
            
            // Verificar si el correo ya está registrado
            if (users.some(u => u.email === email)) {
                errorMsg.textContent = 'Este correo electrónico ya está registrado.';
                errorMsg.style.display = 'block';
                return;
            }

            // Registrar nuevo usuario con rol de cliente 'user'
            users.push({ name, email, password, role: 'user' });
            setUsers(users);

            // Mostrar éxito y redirigir
            successMsg.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
});
