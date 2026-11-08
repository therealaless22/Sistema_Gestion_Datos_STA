# Sistema Educativo I.E.P. Santo Tomás de Aquino — Backend API

API RESTful desarrollada con **Node.js**, **Express 5** y **SQL Server** bajo arquitectura **MVC + Servicios**, con protección contra **Inyección SQL**, **CSRF**, **CORS** y **validación de esquemas** en todas las peticiones `POST`, `PUT` y `PATCH`.

---

## 1. Estructura del Proyecto

```text
backend/
├── src/
│   ├── config/           # Configuración (Conexión a SQL Server, CORS, Multer, Variables de entorno)
│   ├── controllers/      # Controladores HTTP (Orquestación de peticiones)
│   ├── models/           # Modelos de datos (Consultas SQL 100% parametrizadas)
│   ├── routes/           # Definición de endpoints REST y middlewares de validación
│   ├── middlewares/      # Autenticación JWT, Roles, Protección CSRF, Validación y Errores
│   ├── services/         # Lógica de negocio (Auditoría, Archivos, Auth, Lotes de Notas)
│   ├── utils/            # Funciones auxiliares (Vista JSON, Sanitizador SQLi, Validadores)
│   └── app.js            # Configuración principal de Express
├── tests/                # Pruebas unitarias ejecutables con node:test
├── .dockerignore         # Archivos excluidos del contexto de Docker
├── .env.example          # Plantilla de variables de entorno
├── Dockerfile            # Definición de imagen Docker para el backend
├── package.json          # Dependencias y scripts
└── server.js             # Punto de entrada que levanta el servidor HTTP
```

---

## 2. Configuración para otro Desarrollador (Docker)

### Requisitos previos
- Tener instalado **Docker** (Docker Engine en Linux o Docker Desktop en Windows/macOS).
- Tener una instancia de **SQL Server** en ejecución con la base de datos `SantoTomasDB` creada y autenticación mixta (usuario `sa` u otro usuario SQL habilitado) escuchando en el puerto `1433`.
  - **En Windows (SQL Server Management Studio + SQL Server Configuration Manager):**
    1. **Modo de autenticación mixta:** Clic derecho en el servidor en SSMS → *Properties* → *Security* → seleccionar **SQL Server and Windows Authentication mode** y habilitar el usuario `sa` (en *Security → Logins → sa → Properties*).
    2. **Habilitar TCP/IP en el puerto 1433:** Abrir **SQL Server Configuration Manager** → *SQL Server Network Configuration* → *Protocols for MSSQLSERVER (o SQLEXPRESS)* → habilitar **TCP/IP** → en la pestaña *IP Addresses* (sección `IPAll`) verificar que **TCP Port** sea `1433` y reiniciar el servicio de SQL Server.

### Paso 1: Configurar el archivo `.env`
En la raíz de la carpeta `backend/`, copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con las credenciales de tu SQL Server:

```env
PORT=3000
DB_SERVER=host.docker.internal
DB_NAME=SantoTomasDB
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=TuPasswordDeSQLServer     <----- Solo cambiarias esto
JWT_SECRET=santo_tomas_clave_secreta_2025
JWT_EXPIRES_IN=8h
```

> **Nota sobre `DB_SERVER`:**
> - Si tu SQL Server corre en tu máquina host (fuera del contenedor), deja `DB_SERVER=host.docker.internal`.
> - Si tu SQL Server corre en otro contenedor dentro de la misma red de Docker, coloca el nombre de ese contenedor (por ejemplo `DB_SERVER=sqlserver`).

### Paso 2: Construir la imagen Docker
Desde la carpeta `backend/`, ejecuta:

```bash
docker build -t santo-tomas-backend .
```

### Paso 3: Ejecutar el contenedor
Si usas **Linux con firewall `ufw` activo**, habilita primero el puerto `1433/tcp` para permitir que el contenedor se comunique con tu SQL Server local:

```bash
sudo ufw allow 1433/tcp
```

Luego ejecuta el contenedor (incluye `--add-host=host.docker.internal:host-gateway` y `-e DB_SERVER=host.docker.internal` para conectarse al SQL Server de tu máquina host tanto en **Linux** como en **Windows/macOS**):

