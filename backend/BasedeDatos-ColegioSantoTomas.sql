-- 1. Crear la base de datos
CREATE DATABASE SantoTomasDB;
GO

USE SantoTomasDB;
GO

-- =============================================
-- 2. CREACIÓN DE TABLAS
-- =============================================

-- 2.1. Usuarios
CREATE TABLE Usuarios (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    usuario     VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    correo      VARCHAR(100) NULL,
    rol         VARCHAR(20)  NOT NULL CHECK (rol IN ('estudiante', 'profesor', 'administrador')),
    anio        VARCHAR(20)  NULL,  -- año del estudiante (ej: '5to'). Solo aplica a rol = 'estudiante'
    activo      BIT          NOT NULL DEFAULT 1,
    creado_en   DATETIME     DEFAULT GETDATE()
);
GO

-- 2.2. Cursos (solo la materia, sin grado/sección/profesor)
CREATE TABLE Cursos (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    creado_en    DATETIME DEFAULT GETDATE()
);
GO

-- 2.3. Configuración del colegio
CREATE TABLE Configuracion (
    id    INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor VARCHAR(500) NOT NULL DEFAULT ''
);
GO

-- 2.4. Horarios — aquí se define la asignación real:
-- qué curso, con qué profesor, para qué año, qué día y hora
CREATE TABLE Horarios (
    id INT IDENTITY(1,1) PRIMARY KEY,

    curso_id    INT NOT NULL,
    profesor_id INT NULL,
    anio        VARCHAR(20) NOT NULL,

    dia VARCHAR(20) NOT NULL,

    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    CONSTRAINT FK_Horarios_Curso
        FOREIGN KEY (curso_id)
        REFERENCES Cursos(id),

    CONSTRAINT FK_Horarios_Profesor
        FOREIGN KEY (profesor_id)
        REFERENCES Usuarios(id)
);
GO

-- 2.5. Notas — ligadas al bloque de horario (curso + año + profesor)
CREATE TABLE Notas (
    id INT IDENTITY(1,1) PRIMARY KEY,

    estudiante_id INT NOT NULL,
    horario_id    INT NOT NULL,

    nota DECIMAL(5,2) NOT NULL,

    periodo VARCHAR(50) NOT NULL,
    observacion VARCHAR(500) NULL,

    creado_en DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Notas_Estudiante
        FOREIGN KEY (estudiante_id)
        REFERENCES Usuarios(id),

    CONSTRAINT FK_Notas_Horario
        FOREIGN KEY (horario_id)
        REFERENCES Horarios(id)
);
GO

-- 2.6. Asistencias — ligadas al bloque de horario
CREATE TABLE Asistencias (
    id INT IDENTITY(1,1) PRIMARY KEY,

    estudiante_id INT NOT NULL,
    horario_id    INT NOT NULL,

    fecha DATE NOT NULL,

    estado VARCHAR(30) NOT NULL
        CHECK (estado IN ('asistio', 'tardanza', 'falta', 'falta_justificada', 'tardanza_justificada')),

    observacion VARCHAR(300) NULL,

    creado_en DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Asistencias_Estudiante
        FOREIGN KEY (estudiante_id)
        REFERENCES Usuarios(id),

    CONSTRAINT FK_Asistencias_Horario
        FOREIGN KEY (horario_id)
        REFERENCES Horarios(id)
);
GO

-- 2.7. Tareas — ligadas al bloque de horario
CREATE TABLE Tareas (
    id INT IDENTITY(1,1) PRIMARY KEY,

    horario_id INT NOT NULL,

    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,

    fecha_entrega DATE NULL,

    archivo_url VARCHAR(500) NULL,
    solo_indicaciones BIT NOT NULL DEFAULT 0,

    creado_en DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Tareas_Horario
        FOREIGN KEY (horario_id)
        REFERENCES Horarios(id)
);
GO

-- 2.8. Entregas
CREATE TABLE Entregas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tarea_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    archivo_url VARCHAR(500) NULL,
    comentario VARCHAR(500) NULL,
    nota DECIMAL(5,2) NULL,
    entregado_en DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Entregas_Tarea FOREIGN KEY (tarea_id) REFERENCES Tareas(id),
    CONSTRAINT FK_Entregas_Estudiante FOREIGN KEY (estudiante_id) REFERENCES Usuarios(id),
    CONSTRAINT UQ_Entrega UNIQUE (tarea_id, estudiante_id)
    --ALTER TABLE Entregas ADD nota DECIMAL(5,2) NULL;
);
GO

