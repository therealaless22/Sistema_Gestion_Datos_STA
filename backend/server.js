// =============================================
// SANTO TOMÁS DE AQUINO — Servidor Principal
// Punto de entrada que levanta el servidor HTTP
// =============================================

const env = require('./src/config/env');
const app = require('./src/app');

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT}`);
});