```bash
docker run -d \
  --name santo-tomas-api \
  -p 3000:3000 \
  --env-file .env \
  -e DB_SERVER=host.docker.internal \
  --add-host=host.docker.internal:host-gateway \
  santo-tomas-backend
```

Para verificar que el contenedor arrancó y se conectó a SQL Server correctamente:

```bash
docker logs -f santo-tomas-api
```
Deberías ver:
```text
🚀 Servidor corriendo en http://localhost:3000
✅ Conectado a SQL Server correctamente.
```

#### Comandos útiles de Docker
- **Detener el contenedor:** `docker stop santo-tomas-api`
- **Volver a iniciarlo:** `docker start santo-tomas-api`
- **Eliminar el contenedor:** `docker rm -f santo-tomas-api`
- **Ejecutar las pruebas unitarias dentro del contenedor:**
  ```bash
  docker exec -it santo-tomas-api npm test
  ```

---

## 3. Cómo Configurar Postman paso a paso

### Paso 1: Obtener el Token JWT (`POST /api/login`)
Todas las rutas protegidas requieren un token JWT que identifica al usuario y su rol (`administrador`, `profesor` o `estudiante`).

1. Abre **Postman** y crea una petición **`POST`** a:
   ```text
   http://localhost:3000/api/login
   ```
2. Ve a la pestaña **Body**, selecciona **raw** y elige el tipo **`JSON`**.
3. Ingresa las credenciales del usuario con el rol que desees probar:
   ```json
   {
     "usuario": "admin",
     "password": "tu_password"
   }
   ```
4. Haz clic en **Send**. Recibirás una respuesta como esta:
   ```json
   {
     "mensaje": "Inicio de sesión exitoso.",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "usuario": {
       "id": 1,
       "usuario": "admin",
       "rol": "administrador"
     }
   }
   ```
5. Copia el valor del campo `"token"`.

### Paso 2: Configurar el Token en tus peticiones de Postman
En cualquier petición protegida que vayas a realizar:
1. Ve a la pestaña **Authorization** en Postman.
2. En **Auth Type**, selecciona **`Bearer Token`**.
3. En el campo **Token**, pega el token que copiaste en el Paso 1.
   *(Alternativamente, en la pestaña **Headers**, puedes agregar la clave `Authorization` con el valor `Bearer <TU_TOKEN_JWT>`).*

### Paso 3 (Opcional): Uso del Token CSRF (`GET /api/csrf-token`)
Si deseas probar la validación explícita del token CSRF firmado:
1. Haz una petición **`GET`** a `http://localhost:3000/api/csrf-token`.
2. Copia el valor de `"csrfToken"` de la respuesta.
3. En tus peticiones `POST`, `PUT`, `PATCH` o `DELETE`, agrega en **Headers**:
   - **Key:** `X-CSRF-Token`
   - **Value:** `<valor_de_csrfToken>`

---

## 4. Catálogo Completo de Rutas de la API y Bodies para Postman

### 4.1 Autenticación y Seguridad (`/api`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/csrf-token` | Público | *Sin body* |
| `POST` | `http://localhost:3000/api/login` | Público | ```json { "usuario": "admin", "password": "tu_password" } ``` |
| `GET` | `http://localhost:3000/api/verificar` | Autenticado | *Sin body* |

---

### 4.2 Usuarios (`/api/usuarios`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/usuarios` | `administrador` | *Sin body* |
| `POST` | `http://localhost:3000/api/usuarios` | `administrador` | ```json { "usuario": "j.perez", "password": "password123", "nombre": "Juan", "apellido": "Pérez", "correo": "jperez@colegio.edu.pe", "rol": "estudiante", "anio": "5to Secundaria" } ``` |
| `PUT` / `PATCH` | `http://localhost:3000/api/usuarios/5` | `administrador` | ```json { "usuario": "j.perez", "password": "", "nombre": "Juan Carlos", "apellido": "Pérez", "correo": "jperez@colegio.edu.pe", "rol": "estudiante", "anio": "5to Secundaria", "activo": 1 } ``` |
| `DELETE` | `http://localhost:3000/api/usuarios/5` | `administrador` | *Sin body* |

---

