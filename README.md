# GestiCanchas - Manual de Instalación y Despliegue en Linux

Este documento explica paso a paso cómo desplegar el proyecto (Frontend y Backend API) en un entorno Linux (ej. Ubuntu/Debian), cumpliendo con los estándares requeridos para la sustentación.

## Requisitos Previos

Asegúrese de tener un servidor Linux con acceso a la terminal y permisos de `sudo`.

### 1. Actualizar repositorios
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js y npm
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Instalar MySQL Server
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

---

## Configuración de la Base de Datos MySQL

1. Ingrese a la consola de MySQL:
   ```bash
   sudo mysql -u root
   ```

2. Dentro de MySQL, verifique sus credenciales (si necesita configurar contraseña). Luego salga de la consola.
   
3. Importe el archivo `.sql` proporcionado en el proyecto para crear la estructura normalizada:
   ```bash
   mysql -u root -p < db_sintetica_bolanos.sql
   ```
   *(La contraseña por defecto suele estar vacía si acaba de instalar. Si se la pide, digítela).*

4. Verifique que las tablas se hayan creado correctamente:
   ```bash
   mysql -u root -p -e "SHOW TABLES IN sintetica_bolanos;"
   ```

---

## Despliegue del Back-End (API Node.js)

1. Navegue al directorio del backend:
   ```bash
   cd Proyecto/backend
   ```

2. Instale las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Configure las variables de entorno. Edite o cree el archivo `.env` dentro de `backend/`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=su_contraseña_aqui
   DB_NAME=sintetica_bolanos
   PORT=3000
   ```

4. **Puesta en producción usando PM2:**  
   Para mantener el servidor activo en segundo plano y reiniciar automáticamente si falla, instale PM2:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "gesticanchas-api"
   pm2 startup
   pm2 save
   ```
   *(Puede monitorear la API usando `pm2 status` o `pm2 logs`)*.

---

## Configuración del Front-End (Servidor Web Nginx)

1. Instale el servidor web **Nginx**:
   ```bash
   sudo apt install -y nginx
   ```

2. Copie los archivos del Front-End (HTML, CSS, JS) a la carpeta pública de Nginx:
   ```bash
   sudo cp -r Proyecto/* /var/www/html/
   ```
   *(Asegúrese de que el archivo `index.html` quede ubicado en `/var/www/html/index.html`).*

3. Reinicie Nginx para aplicar cambios:
   ```bash
   sudo systemctl restart nginx
   ```

---

## ¡Despliegue Listo!

El proyecto ahora está desplegado y funcionando en red:
- **Frontend UI/UX:** Accesible desde cualquier navegador ingresando la IP del servidor o `http://localhost/`
- **Backend API:** Operando como microservicio en el puerto 3000 `http://localhost:3000/api/`
