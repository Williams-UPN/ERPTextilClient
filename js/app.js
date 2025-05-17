// app.js - Archivo principal de inicialización
import router from './utils/Router.js';
import AuthService from './services/AuthService.js';
import Login from './components/Login.js';
import Header from './components/Header.js';
import Sidebar from './components/Sidebar.js';
import Dashboard from './components/Dashboard.js';
import UsuariosList from './modules/usuarios/UsuariosList.js';
import UsuarioForm from './modules/usuarios/UsuarioForm.js';
import HilosList from './modules/hilos/HilosList.js';
import HiloForm from './modules/hilos/HiloForm.js';
import HiloDetail from './modules/hilos/HiloDetail.js';
import TelaresList from './modules/telares/TelaresList.js';
import TelarForm from './modules/telares/TelarForm.js';
import TelarDetail from './modules/telares/TelarDetail.js';
import TelarProduccion from './modules/telares/TelarProduccion.js';
import appState from './state/AppState.js';
import { applyPermissionsToDOM } from './utils/permissions.js';
import { showNotification } from './utils/notifications.js';

class App {
  constructor() {
    this.currentComponent = null;
    this.headerComponent = null;
    this.sidebarComponent = null;
  }

  async init() {
    // Configurar router
    this.setupRoutes();
    
    // Configurar interceptores del estado
    this.setupStateSubscriptions();
    
    // Verificar autenticación inicial
    if (AuthService.isAuthenticated()) {
      this.showLayout();
    }
    
    // Manejar el primer enrutamiento
    router.handleRoute();
  }

  setupRoutes() {
    // Rutas públicas
    router.addRoute('/login', async () => await this.renderLogin(), false);
    
    // Rutas protegidas
    router.addRoute('/dashboard', async () => await this.renderDashboard());
    
    // Rutas de usuarios
    router.addRoute('/usuarios', async () => await this.renderUsuariosList());
    router.addRoute('/usuarios/nuevo', async () => await this.renderUsuarioForm());
    router.addRoute('/usuarios/:id', async (params) => await this.renderUsuarioForm(params.params.id));
    
    // Rutas de hilos
    router.addRoute('/hilos', async () => await this.renderHilosList());
    router.addRoute('/hilos/nuevo', async () => await this.renderHiloForm());
    router.addRoute('/hilos/:id', async (params) => await this.renderHiloDetail(params.params.id));
    router.addRoute('/hilos/:id/editar', async (params) => await this.renderHiloForm(params.params.id));
    
    // Rutas de telares
    router.addRoute('/telares', async () => await this.renderTelaresList());
    router.addRoute('/telares/nuevo', async () => await this.renderTelarForm());
    router.addRoute('/telares/:id', async (params) => await this.renderTelarDetail(params.params.id));
    router.addRoute('/telares/:id/editar', async (params) => await this.renderTelarForm(params.params.id));
    router.addRoute('/telares/:id/produccion/iniciar', async (params) => await this.renderTelarProduccion(params.params.id));
    
    // Ruta por defecto
    router.addRoute('/', async () => {
      if (AuthService.isAuthenticated()) {
        router.navigate('/dashboard');
      } else {
        router.navigate('/login');
      }
    });

    // Middleware antes de cambio de ruta
    router.beforeEach(async (to, from) => {
      // Mostrar loading
      appState.setLoading(true);
      
      // Limpiar componente actual si existe
      if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
        this.currentComponent.destroy();
      }
      
      return true;
    });

