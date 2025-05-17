// Sidebar.js - Componente de barra lateral con navegación
import AuthService from '../services/AuthService.js';
import { MENU_CONFIG } from '../config/menus.js';

class Sidebar {
  constructor(container) {
    this.container = container;
    this.user = AuthService.getUser();
    this.currentRoute = window.location.hash || '#/dashboard';
  }

  render() {
    if (!this.user) return;

    const menuItems = MENU_CONFIG[this.user.role] || [];

    this.container.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="/assets/logo.png" alt="Logo" class="sidebar-logo" onerror="this.style.display='none'">
          <h3>ERP Textil</h3>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            ${menuItems.map(item => this.renderMenuItem(item)).join('')}
          </ul>
        </nav>
        
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <i class="fas fa-user-circle"></i>
            <span>${this.user.nombre}</span>
          </div>
        </div>
      </aside>
    `;

    this.attachEventListeners();
  }

  renderMenuItem(item) {
    const isActive = this.currentRoute === `#/${item.id}`;
    
    return `
      <li class="nav-item ${isActive ? 'active' : ''}">
        <a href="#/${item.id}" class="nav-link" data-route="${item.id}">
          <i class="${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      </li>
    `;
  }

  attachEventListeners() {
    // Manejar clics en items del menú
    const navLinks = this.container.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Remover clase active de todos los items
        this.container.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Agregar clase active al item clickeado
        e.target.closest('.nav-item').classList.add('active');
        
        // Actualizar ruta actual
        this.currentRoute = e.target.getAttribute('href');
      });
    });

    // Escuchar cambios de ruta
    window.addEventListener('hashchange', () => {
      this.currentRoute = window.location.hash;
      this.updateActiveMenuItem();
    });

    // Escuchar evento de toggle sidebar
    window.addEventListener('sidebarToggled', () => {
      this.container.classList.toggle('collapsed');
    });
  }

  updateActiveMenuItem() {
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      if (link.getAttribute('href') === this.currentRoute) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

export default Sidebar;