### 4.3 Cursos (`/api/cursos`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/cursos` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/cursos/profesores` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/cursos/anios` | `administrador` | *Sin body* |
| `POST` | `http://localhost:3000/api/cursos` | `administrador` | ```json { "nombre": "Matemática" } ``` |
| `PUT` / `PATCH` | `http://localhost:3000/api/cursos/1` | `administrador` | ```json { "nombre": "Matemática Avanzada" } ``` |
| `DELETE` | `http://localhost:3000/api/cursos/1` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/cursos/mis-cursos` | `profesor` | *Sin body* |
| `GET` | `http://localhost:3000/api/cursos/horario/10/alumnos` | `profesor` | *Sin body* |

---

### 4.4 Horarios (`/api/horarios`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/horarios` | `administrador` | *Sin body* |
| `POST` | `http://localhost:3000/api/horarios` | `administrador` | ```json { "curso_id": 1, "profesor_id": 2, "anio": "5to Secundaria", "dia": "Lunes", "hora_inicio": "08:00", "hora_fin": "09:30" } ``` |
| `PUT` / `PATCH` | `http://localhost:3000/api/horarios/10` | `administrador` | ```json { "curso_id": 1, "profesor_id": 2, "anio": "5to Secundaria", "dia": "Martes", "hora_inicio": "09:30", "hora_fin": "11:00" } ``` |
| `DELETE` | `http://localhost:3000/api/horarios/10` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/horarios/mi-horario` | `profesor` | *Sin body* |
| `GET` | `http://localhost:3000/api/horarios/mi-horario-estudiante` | `estudiante` | *Sin body* |

---

### 4.5 Notas (`/api/notas`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/notas?horario_id=10&periodo=Bimestre%201` | `profesor` | *Sin body* |
| `POST` | `http://localhost:3000/api/notas/guardar` | `profesor` | **Crear nota nueva:**<br>```json { "notas": [ { "estudiante_id": 3, "horario_id": 10, "nota": 17, "periodo": "Bimestre 1", "observacion": "Buen desempeño" } ] } ```<br>**Actualizar nota existente (`nota_id`):**<br>```json { "notas": [ { "nota_id": 1, "estudiante_id": 3, "horario_id": 10, "nota": 19, "periodo": "Bimestre 1", "observacion": "Mejoró exposición" } ] } ``` |
| `GET` | `http://localhost:3000/api/notas/mis-cursos` | `estudiante` | *Sin body* |
| `GET` | `http://localhost:3000/api/notas/mis-notas?horario_id=10` | `estudiante` | *Sin body* |

---

### 4.6 Asistencia (`/api/asistencia`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/asistencia?horario_id=10&fecha=2026-11-05` | `profesor` | *Sin body* |
| `POST` | `http://localhost:3000/api/asistencia/guardar` | `profesor` | *(Estados permitidos: `asistio`, `tardanza`, `falta`, `falta_justificada`, `tardanza_justificada`)*<br>```json { "asistencias": [ { "estudiante_id": 3, "horario_id": 10, "fecha": "2026-11-05", "estado": "asistio", "observacion": "Puntual" } ] } ``` |
| `GET` | `http://localhost:3000/api/asistencia/mi-resumen` | `estudiante` | *Sin body* |

---

### 4.7 Tareas (`/api/tareas`)

