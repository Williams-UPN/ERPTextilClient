// Header.js - Componente del header principal
import AuthService from '../services/AuthService.js';

class Header {
  constructor(container) {
    this.container = container;
    this.user = AuthService.getUser();
  }

  render() {
    if (!this.user) return;

    this.container.innerHTML = `
      <header class="main-header">
        <div class="header-content">
          <div class="header-left">
            <button id="toggleSidebar" class="btn-icon">
              <i class="fas fa-bars"></i>
            </button>
            <h1>Sistema ERP Textil</h1>
          </div>
          <div class="header-right">
            <div class="user-info">
              <i class="fas fa-user-circle"></i>
              <span>${this.user.nombre}</span>
              <span class="role-badge">${this.user.role}</span>
            </div>
            <button id="logoutBtn" class="btn-logout">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
          AuthService.logout();
        }
      });
    }

    // Botón toggle sidebar
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        // Emitir evento personalizado para notificar otros componentes
        window.dispatchEvent(new Event('sidebarToggled'));
      });
    }
  }

  updateUserInfo() {
    this.user = AuthService.getUser();
    this.render();
  }
}

export default Header;