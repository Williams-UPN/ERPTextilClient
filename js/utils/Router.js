// Router.js - Sistema de enrutamiento simple
import AuthService from '../services/AuthService.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.routeParams = {};
    this.beforeRouteChange = null;
    this.afterRouteChange = null;
    
    // Escuchar cambios de hash
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => this.handleRoute());
  }

  // Agregar una ruta
  addRoute(path, handler, requiresAuth = true) {
    this.routes[path] = {
      handler,
      requiresAuth,
      path
    };
  }

  // Agregar múltiples rutas
  addRoutes(routes) {
    routes.forEach(route => {
      this.addRoute(route.path, route.handler, route.requiresAuth);
    });
  }

  // Manejar cambio de ruta
  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, query] = hash.split('?');
    
    // Parsear parámetros de query
    this.routeParams = this.parseQueryParams(query);
    
    // Buscar ruta con parámetros dinámicos
    let matchedRoute = null;
    let params = {};
    
    for (const [routePath, route] of Object.entries(this.routes)) {
      const match = this.matchRoute(path, routePath);
      if (match) {
        matchedRoute = route;
        params = match.params;
        break;
      }
    }

    // Verificar autenticación
    if (matchedRoute && matchedRoute.requiresAuth && !AuthService.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    // Si no está autenticado y no es la página de login, redirigir a login
    if (!AuthService.isAuthenticated() && path !== '/login') {
      this.navigate('/login');
      return;
    }

    // Si está autenticado y trata de acceder a login, redirigir a dashboard
    if (AuthService.isAuthenticated() && path === '/login') {
      this.navigate('/dashboard');
      return;
    }

    // Ejecutar callback antes del cambio de ruta
    if (this.beforeRouteChange) {
      const canProceed = await this.beforeRouteChange(path, this.currentRoute);
      if (!canProceed) return;
    }

    // Si no se encuentra la ruta
    if (!matchedRoute) {
      console.warn(`Ruta no encontrada: ${path}`);
      this.handle404();
      return;
    }

    // Ejecutar el handler de la ruta
    try {
      const previousRoute = this.currentRoute;
      this.currentRoute = path;
      
      await matchedRoute.handler({
        params,
        query: this.routeParams,
        path
      });

      // Ejecutar callback después del cambio de ruta
      if (this.afterRouteChange) {
        await this.afterRouteChange(path, previousRoute);
      }
    } catch (error) {
      console.error('Error al manejar la ruta:', error);
      this.handleError(error);
    }
  }

  // Comparar ruta con patrón
  matchRoute(path, pattern) {
    // Ruta exacta
    if (path === pattern) {
      return { params: {} };
    }

    // Ruta con parámetros dinámicos
    const pathSegments = path.split('/');
    const patternSegments = pattern.split('/');

    if (pathSegments.length !== patternSegments.length) {
      return null;
    }

    const params = {};
    
    for (let i = 0; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i];
      const patternSegment = patternSegments[i];

      if (patternSegment.startsWith(':')) {
        // Parámetro dinámico
        const paramName = patternSegment.slice(1);
        params[paramName] = pathSegment;
      } else if (pathSegment !== patternSegment) {
        // No coincide
        return null;
      }
    }

    return { params };
  }

  // Parsear parámetros de query
  parseQueryParams(query) {
    if (!query) return {};
    
    const params = {};
    const pairs = query.split('&');
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    
    return params;
  }

  // Navegar a una ruta
  navigate(path, query = {}) {
    let url = `#${path}`;
    
    // Agregar parámetros de query
    const queryString = Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    window.location.href = url;
  }

  // Volver atrás
  goBack() {
    window.history.back();
  }

  // Avanzar
  goForward() {
    window.history.forward();
  }

  // Manejar ruta no encontrada
  handle404() {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = `
        <div class="error-page">
          <h1>404</h1>
          <p>Página no encontrada</p>
          <a href="#/dashboard">Volver al inicio</a>
        </div>
      `;
    }
  }

  // Manejar errores
  handleError(error) {
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = `
        <div class="error-page">
          <h1>Error</h1>
          <p>${error.message || 'Ha ocurrido un error'}</p>
          <a href="#/dashboard">Volver al inicio</a>
        </div>
      `;
    }
  }

  // Agregar middleware para antes del cambio de ruta
  beforeEach(callback) {
    this.beforeRouteChange = callback;
  }

  // Agregar middleware para después del cambio de ruta
  afterEach(callback) {
    this.afterRouteChange = callback;
  }

  // Obtener ruta actual
  getCurrentRoute() {
    return this.currentRoute;
  }

  // Obtener parámetros de la ruta actual
  getRouteParams() {
    return this.routeParams;
  }

  // Verificar si una ruta está activa
  isActive(path) {
    return this.currentRoute === path;
  }
}

// Crear instancia global del router
const router = new Router();

export default router;