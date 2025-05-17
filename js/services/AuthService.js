// AuthService.js - Servicio de autenticación
import api from '../api.js';

class AuthService {
  static async login(username, password) {
    try {
      const response = await api.post('/usuario/login', {
        username,
        password
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        api.setToken(response.token); // Establecer token en la instancia de api
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.setToken(null); // Limpiar token de la instancia de api
    window.location.href = '/';
  }

  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static hasPermission(permission) {
    const user = this.getUser();
    if (!user) return false;
    
    // Aquí implementarías la lógica de permisos según el rol
    // Por ahora, solo verificamos si el usuario está autenticado
    return true;
  }

  static getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
}

export default AuthService;