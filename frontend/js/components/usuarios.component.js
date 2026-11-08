/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Usuarios (Admin)
 * CRUD completo contra /api/usuarios
 * =============================================
 */

import { usuariosApi } from '../api/usuarios.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { esPasswordValido } from '../utils/validators.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

const ANIOS_DISPONIBLES = [
  '1ro',
  '2do',
  '3ro',
  '4to',
  '5to',
  '6to',
  '1ro Primaria',
  '2do Primaria',
  '3ro Primaria',
  '4to Primaria',
  '5to Primaria',
  '6to Primaria',
  '1ro Secundaria',
  '2do Secundaria',
  '3ro Secundaria',
  '4to Secundaria',
  '5to Secundaria',
];

export function renderUsuariosAdmin(container) {
  let usuariosCache = [];
  let idAEliminar = null;

  const opcionesAnio = ANIOS_DISPONIBLES.map(
    (a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`
  ).join('');

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Gestionar usuarios</h2>
          <p>Crea, edita, activa/desactiva o elimina cuentas del sistema.</p>
        </div>

        <button id="btnNuevoUsuario" class="btn-primario" type="button">
          <i class="bi bi-person-plus-fill"></i> Nuevo usuario
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="filtros">
        <input type="text" id="buscador" placeholder="Buscar por nombre, usuario o correo...">

        <select id="filtroRol">
          <option value="">Todos los roles</option>
          <option value="estudiante">Estudiante</option>
          <option value="profesor">Profesor</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>

      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Año</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaBody">
            <tr><td colspan="8" class="celda-vacia">Cargando usuarios...</td></tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Crear / Editar usuario -->
    <div id="modalUsuario" class="modal-overlay d-none">
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modalTitulo">Nuevo usuario</h3>
          <button id="btnCerrarModal" class="btn-cerrar" type="button">&times;</button>
        </div>

        <form id="formUsuario" class="modal-body">
          <input type="hidden" id="usuarioId">

          <div class="form-row">
            <div class="form-group">
              <label for="campoNombre">Nombre</label>
              <input type="text" id="campoNombre" required>
            </div>
            <div class="form-group">
              <label for="campoApellido">Apellido</label>
              <input type="text" id="campoApellido" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="campoUsuario">Usuario (código)</label>
              <input type="text" id="campoUsuario" required>
            </div>
            <div class="form-group">
              <label for="campoCorreo">Correo</label>
              <input type="email" id="campoCorreo">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="campoRol">Rol</label>
              <select id="campoRol" required>
                <option value="estudiante">Estudiante</option>
                <option value="profesor">Profesor</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div class="form-group" id="grupoAnio">
              <label for="campoAnio">Año</label>
              <select id="campoAnio">
                <option value="">— Selecciona —</option>
                ${opcionesAnio}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" id="grupoActivo">
              <label for="campoActivo">Estado</label>
              <select id="campoActivo">
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="campoPassword">Contraseña</label>
            <input type="password" id="campoPassword" placeholder="••••••••">
            <small id="passwordHint" class="form-hint">Mínimo 6 caracteres.</small>
          </div>

          <div class="modal-footer">
            <button type="button" id="btnCancelar" class="btn-secundario">Cancelar</button>
            <button type="submit" id="btnGuardar" class="btn-primario">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Confirmar eliminación -->
    <div id="modalConfirmar" class="modal-overlay d-none">
      <div class="modal-box modal-pequeno">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button id="btnCerrarConfirmar" class="btn-cerrar" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Seguro que deseas eliminar al usuario <strong id="nombreEliminar"></strong>? Esta acción no se puede deshacer.</p>
          <div class="modal-footer">
            <button type="button" id="btnCancelarEliminar" class="btn-secundario">Cancelar</button>
            <button type="button" id="btnConfirmarEliminar" class="btn-peligro">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindNavbarEvents(container);

  const tablaBody = container.querySelector('#tablaBody');
  const buscador = container.querySelector('#buscador');
  const filtroRol = container.querySelector('#filtroRol');

  const modalUsuario = container.querySelector('#modalUsuario');
  const modalTitulo = container.querySelector('#modalTitulo');
  const formUsuario = container.querySelector('#formUsuario');
  const grupoActivo = container.querySelector('#grupoActivo');
  const grupoAnio = container.querySelector('#grupoAnio');
  const passwordHint = container.querySelector('#passwordHint');

  const campoId = container.querySelector('#usuarioId');
  const campoNombre = container.querySelector('#campoNombre');
  const campoApellido = container.querySelector('#campoApellido');
  const campoUsuario = container.querySelector('#campoUsuario');
  const campoCorreo = container.querySelector('#campoCorreo');
  const campoRol = container.querySelector('#campoRol');
  const campoAnio = container.querySelector('#campoAnio');
  const campoActivo = container.querySelector('#campoActivo');
  const campoPassword = container.querySelector('#campoPassword');

  const modalConfirmar = container.querySelector('#modalConfirmar');
  const nombreEliminar = container.querySelector('#nombreEliminar');

  function toggleCampoAnio() {
    if (campoRol.value === 'estudiante') {
      grupoAnio.style.display = '';
      campoAnio.required = true;
    } else {
      grupoAnio.style.display = 'none';
      campoAnio.required = false;
      campoAnio.value = '';
    }
  }

  async function cargarUsuarios() {
    try {
      const { ok, data } = await usuariosApi.listar();
      if (!ok) {
        mostrarAlerta(data.mensaje || 'No se pudieron cargar los usuarios.', 'error');
        tablaBody.innerHTML = '<tr><td colspan="8" class="celda-vacia">Error al cargar usuarios.</td></tr>';
        return;
      }
      usuariosCache = data.usuarios || [];
      renderizarTabla();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
      tablaBody.innerHTML = '<tr><td colspan="8" class="celda-vacia">Error de conexión.</td></tr>';
    }
  }

  function renderizarTabla() {
    const texto = buscador.value.trim().toLowerCase();
    const rol = filtroRol.value;

    const filtrados = usuariosCache.filter((u) => {
      const coincideTexto =
        !texto ||
        (u.usuario || '').toLowerCase().includes(texto) ||
        `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase().includes(texto) ||
        (u.correo || '').toLowerCase().includes(texto);

      const coincideRol = !rol || u.rol === rol;
      return coincideTexto && coincideRol;
    });

    if (filtrados.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="8" class="celda-vacia">No se encontraron usuarios.</td></tr>';
      return;
    }

    tablaBody.innerHTML = filtrados
      .map(
        (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${escapeHtml(u.usuario)}</td>
        <td>${escapeHtml(u.nombre)} ${escapeHtml(u.apellido)}</td>
        <td>${escapeHtml(u.correo || '—')}</td>
        <td><span class="tag tag-${escapeAttr(u.rol)}">${escapeHtml(u.rol)}</span></td>
        <td>${u.rol === 'estudiante' ? escapeHtml(u.anio || '—') : '—'}</td>
        <td><span class="tag ${u.activo ? 'tag-activo' : 'tag-inactivo'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div class="acciones-cell">
            <button class="btn-icono icono-editar" title="Editar" data-id="${u.id}">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn-icono icono-eliminar" title="Eliminar" data-id="${u.id}" data-nombre="${escapeAttr(`${u.nombre} ${u.apellido}`)}">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');

    tablaBody.querySelectorAll('.icono-editar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalEdicion(btn.dataset.id));
    });
    tablaBody.querySelectorAll('.icono-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalConfirmar(btn.dataset.id, btn.dataset.nombre));
    });
  }

  function abrirModal() {
    formUsuario.reset();
    campoId.value = '';
    modalTitulo.textContent = 'Nuevo usuario';
    grupoActivo.style.display = 'none';
    campoPassword.required = true;
    passwordHint.textContent = 'Mínimo 6 caracteres.';
    toggleCampoAnio();
    modalUsuario.classList.remove('d-none');
  }

  function abrirModalEdicion(id) {
    const u = usuariosCache.find((item) => String(item.id) === String(id));
    if (!u) return;

    formUsuario.reset();
    campoId.value = u.id;
    campoNombre.value = u.nombre || '';
    campoApellido.value = u.apellido || '';
    campoUsuario.value = u.usuario || '';
    campoCorreo.value = u.correo || '';
    campoRol.value = u.rol || 'estudiante';

    // Si el usuario tiene un año personalizado que no está en la lista base, agregarlo
    if (u.anio && ![...campoAnio.options].some((o) => o.value === u.anio)) {
      const opt = document.createElement('option');
      opt.value = u.anio;
      opt.textContent = u.anio;
      campoAnio.appendChild(opt);
    }
    campoAnio.value = u.anio || '';
    campoActivo.value = u.activo ? '1' : '0';

    modalTitulo.textContent = 'Editar usuario';
    grupoActivo.style.display = '';
    campoPassword.required = false;
    passwordHint.textContent = 'Déjalo en blanco para no cambiar la contraseña.';
    toggleCampoAnio();
    modalUsuario.classList.remove('d-none');
  }

  function cerrarModal() {
    modalUsuario.classList.add('d-none');
  }

  async function guardarUsuario(e) {
    e.preventDefault();

    const id = campoId.value;
    const esEdicion = Boolean(id);
    const password = campoPassword.value.trim();

    if (!esEdicion && !esPasswordValido(password, 6)) {
      mostrarAlerta('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    if (password && !esPasswordValido(password, 6)) {
      mostrarAlerta('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    if (campoRol.value === 'estudiante' && !campoAnio.value) {
      mostrarAlerta('Selecciona el año del estudiante.', 'error');
      return;
    }

    const payload = {
      usuario: campoUsuario.value.trim(),
      password: password || '',
      nombre: campoNombre.value.trim(),
      apellido: campoApellido.value.trim(),
      correo: campoCorreo.value.trim() || null,
      rol: campoRol.value,
      anio: campoRol.value === 'estudiante' ? campoAnio.value : null,
    };

    if (esEdicion) {
      payload.activo = Number(campoActivo.value);
    }

    const btnGuardar = container.querySelector('#btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
      const { ok, data } = esEdicion
        ? await usuariosApi.actualizar(id, payload)
        : await usuariosApi.crear(payload);

      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al guardar el usuario.', 'error');
        return;
      }

      mostrarAlerta(data.mensaje || 'Usuario guardado correctamente.', 'exito');
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar';
    }
  }

  function abrirModalConfirmar(id, nombre) {
    idAEliminar = id;
    nombreEliminar.textContent = nombre;
    modalConfirmar.classList.remove('d-none');
  }

  function cerrarModalConfirmar() {
    modalConfirmar.classList.add('d-none');
    idAEliminar = null;
  }

  async function eliminarUsuarioConfirmado() {
    if (!idAEliminar) return;

    try {
      const { ok, data } = await usuariosApi.eliminar(idAEliminar);
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al eliminar el usuario.', 'error');
        cerrarModalConfirmar();
        return;
      }

      mostrarAlerta(data.mensaje || 'Usuario eliminado correctamente.', 'exito');
      cerrarModalConfirmar();
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
      cerrarModalConfirmar();
    }
  }

  container.querySelector('#btnNuevoUsuario').addEventListener('click', abrirModal);
  container.querySelector('#btnCerrarModal').addEventListener('click', cerrarModal);
  container.querySelector('#btnCancelar').addEventListener('click', cerrarModal);
  modalUsuario.addEventListener('click', (e) => {
    if (e.target === modalUsuario) cerrarModal();
  });

  container.querySelector('#btnCerrarConfirmar').addEventListener('click', cerrarModalConfirmar);
  container.querySelector('#btnCancelarEliminar').addEventListener('click', cerrarModalConfirmar);
  modalConfirmar.addEventListener('click', (e) => {
    if (e.target === modalConfirmar) cerrarModalConfirmar();
  });
  container.querySelector('#btnConfirmarEliminar').addEventListener('click', eliminarUsuarioConfirmado);

  formUsuario.addEventListener('submit', guardarUsuario);
  campoRol.addEventListener('change', toggleCampoAnio);
  buscador.addEventListener('input', renderizarTabla);
  filtroRol.addEventListener('change', renderizarTabla);

  cargarUsuarios();
}

