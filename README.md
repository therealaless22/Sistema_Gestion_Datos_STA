Pasos para poder ejecutarlo:

1. Abre y ejecuta el archivo SQL donde contiene la base de datos a utilizar. "backend/BasedeDatos-ColegioSantoTomas.sql"
2. Dentro del backend, ejecutar esto en un cmd: 
cd backend
copy .env.example .env
3. Edita "backend/.env" con tus datos:
PORT=3000
DB_SERVER=localhost
DB_NAME=SantoTomasDB
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=tu_password (del sql server management)
JWT_SECRET=cambia_este_secreto_por_uno_largo_y_aleatorio
JWT_EXPIRES_IN=8h
5. Levantar el backend y frontend:
cd backend
npm install
npm run dev -> Luego de instalar npm solo ejecutar esto para lanzar el backend.
**Salida de Terminal si todo fue un éxito**
🚀 Servidor corriendo en http://localhost:3000
✅ Conectado a SQL Server correctamente.
6. Abrir "http://localhost:3000" en un navegador y ya podrás acceder a la página web.

-- Si usas docker, lee "backend/README.md"

NOTA: Si vas a realizar alguna prueba de automatización, ejecuta un respaldo de la base de datos antes. 🪦
