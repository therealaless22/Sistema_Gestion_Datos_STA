// =============================================
// SANTO TOMÁS DE AQUINO — Conexión SQL Server
// Patrón Singleton para el Pool de Conexiones
// Compatible con Linux (Tedious) y Windows (ODBC / Tedious)
// =============================================

const env = require('./env');

let sql;
let config;

if (process.platform === 'win32' && !process.env.DB_USER) {
  // En Windows sin DB_USER: Autenticación Integrada (Trusted_Connection)
  sql = require('mssql/msnodesqlv8');
  config = {
    connectionString:
      `Driver={ODBC Driver 17 for SQL Server};Server=(local);Database=${env.DB_NAME};Trusted_Connection=yes;`,
  };
} else {
  // En Linux o con credenciales SQL (Tedious puro JS)
  sql = require('mssql');
  const enDocker = process.env.IN_DOCKER === 'true';
  const servidor =
    enDocker && (env.DB_SERVER === 'localhost' || env.DB_SERVER === '127.0.0.1' || env.DB_SERVER === '(local)')
      ? 'host.docker.internal'
      : env.DB_SERVER === '(local)'
        ? 'localhost'
        : env.DB_SERVER;

  config = {
    server: servidor,
    database: env.DB_NAME,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => console.log('✅ Conectado a SQL Server correctamente.'))
  .catch((err) => {
    console.error('⚠️ No se pudo conectar a SQL Server:', err.message);
    console.error('   Verifica DB_SERVER, DB_USER y DB_PASSWORD en tu archivo .env');
  });

module.exports = { sql, pool, poolConnect };