-- 2.9. Mensajes
CREATE TABLE Mensajes (
    id INT IDENTITY(1,1) PRIMARY KEY,

    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,

    asunto VARCHAR(200) NULL,
    mensaje TEXT NOT NULL,

    leido BIT DEFAULT 0,

    creado_en DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Mensajes_Remitente
        FOREIGN KEY (remitente_id)
        REFERENCES Usuarios(id),

    CONSTRAINT FK_Mensajes_Destinatario
        FOREIGN KEY (destinatario_id)
        REFERENCES Usuarios(id)
);
GO

-- 2.10. Comunicados
CREATE TABLE Comunicados (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    titulo      VARCHAR(200) NOT NULL,
    contenido   TEXT         NOT NULL,
    dirigido_a  VARCHAR(20)  NOT NULL CHECK (dirigido_a IN ('estudiantes', 'profesores', 'todos')),
    autor_id    INT          NOT NULL,
    activo      BIT          NOT NULL DEFAULT 1,
    creado_en   DATETIME     DEFAULT GETDATE(),
    CONSTRAINT FK_Comunicados_Autor FOREIGN KEY (autor_id) REFERENCES Usuarios(id)
);
GO

-- 2.11. Registro de actividades (logs)
CREATE TABLE Actividades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    detalle VARCHAR(500),
    creado_en DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Actividades_Usuario FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);
GO

-- =============================================
-- 3. RESTRICCIONES ADICIONALES
-- =============================================

ALTER TABLE Usuarios ADD CONSTRAINT UQ_Usuarios_correo UNIQUE (correo);
GO

-- =============================================
-- 4. INSERTS DE DATOS DE PRUEBA
-- =============================================

-- 4.1. Usuarios (password hash de "123456")
INSERT INTO Usuarios (usuario, password, nombre, apellido, correo, rol, anio) VALUES
(
    'estudiante01',
    '$2b$10$Ue2N9SparlK2gBxZT8CTze.ng0u.bpLQx3GJs2w3zAGdF0jK/ekt6',
    'Carlos',
    'Ramírez',
    'carlos.ramirez@stomas.edu.pe',
    'estudiante',
    '5to'
),
(
    'profesor01',
    '$2b$10$Ue2N9SparlK2gBxZT8CTze.ng0u.bpLQx3GJs2w3zAGdF0jK/ekt6',
    'Ana',
    'Torres',
    'ana.torres@stomas.edu.pe',
    'profesor',
    NULL
),
(
    'admin01',
    '$2b$10$Ue2N9SparlK2gBxZT8CTze.ng0u.bpLQx3GJs2w3zAGdF0jK/ekt6',
    'Luis',
    'Mendoza',
    'luis.mendoza@stomas.edu.pe',
    'administrador',
    NULL
);
GO

-- 4.2. Cursos (solo materia, sin grado/sección)
INSERT INTO Cursos (nombre) VALUES
('Matemática'),
('Comunicación'),
('Ciencia y Tecnología');
GO

-- 4.3. Horarios — aquí se asigna profesor y año al curso
INSERT INTO Horarios (curso_id, profesor_id, anio, dia, hora_inicio, hora_fin) VALUES
(1, 2, '5to', 'Lunes', '07:30', '09:00'),
(1, 2, '5to', 'Lunes', '09:10', '10:50'),
(2, 2, '5to', 'Martes', '07:30', '09:00'),
(3, 2, '5to', 'Miércoles', '07:30', '09:00');
GO

-- 4.4. Configuración inicial del colegio
INSERT INTO Configuracion (clave, valor) VALUES
('colegio_nombre',    'Colegio Santo Tomás de Aquino'),
('colegio_direccion', ''),
('colegio_telefono',  ''),
('colegio_email',     '');
GO

-- =============================================
-- 5. VERIFICACIONES
-- =============================================

SELECT id, usuario, correo, nombre, apellido, rol, anio, activo, creado_en FROM Usuarios;
GO

SELECT * FROM Cursos;
GO

SELECT
    h.id, c.nombre AS curso, h.anio, h.dia, h.hora_inicio, h.hora_fin,
    u.nombre AS profesor_nombre, u.apellido AS profesor_apellido
FROM Horarios h
JOIN Cursos c ON c.id = h.curso_id
LEFT JOIN Usuarios u ON u.id = h.profesor_id;
GO

SELECT * FROM Configuracion;
GO


-- Comprobación Post-Automatización:   
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('Cursos', 'Matriculas', 'Usuarios')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

CREATE TABLE Matriculas (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    estudiante_id INT NOT NULL,
    grado         VARCHAR(30) NOT NULL,
    seccion       VARCHAR(10) NOT NULL,
    creado_en     DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Matriculas_Usuarios FOREIGN KEY (estudiante_id)
        REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Matriculas UNIQUE (estudiante_id, grado, seccion)
);
GO

UPDATE Usuarios SET apellido = 'Mendoza' WHERE id = 3;