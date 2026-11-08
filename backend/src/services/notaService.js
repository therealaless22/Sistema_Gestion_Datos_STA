// =============================================
// SANTO TOMÁS DE AQUINO — Servicio de Notas
// Lógica de negocio de procesamiento de lotes
// =============================================

const NotaModel = require('../models/NotaModel');

const NotaService = {
  async procesarLoteNotas(notas, profesor_id) {
    for (const item of notas) {
      const { nota_id, estudiante_id, horario_id, nota, periodo, observacion } = item;

      if (nota_id) {
        const verificacionNota = await NotaModel.verificarTitularidadNota(nota_id, profesor_id);
        if (!verificacionNota.length) {
          return { ok: false, codigo: 403, mensaje: 'No tienes acceso a esta nota.' };
        }
        await NotaModel.actualizarNota(nota_id, nota, observacion);
      } else {
        const verificacion = await NotaModel.verificarTitularidadHorario(horario_id, profesor_id);
        if (!verificacion.length) {
          return { ok: false, codigo: 403, mensaje: 'No tienes acceso a este bloque de horario.' };
        }
        await NotaModel.insertarNota({ estudiante_id, horario_id, nota, periodo, observacion });
      }
    }

    return { ok: true };
  },
};

module.exports = NotaService;

