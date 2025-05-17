// TelaService.js - Servicio para gestión de telas
import api from '../api.js';

class TelaService {
  static async getAll() {
    return await api.get('/tela');
  }

  static async getById(id) {
    return await api.get(`/tela/${id}`);
  }

  static async create(telaData) {
    return await api.post('/tela', telaData);
  }

  static async update(id, telaData) {
    return await api.put(`/tela/${id}`, telaData);
  }

  static async delete(id) {
    return await api.delete(`/tela/${id}`);
  }

  static async getProduccion(id) {
    return await api.get(`/tela/${id}/produccion`);
  }

  static async getInventario() {
    return await api.get('/tela/inventario');
  }

  static async actualizarStock(id, cantidad, tipo = 'entrada') {
    return await api.put(`/tela/${id}/stock`, {
      cantidad,
      tipo
    });
  }

  static async getByTipo(tipo) {
    const telas = await this.getAll();
    return telas.filter(tela => tela.tipo === tipo);
  }

  static async getHilosRequeridos(telaId) {
    return await api.get(`/tela/${telaId}/hilos`);
  }

  static async calcularCostoProduccion(telaId, metros) {
    return await api.post(`/tela/${telaId}/costo`, {
      metros
    });
  }

  static async getHistorialProduccion(telaId) {
    return await api.get(`/tela/${telaId}/historial`);
  }

  static async searchByName(nombre) {
    const telas = await this.getAll();
    return telas.filter(tela => 
      tela.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }
}

export default TelaService;