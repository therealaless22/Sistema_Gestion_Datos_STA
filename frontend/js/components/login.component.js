/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Login
 * Autenticación contra POST /api/login
 * =============================================
 */

import { authApi } from '../api/auth.api.js';
import { store } from '../state.js';
import { getDashboardRouteByRole, navigateTo } from '../utils/router.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">

        <!-- Logo del colegio -->
        <div class="text-center mb-3">
          <img src="assets/images/logo.png" alt="Logo Santo Tomás de Aquino" class="logo-img"/>
        </div>

        <!-- Nombre del colegio -->
        <div class="text-center mb-4">
          <h1 class="school-name">Colegio Santo Tomás de Aquino</h1>
        </div>

        <!-- Alerta de error -->
        <div id="alertError" class="alert-box error d-none" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span id="alertMsg">Credenciales incorrectas.</span>
        </div>

        <form id="formLogin" novalidate>
          <!-- Usuario -->
          <div class="mb-3">
            <label for="usuario" class="label-custom">Correo o código de usuario</label>
            <div class="input-group-custom">
              <span class="input-icon"><i class="bi bi-envelope"></i></span>
              <input
                type="text"
                id="usuario"
                class="input-custom"
                placeholder="correo@ejemplo.com"
                autocomplete="username"
                required
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div class="mb-4">
            <label for="contrasena" class="label-custom">Contraseña</label>
            <div class="input-group-custom">
              <span class="input-icon"><i class="bi bi-lock"></i></span>
              <input
                type="password"
                id="contrasena"
                class="input-custom"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button class="btn-toggle-pass" type="button" id="togglePass" title="Mostrar u ocultar contraseña">
                <i class="bi bi-eye" id="iconoOjo"></i>
              </button>
            </div>
          </div>

          <!-- Botón login -->
          <button type="submit" id="btnLogin" class="btn-login mb-3">
            <span id="btnTexto">Ingresar</span>
            <span id="btnSpinner" class="spinner-inline d-none"></span>
          </button>
        </form>

        <div class="text-center" style="display:flex;flex-direction:column;gap:0.5rem;">
          <a href="#/" class="link-custom">
            <i class="bi bi-arrow-left"></i> Volver a la página principal
          </a>
        </div>

      </div>
    </div>
  `;

  const formLogin = container.querySelector('#formLogin');
  const usuarioInput = container.querySelector('#usuario');
  const passwordInput = container.querySelector('#contrasena');
  const btnLogin = container.querySelector('#btnLogin');
  const btnTexto = container.querySelector('#btnTexto');
  const btnSpinner = container.querySelector('#btnSpinner');
  const alertError = container.querySelector('#alertError');
  const alertMsg = container.querySelector('#alertMsg');
  const togglePass = container.querySelector('#togglePass');
  const iconoOjo = container.querySelector('#iconoOjo');

  function mostrarError(mensaje) {
    alertMsg.textContent = mensaje;
    alertError.classList.remove('d-none');
  }

  function restaurarBoton() {
    btnTexto.textContent = 'Ingresar';
    btnSpinner.classList.add('d-none');
    btnLogin.disabled = false;
  }

  // Mostrar / ocultar contraseña
  togglePass.addEventListener('click', () => {
    const esPassword = passwordInput.type === 'password';
    passwordInput.type = esPassword ? 'text' : 'password';
    iconoOjo.className = esPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value.trim();

    if (!usuario || !password) {
      mostrarError('Complete todos los campos.');
      return;
    }

    alertError.classList.add('d-none');
    btnTexto.textContent = 'Ingresando...';
    btnSpinner.classList.remove('d-none');
    btnLogin.disabled = true;

    try {
      const { ok, data } = await authApi.login(usuario, password);

      if (!ok || !data.token || !data.usuario) {
        mostrarError(data.mensaje || 'Credenciales incorrectas o error al iniciar sesión.');
        restaurarBoton();
        return;
      }

      // Guardar sesión en el store global + sessionStorage
      store.setSession(data.token, data.usuario);

      // Redirigir al panel correspondiente al rol
      const destino = getDashboardRouteByRole(data.usuario.rol);
      if (destino === '#/login') {
        mostrarError('Rol de usuario no reconocido.');
        store.clearSession();
        restaurarBoton();
        return;
      }

      navigateTo(destino);
    } catch (error) {
      console.error('Error en login:', error);
      mostrarError('No se pudo conectar con el servidor.');
      restaurarBoton();
    }
  });
}

