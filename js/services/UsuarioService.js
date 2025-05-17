// UsuarioService.js - Servicio para gestión de usuarios
import api from '../api.js';

class UsuarioService {
  static async getAll() {
    return await api.get('/usuario');
  }

  static async getById(id) {
    return await api.get(`/usuario/${id}`);
  }

  static async create(userData) {
    return await api.post('/usuario', userData);
  }

  static async update(id, userData) {
    return await api.put(`/usuario/${id}`, userData);
  }

  static async delete(id) {
    return await api.delete(`/usuario/${id}`);
  }

  static async updatePassword(id, passwordData) {
    return await api.put(`/usuario/${id}/password`, passwordData);
  }

  static async getByRole(role) {
    // Obtener todos los usuarios y filtrar por rol
    const users = await this.getAll();
    return users.filter(user => user.role === role);
  }

  static async toggleStatus(id) {
    const user = await this.getById(id);
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
    return await this.update(id, { estado: newStatus });
  }
}

export default UsuarioService;