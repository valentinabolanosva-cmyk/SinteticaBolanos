-- ==========================================================
-- SCRIPT DE BASE DE DATOS ESTRUCTURA NORMALIZADA (MySQL)
-- Proyecto: SintéticaBolaños (GestiCanchas)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS sintetica_bolanos
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sintetica_bolanos;

-- 1. TABLA: usuarios
-- Gestiona tanto a los administradores como a los clientes (RBAC)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    celular VARCHAR(20),
    rol ENUM('admin', 'user') DEFAULT 'user',
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: deportes
-- Normalización de los deportes soportados
CREATE TABLE deportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 3. TABLA: canchas
-- Estructura de las instalaciones asignadas a los deportes
CREATE TABLE canchas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- Ej: Cancha 1, Cancha VIP
    deporte_id INT NOT NULL,
    tipo_superficie VARCHAR(50),  -- Ej: Sintética, Polvo de Ladrillo
    precio_hora DECIMAL(10, 2) NOT NULL,
    estado ENUM('activa', 'mantenimiento', 'clausurada') DEFAULT 'activa',
    FOREIGN KEY (deporte_id) REFERENCES deportes(id) ON DELETE RESTRICT
);

-- 4. TABLA: reservas
-- Gestiona todas las reservaciones. Se guarda un 'nombre_equipo' adicional por si el
-- cliente quiere anexar su equipo al registrar la reserva temporal.
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE, -- Ej: RES-2026-001
    usuario_id INT NOT NULL,  -- Quien solicita o dueño de la cuenta
    cancha_id INT NOT NULL,
    nombre_equipo VARCHAR(100), -- Nombre de fantasía opcional
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_horas DECIMAL(4, 2) NOT NULL,
    precio_final DECIMAL(10, 2) NOT NULL,
    estado ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Completada') DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cancha_id) REFERENCES canchas(id) ON DELETE RESTRICT
);

-- 5. TABLA: categorias_inventario
-- Clasificación de los activos
CREATE TABLE categorias_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 6. TABLA: inventario
-- Control de todos los activos, luces, césped, balones.
CREATE TABLE inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- Ej: BAL-005, CSP-001
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_id INT NOT NULL,
    cancha_id INT NULL, -- Puede ser nulo si el activo es general (un balón) y no fijo de una cancha.
    estado ENUM('Excelente', 'Bueno', 'Regular', 'Malo') DEFAULT 'Bueno',
    fecha_adquisicion DATE,
    fecha_ultimo_mantenimiento DATE,
    valor_estimado DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias_inventario(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancha_id) REFERENCES canchas(id) ON DELETE SET NULL
);

-- 7. TABLA: tickets_soporte
-- Mantenimiento y reportes generados tanto por usuarios como administradores
CREATE TABLE tickets_soporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- Ej: TKT-1020
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    usuario_reporta_id INT NOT NULL,
    cancha_asociada_id INT NULL,
    prioridad ENUM('Baja', 'Media', 'Alta', 'Crítica') DEFAULT 'Baja',
    estado ENUM('Abierto', 'En Revisión', 'En Progreso', 'Resuelto') DEFAULT 'Abierto',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    FOREIGN KEY (usuario_reporta_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cancha_asociada_id) REFERENCES canchas(id) ON DELETE SET NULL
);

-- ==========================================================
-- DATOS DE POBLACIÓN DE PRUEBA (DUMMY DATA)
-- ==========================================================

-- Insertar Cuentas Principales
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES 
('Administrador', 'admin@gesticanchas.com', 'hash_de_password123', 'admin'),
('Juan Pérez', 'juan.perez@cliente.com', 'hash_de_password_jp', 'user');

-- Insertar Deportes Base
INSERT INTO deportes (nombre) VALUES 
('Fútbol'), ('Tenis'), ('Baloncesto'), ('Voleibol');

-- Insertar Canchas
INSERT INTO canchas (nombre, deporte_id, tipo_superficie, precio_hora) VALUES 
('Cancha 1 (Fútbol 5)', 1, 'Césped Sintético', 60000.00),
('Cancha 2 (Fútbol 7)', 1, 'Césped Sintético', 80000.00),
('Cancha 5 (Fútbol 11)', 1, 'Césped Sintético', 150000.00),
('Cancha Principal de Tenis', 2, 'Polvo de Ladrillo', 45000.00),
('Cancha Múltiple Central', 3, 'Concreto Acrílico', 35000.00);

-- Insertar Categorías de Inventario
INSERT INTO categorias_inventario (nombre) VALUES 
('Infraestructura'), ('Equipamiento'), ('Iluminación');

-- Insertar ejemplos de Inventario
INSERT INTO inventario (codigo, nombre, categoria_id, cancha_id, valor_estimado) VALUES 
('CSP-001', 'Césped Sintético Principal', 1, 1, 45000000.00),
('BAL-010', 'Set 5 Balones Golty', 2, NULL, 500000.00);
