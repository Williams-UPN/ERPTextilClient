// AppState.js - Estado centralizado de la aplicación
import AuthService from '../services/AuthService.js';

class AppState {
  constructor() {
    this.state = {
      user: AuthService.getUser(),
      currentModule: null,
      sidebarCollapsed: false,
      notifications: [],
      loading: false,
      cache: new Map(),
      filters: {},
      selectedItems: new Set()
    };
    
    this.subscribers = [];
    this.modules = {};
  }

  // Obtener el estado completo
  getState() {
    return { ...this.state };
  }

  // Actualizar el estado
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notifySubscribers(this.state, prevState);
  }

  // Actualizar una parte específica del estado
  updateState(key, value) {
    this.setState({ [key]: value });
  }

  // Obtener una parte específica del estado
  get(key) {
    return this.state[key];
  }

  // Suscribirse a cambios del estado
  subscribe(callback) {
    this.subscribers.push(callback);
    // Retornar función para desuscribirse
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notificar a los suscriptores
  notifySubscribers(newState, prevState) {
    this.subscribers.forEach(callback => {
      callback(newState, prevState);
    });
  }

  // Métodos específicos del usuario
  setUser(user) {
    this.setState({ user });
  }

  getUser() {
    return this.state.user;
  }

  clearUser() {
    this.setState({ user: null });
  }

  // Métodos para módulos
  setCurrentModule(module) {
    this.setState({ currentModule: module });
  }

  getCurrentModule() {
    return this.state.currentModule;
  }

  // Métodos para notificaciones
  addNotification(notification) {
    const newNotifications = [...this.state.notifications, {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    }];
    this.setState({ notifications: newNotifications });
  }

  removeNotification(id) {
    const newNotifications = this.state.notifications.filter(n => n.id !== id);
    this.setState({ notifications: newNotifications });
  }

  clearNotifications() {
    this.setState({ notifications: [] });
  }

  // Métodos para loading
  setLoading(loading) {
    this.setState({ loading });
  }

  isLoading() {
    return this.state.loading;
  }

  // Métodos para cache
  addToCache(key, data, ttl = 300000) { // TTL default: 5 minutos
    this.state.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getFromCache(key) {
    const cached = this.state.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.state.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache() {
    this.state.cache.clear();
  }

  // Métodos para filtros
  setFilter(module, filters) {
    this.setState({
      filters: {
        ...this.state.filters,
        [module]: filters
      }
    });
  }

  getFilters(module) {
    return this.state.filters[module] || {};
  }

  clearFilters(module) {
    const newFilters = { ...this.state.filters };
    delete newFilters[module];
    this.setState({ filters: newFilters });
  }

  // Métodos para selección
  selectItem(id) {
    const newSelection = new Set(this.state.selectedItems);
    newSelection.add(id);
    this.setState({ selectedItems: newSelection });
  }

  deselectItem(id) {
    const newSelection = new Set(this.state.selectedItems);
    newSelection.delete(id);
    this.setState({ selectedItems: newSelection });
  }

  toggleItemSelection(id) {
    if (this.state.selectedItems.has(id)) {
      this.deselectItem(id);
    } else {
      this.selectItem(id);
    }
  }

  clearSelection() {
    this.setState({ selectedItems: new Set() });
  }

  getSelectedItems() {
    return Array.from(this.state.selectedItems);
  }

  // Métodos para sidebar
  toggleSidebar() {
    this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
  }

  setSidebarCollapsed(collapsed) {
    this.setState({ sidebarCollapsed: collapsed });
  }

  // Registrar módulos
  registerModule(name, moduleState) {
    this.modules[name] = moduleState;
  }

  getModuleState(name) {
    return this.modules[name];
  }

  // Método para persistir estado en localStorage
  persist(key = 'appState') {
    const stateToPersist = {
      sidebarCollapsed: this.state.sidebarCollapsed,
      filters: this.state.filters
    };
    localStorage.setItem(key, JSON.stringify(stateToPersist));
  }

  // Método para restaurar estado desde localStorage
  restore(key = 'appState') {
    const storedState = localStorage.getItem(key);
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        this.setState(parsedState);
      } catch (error) {
        console.error('Error al restaurar estado:', error);
      }
    }
  }

  // Método para resetear el estado
  reset() {
    this.state = {
      user: AuthService.getUser(),
      currentModule: null,
      sidebarCollapsed: false,
      notifications: [],
      loading: false,
      cache: new Map(),
      filters: {},
      selectedItems: new Set()
    };
    this.notifySubscribers(this.state, {});
  }
}

// Crear instancia global
const appState = new AppState();

// Restaurar estado guardado
appState.restore();

// Guardar estado antes de salir
window.addEventListener('beforeunload', () => {
  appState.persist();
});

export default appState;