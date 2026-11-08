// =============================================
// SANTO TOMÁS DE AQUINO — Sanitizador y Defensa SQLi
// Defensa en profundidad adicional a consultas parametrizadas
// =============================================

// Patrones clásicos de inyección SQL (tautologías, apóstrofes con comentarios, UNION/DROP/EXEC)
const PATRONES_SQLI = [
  /(\b(UNION\s+ALL\s+SELECT|UNION\s+SELECT|DROP\s+TABLE|ALTER\s+TABLE|TRUNCATE\s+TABLE|EXEC(\s|\+)+(s|x)p\w+)\b)/i,
  /('(\s*|\+)*(OR|AND)(\s*|\+)*'?[\w\d]+'?(\s*|\+)*=(\s*|\+)*'?[\w\d]+'?)/i,
  /(;\s*(DROP|DELETE|UPDATE|INSERT|EXEC|DECLARE)\b)/i,
  /(\bWAITFOR\s+DELAY\b|\bbenchmark\s*\(|\bsleep\s*\()/i,
  /(\s(OR|AND)\s+\d+\s*=\s*\d+)/i,
  /(--|#|\/\*)\s*$/,
  /(%(\d+!)?[sn]){2,}/i
];

/**
 * Verifica si una cadena contiene patrones evidentes de inyección SQL.
 * @param {unknown} valor
 * @returns {boolean}
 */
function contieneInyeccionSQL(valor) {
  if (typeof valor !== 'string') return false;
  return PATRONES_SQLI.some((regex) => regex.test(valor));
}

/**
 * Inspecciona recursivamente un objeto/arreglo buscando intentos de inyección SQL.
 * @param {unknown} datos
 * @returns {string|null} Nombre del campo sospechoso o null si es seguro
 */
function detectarInyeccionEnObjeto(datos, ruta = 'body') {
  if (datos === null || datos === undefined) return null;

  if (typeof datos === 'string') {
    return contieneInyeccionSQL(datos) ? ruta : null;
  }

  if (Array.isArray(datos)) {
    for (let i = 0; i < datos.length; i++) {
      const hallazgo = detectarInyeccionEnObjeto(datos[i], `${ruta}[${i}]`);
      if (hallazgo) return hallazgo;
    }
    return null;
  }

  if (typeof datos === 'object') {
    for (const [clave, valor] of Object.entries(datos)) {
      const hallazgo = detectarInyeccionEnObjeto(valor, `${ruta}.${clave}`);
      if (hallazgo) return hallazgo;
    }
  }

  return null;
}

/**
 * Limpia espacios extremos y caracteres nulos de una cadena.
 * @param {unknown} texto
 * @returns {string}
 */
function limpiarTexto(texto) {
  if (typeof texto !== 'string') return '';
  return texto.replace(/\0/g, '').trim();
}

/**
 * Valida que un identificador sea un entero positivo válido.
 * @param {unknown} id
 * @returns {boolean}
 */
function esEnteroPositivo(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

module.exports = {
  contieneInyeccionSQL,
  detectarInyeccionEnObjeto,
  limpiarTexto,
  esEnteroPositivo,
};

