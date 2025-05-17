// HiloService.js - Servicio para gestión de hilos
import api from '../api.js';

class HiloService {
  static async getAll() {
    return await api.get('/hilo');
  }

  static async getById(id) {
    return await api.get(`/hilo/${id}`);
  }

  static async create(hiloData) {
    return await api.post('/hilo', hiloData);
  }

  static async update(id, hiloData) {
    return await api.put(`/hilo/${id}`, hiloData);
  }

  static async delete(id) {
    return await api.delete(`/hilo/${id}`);
  }

  static async updateStock(id, cantidad, tipo = 'entrada') {
    return await api.put(`/hilo/${id}/stock`, {
      cantidad,
      tipo
    });
  }

  static async getLowStock(minimo = 100) {
    const hilos = await this.getAll();
    return hilos.filter(hilo => hilo.stock_actual < minimo);
  }

  static async getMovimientos(id) {
    return await api.get(`/hilo/${id}/movimientos`);
  }

  static async searchByColor(color) {
    const hilos = await this.getAll();
    return hilos.filter(hilo => 
      hilo.color.toLowerCase().includes(color.toLowerCase())
    );
  }
}

export default HiloService;