    // Middleware después de cambio de ruta
    router.afterEach(async (to, from) => {
      // Ocultar loading
      appState.setLoading(false);
      
      // Aplicar permisos al DOM
      setTimeout(() => applyPermissionsToDOM(), 100);
      
      // Actualizar título de la página
      this.updatePageTitle(to);
    });
  }

  setupStateSubscriptions() {
    // Suscribirse a cambios en el usuario
    appState.subscribe((state, prevState) => {
      if (state.user !== prevState.user) {
        if (state.user) {
          this.showLayout();
        } else {
          this.hideLayout();
        }
      }
    });
  }

  showLayout() {
    // Mostrar header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer && !this.headerComponent) {
      this.headerComponent = new Header(headerContainer);
      this.headerComponent.render();
    }
    
    // Mostrar sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer && !this.sidebarComponent) {
      this.sidebarComponent = new Sidebar(sidebarContainer);
      this.sidebarComponent.render();
    }
    
    // Agregar clase al body
    document.body.classList.add('authenticated');
  }

  hideLayout() {
    // Ocultar header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      headerContainer.innerHTML = '';
      this.headerComponent = null;
    }
    
    // Ocultar sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = '';
      this.sidebarComponent = null;
    }
    
    // Remover clase del body
    document.body.classList.remove('authenticated');
  }

  async renderLogin() {
    const container = document.getElementById('main-content');
    this.currentComponent = new Login(container);
    this.currentComponent.render();
  }

  async renderDashboard() {
    const container = document.getElementById('main-content');
    this.currentComponent = new Dashboard(container);
    await this.currentComponent.render();
  }

  async renderUsuariosList() {
    const container = document.getElementById('main-content');
    this.currentComponent = new UsuariosList(container);
    await this.currentComponent.render();
  }

  async renderUsuarioForm(id = null) {
    const container = document.getElementById('main-content');
    
    let usuario = null;
    if (id) {
      try {
        const UsuarioService = await import('./services/UsuarioService.js');
        usuario = await UsuarioService.default.getById(id);
      } catch (error) {
        showNotification('Error al cargar usuario', 'error');
        router.navigate('/usuarios');
        return;
      }
    }
    
    this.currentComponent = new UsuarioForm(container, usuario);
    this.currentComponent.render();
  }

  async renderHilosList() {
    const container = document.getElementById('main-content');
    this.currentComponent = new HilosList(container);
    await this.currentComponent.render();
  }

  async renderHiloForm(id = null) {
    const container = document.getElementById('main-content');
    
    let hilo = null;
    if (id) {
      try {
        const HiloService = await import('./services/HiloService.js');
        hilo = await HiloService.default.getById(id);
      } catch (error) {
        showNotification('Error al cargar hilo', 'error');
        router.navigate('/hilos');
        return;
      }
    }
    
    this.currentComponent = new HiloForm(container, hilo);
    this.currentComponent.render();
  }

  async renderHiloDetail(id) {
    const container = document.getElementById('main-content');
    this.currentComponent = new HiloDetail(container, id);
    await this.currentComponent.render();
  }

  async renderTelaresList() {
    const container = document.getElementById('main-content');
    this.currentComponent = new TelaresList(container);
    await this.currentComponent.render();
  }

  async renderTelarForm(id = null) {
    const container = document.getElementById('main-content');
    
    let telar = null;
    if (id) {
      try {
        const TelarService = await import('./services/TelarService.js');
        telar = await TelarService.default.getById(id);
      } catch (error) {
        showNotification('Error al cargar telar', 'error');
        router.navigate('/telares');
        return;
      }
    }
    
    this.currentComponent = new TelarForm(container, telar);
    this.currentComponent.render();
  }

  async renderTelarDetail(id) {
    const container = document.getElementById('main-content');
    this.currentComponent = new TelarDetail(container, id);
    await this.currentComponent.render();
  }

  async renderTelarProduccion(id) {
    const container = document.getElementById('main-content');
    this.currentComponent = new TelarProduccion(container, id);
    await this.currentComponent.render();
  }

  updatePageTitle(route) {
    const titles = {
      '/login': 'Iniciar Sesión',
      '/dashboard': 'Dashboard',
      '/usuarios': 'Gestión de Usuarios',
      '/usuarios/nuevo': 'Nuevo Usuario',
      '/hilos': 'Inventario de Hilos',
      '/hilos/nuevo': 'Nuevo Hilo',
      '/telares': 'Gestión de Telares',
      '/telares/nuevo': 'Nuevo Telar',
      // Agregar más títulos según las rutas
    };
    
    const title = titles[route] || 'ERP Textil';
    document.title = `${title} - ERP Textil`;
    
    // Actualizar título en el header si existe
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = title;
    }
  }

  // Método para manejar errores globales
  handleGlobalError(error) {
    console.error('Error global:', error);
    
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      AuthService.logout();
      showNotification('Sesión expirada. Por favor, inicie sesión nuevamente.', 'warning');
    } else {
      showNotification('Ha ocurrido un error. Por favor, intente nuevamente.', 'error');
    }
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  
  // Manejar errores globales
  window.addEventListener('error', (event) => {
    app.handleGlobalError(event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    app.handleGlobalError(event.reason);
  });
  
  // Inicializar la aplicación
  app.init();
});

// Exportar la instancia para uso en otros módulos si es necesario
export default App;