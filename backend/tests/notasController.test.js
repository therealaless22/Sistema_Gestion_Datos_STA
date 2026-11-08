/**
 * SEMANA 7 - CU-14 Registrar notas.
 * Pruebas unitarias ejecutables con Node.js >=18 (node:test).
 * Se carga el controlador mediante vm y se simula SQL Server.
 * Las respuestas simuladas distinguen autorizaciones y escrituras de datos.
 * Para ejecutar las pruebas no se requieren credenciales de SQL Server.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const srcPath = path.join(__dirname, '..', 'src');
const controllerPath = path.join(srcPath, 'controllers', 'notasController.js');

function prepararPrueba(respuestas = []) {
  const consultas = [];
  const registros = [];
  const errores = [];
  const pendientes = [...respuestas];

  const sql = { Int: 'Int', VarChar: 'VarChar', Decimal: (...args) => `Decimal(${args.join(',')})` };
  const pool = {
    request() {
      const entradas = {};
      return {
        input(campo, _tipo, valor) {
          entradas[campo] = valor;
          return this;
        },
        async query(consulta) {
          consultas.push({ consulta, entradas: { ...entradas } });
          // Sin respuesta explicita, las consultas de autorizacion devuelven permiso.
          // Los escenarios negativos PU-18 y PU-20 fuerzan recordset vacio.
          const respuesta = pendientes.length ? pendientes.shift() :
            (/^\s*SELECT\b/i.test(consulta) ? { recordset: [{ id: 10 }] } : { rowsAffected: [1] });
          if (respuesta instanceof Error) throw respuesta;
          return respuesta;
        },
      };
    },
  };

  const cacheModulos = new Map();

  function cargarModuloEnContexto(rutaArchivo) {
    const rutaNormalizada = path.resolve(rutaArchivo);
    if (cacheModulos.has(rutaNormalizada)) {
      return cacheModulos.get(rutaNormalizada).exports;
    }

    const modulo = { exports: {} };
    cacheModulos.set(rutaNormalizada, modulo);

    const dirActual = path.dirname(rutaNormalizada);
    const contexto = {
      module: modulo,
      exports: modulo.exports,
      require(ruta) {
        if (ruta === '../config/db') return { pool, poolConnect: Promise.resolve(), sql };
        if (ruta === '../middleware/logger' || ruta === '../middlewares/logger') {
          return {
            registrarActividad: (...datos) => registros.push(datos),
          };
        }
        if (ruta.startsWith('.')) {
          const destino = path.resolve(dirActual, ruta.endsWith('.js') ? ruta : `${ruta}.js`);
          return cargarModuloEnContexto(destino);
        }
        throw new Error(`Dependencia no prevista en la prueba: ${ruta}`);
      },
      console: { error: (...datos) => errores.push(datos.map(String).join(' ')) },
    };

    vm.runInNewContext(fs.readFileSync(rutaNormalizada, 'utf8'), contexto, { filename: rutaNormalizada });
    return modulo.exports;
  }

  const controlador = cargarModuloEnContexto(controllerPath);

  function solicitud({ notas, query = {}, usuario = { id: 2, rol: 'profesor' } } = {}) {
    return { body: { notas }, query, usuario };
  }

  function respuestaHTTP() {
    return {
      codigo: 200,
      datos: null,
      status(codigo) { this.codigo = codigo; return this; },
      json(datos) { this.datos = datos; return this; },
    };
  }

  return { controlador, consultas, registros, errores, solicitud, respuestaHTTP };
}

function nuevaNota(nota, otros = {}) {
  return { estudiante_id: 1, horario_id: 10, nota, periodo: 'Bimestre 1', observacion: 'Prueba', ...otros };
}

const caso = (id, descripcion, fn) => test(`${id} | ${descripcion}`, fn);

caso('PU-01', 'Rechaza la ausencia del arreglo notas (400)', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud(), res);
  assert.equal(res.codigo, 400); assert.equal(a.consultas.length, 0);
});

caso('PU-02', 'Rechaza un arreglo notas vacio (400)', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [] }), res);
  assert.equal(res.codigo, 400); assert.equal(a.consultas.length, 0);
});

caso('PU-03', 'Inserta una nota valida de 15 y registra auditoria', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(15)] }), res);
  assert.equal(res.codigo, 200);
  assert.match(a.consultas[0].consulta, /SELECT h\.id/i);
  assert.equal(a.consultas[0].entradas.profesor_id, 2);
  assert.match(a.consultas[1].consulta, /INSERT INTO Notas/i);
  assert.equal(a.consultas[1].entradas.nota, 15);
  assert.equal(a.registros.length, 1);
});

caso('PU-04', 'Acepta la nota minima valida: 0', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(0)] }), res);
  assert.equal(res.codigo, 200); assert.equal(a.consultas[1].entradas.nota, 0);
});

caso('PU-05', 'Acepta la nota maxima valida: 20', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(20)] }), res);
  assert.equal(res.codigo, 200); assert.equal(a.consultas[1].entradas.nota, 20);
});

caso('PU-06', 'Guarda dos notas validas en un mismo lote', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(13), nuevaNota(17, { estudiante_id: 3 })] }), res);
  assert.equal(res.codigo, 200);
  assert.equal(a.consultas.length, 4); // dos autorizaciones y dos escrituras
  assert.match(res.datos.mensaje, /2 nota\(s\)/);
});

caso('PU-07', 'Actualiza una nota existente usando nota_id', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(18, { nota_id: 55 })] }), res);
  assert.equal(res.codigo, 200);
  assert.match(a.consultas[0].consulta, /FROM Notas n/i); // autoriza sobre la nota real
  assert.match(a.consultas[1].consulta, /UPDATE Notas/i);
  assert.equal(a.consultas[1].entradas.id, 55);
  assert.equal(a.consultas[1].entradas.nota, 18);
});

caso('PU-08', 'Responde 500 cuando SQL Server produce un error', async () => {
  const a = prepararPrueba([new Error('SQL simulado no disponible')]); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(15)] }), res);
  assert.equal(res.codigo, 500);
  assert.equal(a.registros.length, 0);
});

caso('PU-09', 'GET notas rechaza horario_id ausente (400)', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.obtenerNotas(a.solicitud({ query: { periodo: 'Bimestre 1' } }), res);
  assert.equal(res.codigo, 400); assert.equal(a.consultas.length, 0);
});

caso('PU-10', 'GET notas rechaza periodo ausente (400)', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.obtenerNotas(a.solicitud({ query: { horario_id: 10 } }), res);
  assert.equal(res.codigo, 400); assert.equal(a.consultas.length, 0);
});

caso('PU-11', 'GET notas impide consultar un horario ajeno (403)', async () => {
  const a = prepararPrueba([{ recordset: [] }]); const res = a.respuestaHTTP();
  await a.controlador.obtenerNotas(a.solicitud({ query: { horario_id: 10, periodo: 'Bimestre 1' } }), res);
  assert.equal(res.codigo, 403); assert.equal(a.consultas.length, 1);
});

caso('PU-12', 'GET notas devuelve registros del horario autorizado (200)', async () => {
  const a = prepararPrueba([{ recordset: [{ id: 10 }] }, { recordset: [{ id: 3, nota: 17 }] }]);
  const res = a.respuestaHTTP();
  await a.controlador.obtenerNotas(a.solicitud({ query: { horario_id: 10, periodo: 'Bimestre 1' } }), res);
  assert.equal(res.codigo, 200); assert.equal(res.datos.notas.length, 1);
  assert.equal(a.consultas.length, 2);
  assert.equal(a.consultas[0].entradas.profesor_id, 2);
});

caso('PU-13', 'GET notas maneja fallo de SQL Server (500)', async () => {
  const a = prepararPrueba([new Error('SQL simulado no disponible')]); const res = a.respuestaHTTP();
  await a.controlador.obtenerNotas(a.solicitud({ query: { horario_id: 10, periodo: 'Bimestre 1' } }), res);
  assert.equal(res.codigo, 500);
});

// Pruebas negativas: deberian pasar cuando Semana 6 implemente estas reglas.
caso('PU-14', 'Rechaza una nota inferior a cero (-1)', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(-1)] }), res);
  assert.equal(res.codigo, 400, 'El servidor debe rechazar valores negativos');
  assert.equal(a.consultas.length, 0);
});

caso('PU-15', 'Rechaza una nota superior a veinte (21)', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(21)] }), res);
  assert.equal(res.codigo, 400, 'El servidor debe rechazar valores superiores a 20');
  assert.equal(a.consultas.length, 0);
});

caso('PU-16', 'Rechaza una nota de texto no numerico', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota('abc')] }), res);
  assert.equal(res.codigo, 400, 'El servidor debe validar el tipo de dato');
  assert.equal(a.consultas.length, 0);
});

caso('PU-17', 'Rechaza un registro sin periodo academico', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(15, { periodo: '' })] }), res);
  assert.equal(res.codigo, 400, 'El periodo academico es obligatorio');
  assert.equal(a.consultas.length, 0);
});

caso('PU-18', 'Deniega guardar nota en un horario de otro profesor', async () => {
  // La respuesta simulada indica que el docente NO es propietario del horario.
  const a = prepararPrueba([{ recordset: [] }]); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(15, { horario_id: 999 })] }), res);
  assert.equal(res.codigo, 403, 'El servidor debe verificar titularidad del horario antes de insertar');
  assert.equal(a.consultas.length, 1, 'No debe ejecutar INSERT si el profesor no es titular');
  assert.match(a.consultas[0].consulta, /h\.profesor_id = @profesor_id/i);
  assert.equal(a.registros.length, 0);
});

caso('PU-19', 'Rechaza un elemento nulo en el lote sin producir 500', async () => {
  const a = prepararPrueba(); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [null] }), res);
  assert.equal(res.codigo, 400, 'El servidor debe validar la estructura de cada elemento');
  assert.equal(a.consultas.length, 0, 'Un lote invalido no debe hacer escrituras');
});

caso('PU-20', 'Impide actualizar nota ajena usando solo nota_id', async () => {
  // Sin verificacion SQL de titularidad, cualquier nota_id es actualizable.
  const a = prepararPrueba([{ recordset: [] }]); const res = a.respuestaHTTP();
  await a.controlador.guardarNotas(a.solicitud({ notas: [nuevaNota(17, { nota_id: 9876 })] }), res);
  assert.equal(res.codigo, 403, 'Debe comprobarse que la nota pertenece al curso del profesor');
  assert.equal(a.consultas.length, 1, 'No debe ejecutar UPDATE de una nota ajena');
  assert.match(a.consultas[0].consulta, /FROM Notas n/i);
  assert.match(a.consultas[0].consulta, /h\.profesor_id = @profesor_id/i);
  assert.equal(a.registros.length, 0);
});
