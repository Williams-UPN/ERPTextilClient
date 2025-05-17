// TelarService.js - Servicio para gestión de telares
import api from '../api.js';

class TelarService {
  static async getAll() {
    return await api.get('/telar');
  }

  static async getById(id) {
    return await api.get(`/telar/${id}`);
  }

  static async create(telarData) {
    return await api.post('/telar', telarData);
  }

  static async update(id, telarData) {
    return await api.put(`/telar/${id}`, telarData);
  }

  static async delete(id) {
    return await api.delete(`/telar/${id}`);
  }

  static async updateStatus(id, status) {
    return await api.put(`/telar/${id}/status`, { status });
  }

  static async asignarOperario(telarId, operarioId) {
    return await api.put(`/telar/${telarId}/asignar`, {
      operario_id: operarioId
    });
  }

  static async iniciarProduccion(telarId, telaId) {
    return await api.post(`/telar/${telarId}/produccion/iniciar`, {
      tela_id: telaId
    });
  }

  static async detenerProduccion(telarId) {
    return await api.post(`/telar/${telarId}/produccion/detener`);
  }

  static async getProduccionActual(telarId) {
    return await api.get(`/telar/${telarId}/produccion/actual`);
  }

  static async getHistorialProduccion(telarId) {
    return await api.get(`/telar/${telarId}/produccion/historial`);
  }

  static async getEficiencia(telarId, fechaInicio, fechaFin) {
    return await api.get(`/telar/${telarId}/eficiencia`, {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
  }

  static async getByStatus(status) {
    const telares = await this.getAll();
    return telares.filter(telar => telar.status === status);
  }

  static async programarMantenimiento(telarId, fecha) {
    return await api.post(`/telar/${telarId}/mantenimiento`, {
      fecha_programada: fecha
    });
  }
}

export default TelarService;