# Plataforma Educativa — I.E.P. Santo Tomás de Aquino (Frontend)

Frontend modular desarrollado en **Vanilla JavaScript (ES Modules)** y arquitectura **CSS modular**, sin uso de frameworks externos. Implementa un sistema de enrutamiento SPA con control de acceso basado en roles (**RBAC**) e integración con el backend en Node.js mediante **CORS**, **CSRF Token** y **JWT**.

---

## Estructura del Proyecto

```text
frontend/
│
├── index.html              # Página principal y punto de entrada único (SPA)
├── assets/                 # Recursos estáticos globales
│   ├── images/             # Imágenes e ilustraciones (logo.png, colegio.jpg)
│   ├── fonts/              # Tipografías locales
│   └── favicon.ico         # Icono de la aplicación
│
├── css/                    # Hojas de estilo organizadas por arquitectura CSS
│   ├── base/               # Resets, tipografía base y variables (:root)
│   │   ├── variables.css
│   │   ├── reset.css
│   │   └── typography.css
│   ├── components/         # Estilos para componentes reutilizables
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── forms.css
│   │   ├── modals.css
│   │   ├── tables.css
│   │   └── badges.css
│   ├── layouts/            # Estilos de estructura general
│   │   ├── navbar.css
│   │   ├── dashboard.css
│   │   ├── landing.css
│   │   └── login.css
│   └── main.css            # Archivo importador principal
│
├── js/                     # Lógica de JavaScript modular (ES Modules)
│   ├── api/                # Manejo de peticiones HTTP (fetch / async-await)
│   │   ├── http.js
│   │   ├── auth.api.js
│   │   ├── usuarios.api.js
│   │   ├── cursos.api.js
│   │   ├── horarios.api.js
│   │   ├── notas.api.js
│   │   ├── asistencia.api.js
│   │   ├── tareas.api.js
│   │   ├── comunicados.api.js
│   │   ├── mensajes.api.js
│   │   ├── matriculas.api.js
│   │   ├── configuracion.api.js
│   │   └── reportes.api.js
│   ├── components/         # Módulos JS que renderizan y controlan las vistas de la UI
│   │   ├── navbar.component.js
│   │   ├── landing.component.js
│   │   ├── login.component.js
│   │   ├── dashboard.component.js
│   │   ├── usuarios.component.js
│   │   ├── cursos.component.js
│   │   ├── horarios.component.js
│   │   ├── notas.component.js
│   │   ├── asistencia.component.js
│   │   ├── tareas.component.js
│   │   ├── comunicados.component.js
│   │   ├── mensajes.component.js
│   │   ├── matriculas.component.js
│   │   ├── configuracion.component.js
│   │   ├── reportes.component.js
│   │   └── actividades.component.js
│   ├── utils/              # Funciones auxiliares, enrutador, formateadores y validaciones
│   │   ├── router.js
│   │   ├── dom.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── state.js            # Store global de sesión, usuario y token CSRF
│   └── main.js             # Punto de entrada principal de JavaScript
│
├── .gitignore              # Archivos ignorados por Git
└── README.md               # Documentación del proyecto
```

---

## Seguridad, Cabeceras HTTP y Enrutamiento

1. **Cliente HTTP (`js/api/http.js`)**:
   Cada petición hacia `http://localhost:3000/api` adjunta automáticamente las cabeceras requeridas:
   - `Authorization: Bearer <TU_TOKEN_JWT>`
   - `Content-Type: application/json` (omitido automáticamente al enviar `FormData` con archivos para permitir `multipart/form-data`)
   - `X-CSRF-Token: <TOKEN_OPCIONAL_DE_/api/csrf-token>`

2. **Enrutamiento Protegido (`js/utils/router.js`)**:
   - Verifica que exista sesión activa y valida el token contra `GET /api/verificar`.
   - Bloquea el acceso a usuarios no autenticados redirigiéndolos a `#/login`.
   - Restringe cada vista según el rol requerido (`administrador`, `profesor`, `estudiante`).


# Uso:
1. Descargar la extension LiveServer en visual studio code
2. Ir al archivo index.html que se encuentra en la raiz del proyecto "/"
3. Click derecho a cualquier parte del archivo
4. Presionar "Open with Live Server"
Se abrira tu navegador predeterminado