| Método | Endpoint | Rol Requerido | Body (`form-data`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/tareas` | `profesor` | *Sin body* |
| `POST` | `http://localhost:3000/api/tareas` | `profesor` | En **Body → form-data**:<br>- `horario_id`: `10`<br>- `titulo`: `Práctica Calificada 1`<br>- `descripcion`: `Resolver ejercicios 1 al 10`<br>- `fecha_entrega`: `2026-11-15`<br>- `solo_indicaciones`: `false`<br>- `archivo` *(File, opcional)*: `<archivo.pdf>` |
| `PUT` / `PATCH` | `http://localhost:3000/api/tareas/1` | `profesor` | En **Body → form-data**:<br>- `titulo`: `Práctica Calificada 1 (Actualizada)`<br>- `descripcion`: `Resolver ejercicios 1 al 12`<br>- `fecha_entrega`: `2026-11-20`<br>- `solo_indicaciones`: `false`<br>- `archivo` *(File, opcional)*: `<archivo.pdf>` |
| `DELETE` | `http://localhost:3000/api/tareas/1` | `profesor` | *Sin body* |
| `GET` | `http://localhost:3000/api/tareas/1/entregas` | `profesor` | *Sin body* |
| `GET` | `http://localhost:3000/api/tareas/mis-tareas-estudiante` | `estudiante` | *Sin body* |
| `GET` | `http://localhost:3000/api/tareas/admin?mes=11&anio_calendario=2026` | `administrador` | *Sin body* |

---

### 4.8 Entregas de Tareas (`/api/entregas`)

| Método | Endpoint | Rol Requerido | Body (`form-data` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `POST` | `http://localhost:3000/api/entregas` | `estudiante` | En **Body → form-data**:<br>- `tarea_id`: `1`<br>- `comentario`: `Adjunto mi solución`<br>- `archivo` *(File, opcional)*: `<solucion.pdf>` |
| `PUT` / `PATCH` | `http://localhost:3000/api/entregas/1/calificar` | `profesor` | En **Body → raw (JSON)**:<br>```json { "nota": 18 } ``` |

---

### 4.9 Comunicados (`/api/comunicados`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/comunicados/mis` | Autenticado | *Sin body* |
| `GET` | `http://localhost:3000/api/comunicados` | `administrador` | *Sin body* |
| `POST` | `http://localhost:3000/api/comunicados` | `administrador` | *(Valores permitidos de `dirigido_a`: `estudiantes`, `profesores`, `todos`)*<br>```json { "titulo": "Suspensión de actividades", "contenido": "El viernes habrá jornada pedagógica.", "dirigido_a": "todos" } ``` |
| `PUT` / `PATCH` | `http://localhost:3000/api/comunicados/1` | `administrador` | ```json { "titulo": "Suspensión de actividades (Actualizado)", "contenido": "El viernes habrá jornada pedagógica desde las 10:00 AM.", "dirigido_a": "todos", "activo": 1 } ``` |
| `DELETE` | `http://localhost:3000/api/comunicados/1` | `administrador` | *Sin body* |

---

### 4.10 Mensajes (`/api/mensajes`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/mensajes/recibidos` | `estudiante` | *Sin body* |
| `GET` | `http://localhost:3000/api/mensajes/enviados` | `profesor` | *Sin body* |
| `POST` | `http://localhost:3000/api/mensajes/enviar` | `profesor` | ```json { "destinatario_id": 3, "asunto": "Recordatorio de exposición", "mensaje": "Recuerda traer tus diapositivas mañana." } ``` |
| `DELETE` | `http://localhost:3000/api/mensajes/1` | `profesor` | *Sin body* |

---

### 4.11 Matrículas (`/api/matriculas`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/matriculas` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/matriculas/estudiantes` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/matriculas/secciones` | `administrador` | *Sin body* |
| `POST` | `http://localhost:3000/api/matriculas` | `administrador` | ```json { "estudiante_id": 3, "grado": "5to Secundaria", "seccion": "A" } ``` |
| `DELETE` | `http://localhost:3000/api/matriculas/1` | `administrador` | *Sin body* |

---

### 4.12 Configuración (`/api/configuracion`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/configuracion` | `administrador` | *Sin body* |
| `PUT` / `PATCH` | `http://localhost:3000/api/configuracion/colegio` | `administrador` | ```json { "colegio_nombre": "I.E.P. Santo Tomás de Aquino", "colegio_direccion": "Av. Principal 123, Lima", "colegio_telefono": "01-4567890", "colegio_email": "contacto@santotomas.edu.pe" } ``` |
| `PUT` / `PATCH` | `http://localhost:3000/api/configuracion/perfil` | `administrador` | ```json { "nombre": "Administrador", "apellido": "General" } ``` |
| `PUT` / `PATCH` | `http://localhost:3000/api/configuracion/password` | `administrador` | ```json { "password_actual": "admin123", "password_nueva": "nuevaClaveSegura123" } ``` |

---

### 4.13 Reportes y Auditoría (`/api/reportes` y `/api/actividades`)

| Método | Endpoint | Rol Requerido | Body (`raw` / `JSON`) |
| :---: | :--- | :---: | :--- |
| `GET` | `http://localhost:3000/api/reportes` | `administrador` | *Sin body* |
| `GET` | `http://localhost:3000/api/actividades` | `administrador` | *Sin body* |

