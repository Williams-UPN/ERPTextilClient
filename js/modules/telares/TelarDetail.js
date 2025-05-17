// TelarDetail.js - Vista de detalle de telar
import TelarService from '../../services/TelarService.js';
import { showNotification } from '../../utils/notifications.js';
import { formatNumber, formatPercentage, formatDate, formatDuration } from '../../utils/formatters.js';
import { canEdit } from '../../utils/permissions.js';

class TelarDetail {
  constructor(container, telarId) {
    this.container = container;
    this.telarId = telarId;
    this.telar = null;
    this.produccionActual = null;
    this.historialProduccion = [];
  }

  async render() {
    try {
      await this.loadData();
      
      this.container.innerHTML = `
        <div class="detail-container">
          <div class="detail-header">
            <div>
              <h2>${this.telar.id} - ${this.telar.nombre}</h2>
              <p class="subtitle">${this.telar.marca} ${this.telar.modelo || ''}</p>
            </div>
            <div class="header-actions">
              ${canEdit('telares') ? `
                <button class="btn btn-warning" id="btnEditar">
                  <i class="fas fa-edit"></i> Editar
                </button>
              ` : ''}
              <button class="btn btn-secondary" id="btnVolver">
                <i class="fas fa-arrow-left"></i> Volver
              </button>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-section">
              <h3>Información General</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>ID Telar:</label>
                  <span>${this.telar.id}</span>
                </div>
                <div class="info-item">
                  <label>Nombre:</label>
                  <span>${this.telar.nombre}</span>
                </div>
                <div class="info-item">
                  <label>Marca:</label>
                  <span>${this.telar.marca}</span>
                </div>
                <div class="info-item">
                  <label>Modelo:</label>
                  <span>${this.telar.modelo || '-'}</span>
                </div>
                <div class="info-item">
                  <label>Fecha Instalación:</label>
                  <span>${formatDate(this.telar.fecha_instalacion)}</span>
                </div>
                <div class="info-item">
                  <label>Número Serie:</label>
                  <span>${this.telar.numero_serie || '-'}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Especificaciones Técnicas</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Revoluciones:</label>
                  <span>${formatNumber(this.telar.revoluciones)} rpm</span>
                </div>
                <div class="info-item">
                  <label>Ancho Útil:</label>
                  <span>${this.telar.ancho_util || '-'} cm</span>
                </div>
                <div class="info-item">
                  <label>Eficiencia Objetivo:</label>
                  <span>${formatPercentage(this.telar.eficiencia_objetivo)}</span>
                </div>
                <div class="info-item">
                  <label>Eficiencia Real:</label>
                  <span class="text-bold">${formatPercentage(this.telar.eficiencia_real || 0)}</span>
                </div>
                <div class="info-item">
                  <label>Velocidad Máxima:</label>
                  <span>${this.telar.velocidad_maxima || '-'} m/min</span>
                </div>
                <div class="info-item">
                  <label>Horas Operación:</label>
                  <span>${formatNumber(this.telar.horas_operacion || 0)}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Estado Actual</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Estado:</label>
                  <span class="badge badge-${this.getEstadoBadgeClass(this.telar.estado)}">
                    ${this.getEstadoText(this.telar.estado)}
                  </span>
                </div>
                <div class="info-item">
                  <label>Último Mantenimiento:</label>
                  <span>${formatDate(this.telar.ultimo_mantenimiento) || '-'}</span>
                </div>
                <div class="info-item">
                  <label>Próximo Mantenimiento:</label>
                  <span>${formatDate(this.telar.proximo_mantenimiento) || '-'}</span>
                </div>
                ${this.telar.estado === 'produciendo' ? `
                  <div class="info-item">
                    <label>Tela en Producción:</label>
                    <span>${this.telar.tela_produciendo || '-'}</span>
                  </div>
                  <div class="info-item">
                    <label>Operario Asignado:</label>
                    <span>${this.telar.operario_asignado || '-'}</span>
                  </div>
                  <div class="info-item">
                    <label>Inicio Producción:</label>
                    <span>${formatDate(this.telar.inicio_produccion_actual, 'DD/MM/YYYY HH:mm')}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          ${this.produccionActual ? `
            <div class="detail-section full-width">
              <h3>Producción Actual</h3>
              <div class="production-stats">
                <div class="stat-card">
                  <div class="stat-label">Tiempo Activo</div>
                  <div class="stat-value">${this.calcularTiempoOperativo(this.produccionActual.fecha_inicio)}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Metros Producidos</div>
                  <div class="stat-value">${formatNumber(this.produccionActual.metros_producidos || 0, 2)} m</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Eficiencia</div>
                  <div class="stat-value">${formatPercentage(this.produccionActual.eficiencia || 0)}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Estado</div>
                  <div class="stat-value">
                    <span class="badge badge-success">Produciendo</span>
                  </div>
                </div>
              </div>
              
              <div class="production-actions">
                <button class="btn btn-warning" id="btnPausar">
                  <i class="fas fa-pause"></i> Pausar
                </button>
                <button class="btn btn-danger" id="btnDetener">
                  <i class="fas fa-stop"></i> Detener Producción
                </button>
                <button class="btn btn-info" id="btnRegistrarParada">
                  <i class="fas fa-exclamation-triangle"></i> Registrar Parada
                </button>
              </div>
            </div>
          ` : ''}

          <div class="detail-section full-width">
            <h3>Historial de Producción</h3>
            <div class="table-container">
              ${this.renderHistorialTable()}
            </div>
          </div>

          <div class="detail-section full-width">
            <div class="section-header">
              <h3>Gráficos de Rendimiento</h3>
              <div class="chart-controls">
                <select id="chartPeriod" class="filter-select">
                  <option value="7">Últimos 7 días</option>
                  <option value="30" selected>Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                </select>
              </div>
            </div>
            
            <div class="charts-grid">
              <div class="chart-card">
                <h4>Eficiencia por Día</h4>
                <canvas id="eficienciaChart"></canvas>
              </div>
              
              <div class="chart-card">
                <h4>Producción Diaria</h4>
                <canvas id="produccionChart"></canvas>
              </div>
            </div>
          </div>

          ${this.telar.observaciones ? `
            <div class="detail-section full-width">
              <h3>Observaciones</h3>
              <p>${this.telar.observaciones}</p>
            </div>
          ` : ''}
        </div>
      `;

      this.attachEventListeners();
      this.initializeCharts();
    } catch (error) {
      showNotification('Error al cargar el telar', 'error');
      window.location.hash = '#/telares';
    }
  }

  async loadData() {
    this.telar = await TelarService.getById(this.telarId);
    
    if (this.telar.estado === 'produciendo') {
      this.produccionActual = await TelarService.getProduccionActual(this.telarId);
    }
    
    this.historialProduccion = await TelarService.getHistorialProduccion(this.telarId);
  }

  renderHistorialTable() {
    if (this.historialProduccion.length === 0) {
      return '<div class="empty-state">No hay historial de producción</div>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Tela</th>
            <th>Operario</th>
            <th>Metros</th>
            <th>Tiempo</th>
            <th>Eficiencia</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${this.historialProduccion.map(prod => `
            <tr>
              <td>${formatDate(prod.fecha_inicio, 'DD/MM/YYYY HH:mm')}</td>
              <td>${prod.fecha_fin ? formatDate(prod.fecha_fin, 'DD/MM/YYYY HH:mm') : '-'}</td>
              <td>${prod.tela_nombre}</td>
              <td>${prod.operario_nombre}</td>
              <td>${formatNumber(prod.metros_producidos || 0, 2)} m</td>
              <td>${formatDuration(prod.duracion_segundos || 0)}</td>
              <td>${formatPercentage(prod.eficiencia || 0)}</td>
              <td>
                <span class="badge badge-${prod.estado === 'finalizado' ? 'success' : 'warning'}">
                  ${prod.estado}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  calcularTiempoOperativo(fechaInicio) {
    if (!fechaInicio) return '-';
    
    const inicio = new Date(fechaInicio);
    const ahora = new Date();
    const diff = ahora - inicio;
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  }

  getEstadoBadgeClass(estado) {
    const classes = {
      'operativo': 'success',
      'produciendo': 'primary',
      'detenido': 'warning',
      'mantenimiento': 'info',
      'fuera_servicio': 'danger'
    };
    return classes[estado] || 'secondary';
  }

  getEstadoText(estado) {
    const textos = {
      'operativo': 'Operativo',
      'produciendo': 'Produciendo',
      'detenido': 'Detenido',
      'mantenimiento': 'En Mantenimiento',
      'fuera_servicio': 'Fuera de Servicio'
    };
    return textos[estado] || estado;
  }

  attachEventListeners() {
    // Botón volver
    document.getElementById('btnVolver').addEventListener('click', () => {
      window.location.hash = '#/telares';
    });

    // Botón editar
    const btnEditar = document.getElementById('btnEditar');
    if (btnEditar) {
      btnEditar.addEventListener('click', () => {
        window.location.hash = `#/telares/${this.telarId}/editar`;
      });
    }

    // Botones de producción
    const btnPausar = document.getElementById('btnPausar');
    if (btnPausar) {
      btnPausar.addEventListener('click', () => this.pausarProduccion());
    }

    const btnDetener = document.getElementById('btnDetener');
    if (btnDetener) {
      btnDetener.addEventListener('click', () => this.detenerProduccion());
    }

    const btnRegistrarParada = document.getElementById('btnRegistrarParada');
    if (btnRegistrarParada) {
      btnRegistrarParada.addEventListener('click', () => this.registrarParada());
    }

    // Cambio de período del gráfico
    const chartPeriod = document.getElementById('chartPeriod');
    if (chartPeriod) {
      chartPeriod.addEventListener('change', () => this.updateCharts());
    }
  }

  async pausarProduccion() {
    if (!confirm('¿Estás seguro de que deseas pausar la producción?')) {
      return;
    }

    try {
      await TelarService.updateStatus(this.telarId, 'detenido');
      showNotification('Producción pausada', 'success');
      await this.render();
    } catch (error) {
      showNotification('Error al pausar producción', 'error');
    }
  }

  async detenerProduccion() {
    if (!confirm('¿Estás seguro de que deseas detener la producción?')) {
      return;
    }

    try {
      await TelarService.detenerProduccion(this.telarId);
      showNotification('Producción detenida', 'success');
      window.location.hash = `#/telares/${this.telarId}/produccion/corte`;
    } catch (error) {
      showNotification('Error al detener producción', 'error');
    }
  }

  registrarParada() {
    // Implementar modal de registro de parada
    console.log('Registrar parada');
  }

  initializeCharts() {
    if (typeof Chart === 'undefined') return;

    const dias = parseInt(document.getElementById('chartPeriod').value) || 30;
    
    // Gráfico de eficiencia
    const eficienciaCtx = document.getElementById('eficienciaChart');
    if (eficienciaCtx) {
      this.eficienciaChart = new Chart(eficienciaCtx, {
        type: 'line',
        data: {
          labels: this.generateDateLabels(dias),
          datasets: [{
            label: 'Eficiencia (%)',
            data: this.generateRandomData(dias, 75, 95),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    }

    // Gráfico de producción
    const produccionCtx = document.getElementById('produccionChart');
    if (produccionCtx) {
      this.produccionChart = new Chart(produccionCtx, {
        type: 'bar',
        data: {
          labels: this.generateDateLabels(dias),
          datasets: [{
            label: 'Metros producidos',
            data: this.generateRandomData(dias, 800, 1500),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value + ' m';
                }
              }
            }
          }
        }
      });
    }
  }

  updateCharts() {
    // Actualizar gráficos cuando cambia el período
    this.initializeCharts();
  }

  generateDateLabels(days) {
    const labels = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }));
    }
    
    return labels;
  }

  generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
  }
}

export default TelarDetail;