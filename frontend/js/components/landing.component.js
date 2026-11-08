/**
 * =============================================
 * SANTO TOMÁS DE AQUINO — Componente Landing (Inicio)
 * Página institucional pública
 * =============================================
 */

import { store } from '../state.js';
import { getDashboardRouteByRole } from '../utils/router.js';

export function renderLanding(container) {
  const isAuth = store.isAuthenticated();
  const user = store.getUser();
  const ctaHref = isAuth ? getDashboardRouteByRole(user.rol) : '#/login';
  const ctaLabel = isAuth ? 'Ir a mi Panel' : 'Plataforma Educativa';

  container.innerHTML = `
    <!-- NAVBAR -->
    <nav class="navbar-public" id="navbar">
      <a class="navbar-brand-public" href="#/">
        <img src="assets/images/logo.png" alt="Logo Santo Tomás"/>
        <span>I.E.P. Santo Tomás<br>de Aquino</span>
      </a>
      <a href="${ctaHref}" class="btn-plataforma">
        <i class="bi bi-grid-fill"></i>
        ${ctaLabel}
      </a>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg" id="heroBg"></div>
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="hero-badge">San Juan de Miraflores · UGEL 01</div>
        <h1 class="hero-titulo">
          I.E.P. Santo Tomás<br><span>de Aquino</span>
        </h1>
        <p class="hero-subtitulo">Institución Educativa Particular · Inicial, Primaria y Secundaria</p>
        <p class="hero-lema">"Educando en valores · ¡Somos los mejores!"</p>
      </div>

      <div class="hero-scroll" id="btnHeroScroll">
        <i class="bi bi-chevron-down"></i>
      </div>
    </section>

    <!-- DIFUMINADO + NIVELES -->
    <section class="fade-section seccion" id="niveles">
      <h2 class="seccion-titulo">Niveles educativos</h2>
      <span class="linea-dorada"></span>
      <p class="seccion-sub">Formamos estudiantes desde el inicio de su vida escolar hasta el egreso secundario.</p>

      <div class="niveles-grid">
        <div class="nivel-card">
          <i class="bi bi-stars"></i>
          <h3>Inicial</h3>
          <p>Estimulación temprana y desarrollo integral en un ambiente seguro y afectivo.</p>
        </div>
        <div class="nivel-card">
          <i class="bi bi-book-fill"></i>
          <h3>Primaria</h3>
          <p>Seis años de formación académica y en valores, cimentando el aprendizaje.</p>
        </div>
        <div class="nivel-card">
          <i class="bi bi-mortarboard-fill"></i>
          <h3>Secundaria</h3>
          <p>Cinco años de preparación para el futuro académico y profesional del alumno.</p>
        </div>
      </div>
    </section>

    <!-- SOBRE NOSOTROS -->
    <section class="seccion-azul">
      <div class="sobre-grid">
        <div class="sobre-texto">
          <h2>¿Quiénes somos?</h2>
          <span class="linea-dorada"></span>
          <p>
            Somos la <strong>Institución Educativa Particular Santo Tomás de Aquino</strong>,
            ubicada en San Juan de Miraflores, Lima. Con años de trayectoria formando
            estudiantes de Inicial, Primaria y Secundaria, comprometidos con una educación
            de calidad y en valores.
          </p>
          <p>
            Nuestra misión es incrementar y mejorar la educación y los valores de nuestros
            estudiantes, brindando una enseñanza de calidad con docentes comprometidos y
            una comunidad educativa unida.
          </p>
        </div>
        <ul class="valores-lista">
          <li><i class="bi bi-check-circle-fill"></i> Educación en valores</li>
          <li><i class="bi bi-check-circle-fill"></i> Docentes capacitados y comprometidos</li>
          <li><i class="bi bi-check-circle-fill"></i> Atención personalizada al estudiante</li>
          <li><i class="bi bi-check-circle-fill"></i> Comunidad educativa activa</li>
          <li><i class="bi bi-check-circle-fill"></i> Plataforma educativa digital propia</li>
          <li><i class="bi bi-check-circle-fill"></i> Formación integral Inicial–Primaria–Secundaria</li>
        </ul>
      </div>
    </section>

    <!-- CONTACTO -->
    <section class="seccion-contacto">
      <h2 class="seccion-titulo">Contáctanos</h2>
      <span class="linea-dorada"></span>

      <div class="contacto-grid">
        <div class="contacto-card">
          <div class="icono-circulo"><i class="bi bi-geo-alt-fill"></i></div>
          <div class="contacto-info">
            <div class="label">Dirección</div>
            <div class="valor">San Juan de Miraflores, Lima, Perú</div>
          </div>
        </div>
        <div class="contacto-card">
          <div class="icono-circulo"><i class="bi bi-telephone-fill"></i></div>
          <div class="contacto-info">
            <div class="label">Teléfonos</div>
            <div class="valor">940 169 530<br>982 940 349</div>
          </div>
        </div>
        <div class="contacto-card">
          <div class="icono-circulo"><i class="bi bi-envelope-fill"></i></div>
          <div class="contacto-info">
            <div class="label">Correo</div>
            <div class="valor">
              <a href="mailto:informes@stomasaquino.edu.pe">informes@stomasaquino.edu.pe</a>
            </div>
          </div>
        </div>
        <div class="contacto-card">
          <div class="label" style="margin-bottom:0.5rem">Síguenos</div>
          <div class="redes-fila">
            <a href="https://www.facebook.com/SANTO.TOMAS.DE.AQUINO.01/" target="_blank" rel="noopener" class="red-icono red-facebook" title="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ffffff" d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@sta.sjm" target="_blank" rel="noopener" class="red-icono red-tiktok" title="TikTok">
              <svg viewBox="0 0 48 48" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <path transform="translate(-1,-0.5)" fill="#25F4EE" d="M31 6c1 4 3.8 7 8 7.4v5c-2.8 0-5.4-.9-7.5-2.4v12.6c0 6-4.9 10.9-10.9 10.9S9.7 34.6 9.7 28.6c0-5.6 4.3-10.2 9.7-10.8v5.2c-2.5.6-4.3 2.8-4.3 5.5 0 3.1 2.5 5.6 5.6 5.6s5.6-2.5 5.6-5.6V6h4.7z"/>
                <path transform="translate(1,0.5)" fill="#FE2C55" d="M31 6c1 4 3.8 7 8 7.4v5c-2.8 0-5.4-.9-7.5-2.4v12.6c0 6-4.9 10.9-10.9 10.9S9.7 34.6 9.7 28.6c0-5.6 4.3-10.2 9.7-10.8v5.2c-2.5.6-4.3 2.8-4.3 5.5 0 3.1 2.5 5.6 5.6 5.6s5.6-2.5 5.6-5.6V6h4.7z"/>
                <path fill="#ffffff" d="M31 6c1 4 3.8 7 8 7.4v5c-2.8 0-5.4-.9-7.5-2.4v12.6c0 6-4.9 10.9-10.9 10.9S9.7 34.6 9.7 28.6c0-5.6 4.3-10.2 9.7-10.8v5.2c-2.5.6-4.3 2.8-4.3 5.5 0 3.1 2.5 5.6 5.6 5.6s5.6-2.5 5.6-5.6V6h4.7z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer-landing">
      <p>© 2026 <span>I.E.P. Santo Tomás de Aquino</span> · San Juan de Miraflores · UGEL 01 S.J.M.</p>
    </footer>
  `;

  const navbar = container.querySelector('#navbar');
  const heroBg = container.querySelector('#heroBg');
  const btnHeroScroll = container.querySelector('#btnHeroScroll');

  const onScroll = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
  };
  window.addEventListener('scroll', onScroll);

  if (btnHeroScroll) {
    btnHeroScroll.addEventListener('click', () => {
      const nivelesEl = container.querySelector('#niveles');
      if (nivelesEl) nivelesEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (heroBg) {
    const img = new Image();
    img.onload = () => heroBg.classList.add('loaded');
    img.src = 'assets/images/colegio.jpg';
    heroBg.style.backgroundImage = "url('assets/images/colegio.jpg')";
  }

  return () => {
    window.removeEventListener('scroll', onScroll);
  };
}

