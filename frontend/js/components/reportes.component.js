/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Reportes (Admin)
 * Estadísticas generales y exportación a Excel (/api/reportes)
 * =============================================
 */

import { reportesApi } from '../api/reportes.api.js';
import { escapeHtml, escapeAttr, mostrarAlerta } from '../utils/dom.js';
import { renderNavbarHTML, bindNavbarEvents } from './navbar.component.js';

export function renderReportesAdmin(container) {
  let usuariosCache = [];

  container.innerHTML = `
    ${renderNavbarHTML()}

    <main class="dash-main">
      <div class="page-header">
        <div>
          <a href="#/admin" class="back-link">
            <i class="bi bi-arrow-left"></i> Volver al panel
          </a>
          <h2>Reportes</h2>
          <p>Resumen general del sistema y exportación de datos.</p>
        </div>
        <button id="btnExportar" class="btn-primario" type="button">
          <i class="bi bi-file-earmark-excel-fill"></i> Exportar usuarios a Excel
        </button>
      </div>

      <div id="alertBox" class="alert-box d-none"></div>

      <!-- Tarjetas resumen -->
      <div class="reporte-cards" id="tarjetasResumen">
        <div class="reporte-card skeleton"></div>
        <div class="reporte-card skeleton"></div>
        <div class="reporte-card skeleton"></div>
        <div class="reporte-card skeleton"></div>
      </div>

      <!-- Gráficos -->
      <div class="graficos-grid">
        <div class="grafico-card">
          <h4><i class="bi bi-people-fill"></i> Usuarios por rol</h4>
          <div id="barrasRol" class="barras-container"></div>
        </div>

        <div class="grafico-card">
          <h4><i class="bi bi-toggle-on"></i> Estado de cuentas</h4>
          <div id="estadoCuentas" class="estado-container"></div>
        </div>

        <div class="grafico-card grafico-full">
          <h4><i class="bi bi-building"></i> Estudiantes por año</h4>
          <div id="barrasGrado" class="barras-container"></div>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="grafico-card" style="margin-top:1.5rem">
        <div class="tabla-header">
          <h4><i class="bi bi-table"></i> Lista completa de usuarios</h4>
          <input type="text" id="buscadorTabla" placeholder="Buscar...">
        </div>
        <div class="tabla-wrapper" style="margin-top:1rem; box-shadow:none;">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody id="tablaBody">
              <tr><td colspan="7" class="celda-vacia">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `;

  bindNavbarEvents(container);

  const tarjetasResumen = container.querySelector('#tarjetasResumen');
  const barrasRol = container.querySelector('#barrasRol');
  const estadoCuentas = container.querySelector('#estadoCuentas');
  const barrasGrado = container.querySelector('#barrasGrado');
  const tablaBody = container.querySelector('#tablaBody');

  function renderizarTarjetas(data) {
    const porRol = data.porRol || [];
    const totalUsuarios = porRol.reduce((s, r) => s + r.total, 0);
    const estudiantes = porRol.find((r) => r.rol === 'estudiante')?.total || 0;
    const profesores = porRol.find((r) => r.rol === 'profesor')?.total || 0;
    const totalCursos = data.totalCursos || 0;

    const tarjetas = [
      { icon: 'bi-people-fill',      valor: totalUsuarios, label: 'Total usuarios',     color: '#1a3a5c' },
      { icon: 'bi-person-fill',      valor: estudiantes,   label: 'Estudiantes',        color: '#2d6a4f' },
      { icon: 'bi-mortarboard-fill', valor: profesores,    label: 'Profesores',         color: '#e9a000' },
      { icon: 'bi-book-fill',        valor: totalCursos,   label: 'Cursos registrados', color: '#c0392b' },
    ];

    tarjetasResumen.innerHTML = tarjetas
      .map(
        (t) => `
      <div class="reporte-card">
        <div class="reporte-card-icon" style="color:${t.color}">
          <i class="bi ${t.icon}"></i>
        </div>
        <div class="reporte-card-valor">${t.valor}</div>
        <div class="reporte-card-label">${t.label}</div>
      </div>
    `
      )
      .join('');
  }

  function renderizarBarrasRol(porRol = []) {
    const max = Math.max(...porRol.map((r) => r.total), 1);
    barrasRol.innerHTML = porRol
      .map(
        (r) => `
      <div class="barra-item">
        <span class="barra-label">${escapeHtml(r.rol)}</span>
        <div class="barra-track">
          <div class="barra-fill color-${escapeAttr(r.rol)}" style="width:${(r.total / max) * 100}%"></div>
        </div>
        <span class="barra-valor">${r.total}</span>
      </div>
    `
      )
      .join('');
  }

  function renderizarEstado(porEstado = { activos: 0, inactivos: 0 }) {
    estadoCuentas.innerHTML = `
      <div class="estado-item">
        <div class="estado-circulo activo">${porEstado.activos ?? 0}</div>
        <span class="estado-label">Activos</span>
      </div>
      <div class="estado-item">
        <div class="estado-circulo inactivo">${porEstado.inactivos ?? 0}</div>
        <span class="estado-label">Inactivos</span>
      </div>
    `;
  }

  function renderizarBarrasGrado(porGrado = []) {
    if (porGrado.length === 0) {
      barrasGrado.innerHTML =
        '<p style="color:#a0aec0;font-size:0.85rem">No hay estudiantes con año asignado aún.</p>';
      return;
    }

    const max = Math.max(...porGrado.map((g) => g.total), 1);
    barrasGrado.innerHTML = porGrado
      .map(
        (g) => `
      <div class="barra-item">
        <span class="barra-label">${escapeHtml(g.grado)}</span>
        <div class="barra-track">
          <div class="barra-fill color-grado" style="width:${(g.total / max) * 100}%"></div>
        </div>
        <span class="barra-valor">${g.total}</span>
      </div>
    `
      )
      .join('');
  }

  function renderizarTabla(usuarios = []) {
    if (usuarios.length === 0) {
      tablaBody.innerHTML = '<tr><td colspan="7" class="celda-vacia">No se encontraron usuarios.</td></tr>';
      return;
    }

    tablaBody.innerHTML = usuarios
      .map(
        (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${escapeHtml(u.usuario)}</td>
        <td>${escapeHtml(u.nombre)} ${escapeHtml(u.apellido)}</td>
        <td>${escapeHtml(u.correo || '—')}</td>
        <td><span class="tag tag-${escapeAttr(u.rol)}">${escapeHtml(u.rol)}</span></td>
        <td><span class="tag ${u.estado === 'Activo' ? 'tag-activo' : 'tag-inactivo'}">${escapeHtml(u.estado)}</span></td>
        <td>${escapeHtml(u.creado_en)}</td>
      </tr>
    `
      )
      .join('');
  }

  container.querySelector('#buscadorTabla').addEventListener('input', (e) => {
    const texto = e.target.value.trim().toLowerCase();
    const filtrados = usuariosCache.filter(
      (u) =>
        (u.usuario || '').toLowerCase().includes(texto) ||
        `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase().includes(texto) ||
        (u.correo || '').toLowerCase().includes(texto)
    );
    renderizarTabla(filtrados);
  });

  container.querySelector('#btnExportar').addEventListener('click', () => {
    if (usuariosCache.length === 0) return;

    if (typeof XLSX === 'undefined') {
      mostrarAlerta('La librería de exportación Excel no está disponible.', 'error');
      return;
    }

    const filas = usuariosCache.map((u) => ({
      ID: u.id,
      Usuario: u.usuario,
      Nombre: u.nombre,
      Apellido: u.apellido,
      Correo: u.correo || '',
      Rol: u.rol,
      Estado: u.estado,
      Registrado: u.creado_en,
    }));

    const hoja = XLSX.utils.json_to_sheet(filas);
    hoja['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 14 },
      { wch: 10 },
      { wch: 14 },
    ];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');
    XLSX.writeFile(libro, `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`);
  });

  (async function cargarReportes() {
    try {
      const { ok, data } = await reportesApi.obtenerResumen();
      if (!ok) {
        mostrarAlerta(data.mensaje || 'Error al cargar los reportes.', 'error');
        return;
      }
      renderizarTarjetas(data);
      renderizarBarrasRol(data.porRol);
      renderizarEstado(data.porEstado);
      renderizarBarrasGrado(data.porGrado);
      usuariosCache = data.usuarios || [];
      renderizarTabla(usuariosCache);
    } catch (error) {
      console.error(error);
      mostrarAlerta('No se pudo conectar con el servidor.', 'error');
    }
  })();
}

