/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Configuración (Admin)
 * Gestión de colegio, perfil y contraseña (/api/configuracion)
 * =============================================
 */

import { configuracionApi } from '../api/configuracion.api.js';
import { store } from '../state.js';
import { mostrarAlerta } from '../utils/dom.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

export function renderConfiguracionAdmin(container) {
  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Configuración</h2>
          <p>Administra los datos del colegio y tu cuenta de administrador.</p>
        </div>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <div class="config-grid">
        <!-- Sección 1: Datos del colegio -->
        <div class="config-card">
          <div class="config-card-header">
            <i class="bi bi-building"></i>
            <h3>Datos del colegio</h3>
          </div>
          <form id="formColegio">
            <div class="form-group">
              <label for="colegioNombre">Nombre del colegio</label>
              <input type="text" id="colegioNombre" required>
            </div>
            <div class="form-group">
              <label for="colegioDireccion">Dirección</label>
              <input type="text" id="colegioDireccion">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="colegioTelefono">Teléfono</label>
                <input type="text" id="colegioTelefono">
              </div>
              <div class="form-group">
                <label for="colegioEmail">Correo institucional</label>
                <input type="email" id="colegioEmail">
              </div>
            </div>
            <div class="form-footer">
              <button type="submit" class="btn-primario">
                <i class="bi bi-floppy-fill"></i> Guardar cambios
              </button>
            </div>
          </form>
        </div>

        <!-- Sección 2: Perfil del administrador -->
        <div class="config-card">
          <div class="config-card-header">
            <i class="bi bi-person-fill"></i>
            <h3>Mi perfil</h3>
          </div>
          <form id="formPerfil">
            <div class="form-row">
              <div class="form-group">
                <label for="adminNombre">Nombre</label>
                <input type="text" id="adminNombre" required>
              </div>
              <div class="form-group">
                <label for="adminApellido">Apellido</label>
                <input type="text" id="adminApellido" required>
              </div>
            </div>
            <div class="form-group">
              <label for="adminUsuario">Usuario</label>
              <input type="text" id="adminUsuario" disabled>
            </div>
            <div class="form-footer">
              <button type="submit" class="btn-primario">
                <i class="bi bi-floppy-fill"></i> Guardar cambios
              </button>
            </div>
          </form>
        </div>

        <!-- Sección 3: Cambiar contraseña -->
        <div class="config-card">
          <div class="config-card-header">
            <i class="bi bi-lock-fill"></i>
            <h3>Cambiar contraseña</h3>
          </div>
          <form id="formPassword">
            <div class="form-group">
              <label for="passActual">Contraseña actual</label>
              <input type="password" id="passActual" required>
            </div>
            <div class="form-group">
              <label for="passNueva">Nueva contraseña</label>
              <input type="password" id="passNueva" required>
            </div>
            <div class="form-group">
              <label for="passConfirmar">Confirmar nueva contraseña</label>
              <input type="password" id="passConfirmar" required>
            </div>
            <div class="form-footer">
              <button type="submit" class="btn-primario">
                <i class="bi bi-shield-lock-fill"></i> Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);

  async function cargarConfiguracion() {
    try {
      const { ok, data } = await configuracionApi.obtener();
      if (!ok || !data.config) return;
      const c = data.config;
      container.querySelector('#colegioNombre').value = c.colegio_nombre || '';
      container.querySelector('#colegioDireccion').value = c.colegio_direccion || '';
      container.querySelector('#colegioTelefono').value = c.colegio_telefono || '';
      container.querySelector('#colegioEmail').value = c.colegio_email || '';
    } catch (error) {
      console.error(error);
    }
  }

  function cargarPerfil() {
    const user = store.getUser();
    if (user) {
      container.querySelector('#adminNombre').value = user.nombre || '';
      container.querySelector('#adminApellido').value = user.apellido || '';
      container.querySelector('#adminUsuario').value = user.usuario || '';
      return;
    }

    try {
      const token = store.getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        container.querySelector('#adminNombre').value = payload.nombre || '';
        container.querySelector('#adminApellido').value = payload.apellido || '';
        container.querySelector('#adminUsuario').value = payload.usuario || '';
      }
    } catch (e) {
      console.error('Error al leer token:', e);
    }
  }

  container.querySelector('#formColegio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      colegio_nombre: container.querySelector('#colegioNombre').value.trim(),
      colegio_direccion: container.querySelector('#colegioDireccion').value.trim(),
      colegio_telefono: container.querySelector('#colegioTelefono').value.trim(),
      colegio_email: container.querySelector('#colegioEmail').value.trim(),
    };

    try {
      const { ok, data } = await configuracionApi.actualizarColegio(payload);
      mostrarAlerta(
        data.mensaje || (ok ? 'Datos del colegio guardados.' : 'Error al guardar.'),
        ok ? 'exito' : 'error'
      );
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    }
  });

  container.querySelector('#formPerfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nombre: container.querySelector('#adminNombre').value.trim(),
      apellido: container.querySelector('#adminApellido').value.trim(),
    };

    try {
      const { ok, data } = await configuracionApi.actualizarPerfil(payload);
      if (ok) {
        store.updateUser(payload);
      }
      mostrarAlerta(
        data.mensaje || (ok ? 'Perfil actualizado correctamente.' : 'Error al guardar.'),
        ok ? 'exito' : 'error'
      );
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    }
  });

  container.querySelector('#formPassword').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nueva = container.querySelector('#passNueva').value;
    const confirmar = container.querySelector('#passConfirmar').value;

    if (nueva !== confirmar) {
      mostrarAlerta('Las contraseñas nuevas no coinciden.', 'error');
      return;
    }

    const payload = {
      password_actual: container.querySelector('#passActual').value,
      password_nueva: nueva,
    };

    try {
      const { ok, data } = await configuracionApi.cambiarPassword(payload);
      mostrarAlerta(
        data.mensaje || (ok ? 'Contraseña cambiada correctamente.' : 'Error al cambiar contraseña.'),
        ok ? 'exito' : 'error'
      );
      if (ok) {
        container.querySelector('#formPassword').reset();
      }
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    }
  });

  cargarConfiguracion();
  cargarPerfil();
}

