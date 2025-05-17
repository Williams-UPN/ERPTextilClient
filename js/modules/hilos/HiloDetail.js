// HiloDetail.js - Vista de detalle de hilo
import HiloService from '../../services/HiloService.js';
import { showNotification } from '../../utils/notifications.js';
import { formatNumber, formatCurrency, formatDate } from '../../utils/formatters.js';
import { canEdit } from '../../utils/permissions.js';

class HiloDetail {
  constructor(container, hiloId) {
    this.container = container;
    this.hiloId = hiloId;
    this.hilo = null;
    this.movimientos = [];
  }

  async render() {
    try {
      await this.loadData();
      
      this.container.innerHTML = `
        <div class="detail-container">
          <div class="detail-header">
            <div>
              <h2>${this.hilo.codigo} - ${this.hilo.color}</h2>
              <p class="subtitle">${this.hilo.tipo} | ${this.hilo.calibre}</p>
            </div>
            <div class="header-actions">
              ${canEdit('hilos') ? `
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
                  <label>Código:</label>
                  <span>${this.hilo.codigo}</span>
                </div>
                <div class="info-item">
                  <label>Tipo:</label>
                  <span>${this.hilo.tipo}</span>
                </div>
                <div class="info-item">
                  <label>Color:</label>
                  <span>
                    <span class="color-badge" style="background-color: ${this.hilo.color_hex || '#ccc'}">
                      ${this.hilo.color}
                    </span>
                  </span>
                </div>
                <div class="info-item">
                  <label>Calibre:</label>
                  <span>${this.hilo.calibre}</span>
                </div>
                <div class="info-item">
                  <label>Proveedor:</label>
                  <span>${this.hilo.proveedor || '-'}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Stock e Inventario</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Stock Actual:</label>
                  <span class="text-bold">${formatNumber(this.hilo.stock_actual, 2)} kg</span>
                </div>
                <div class="info-item">
                  <label>Stock Mínimo:</label>
                  <span>${formatNumber(this.hilo.stock_minimo, 2)} kg</span>
                </div>
                <div class="info-item">
                  <label>Estado:</label>
                  <span class="badge badge-${this.getEstadoStock().class}">
                    ${this.getEstadoStock().text}
                  </span>
                </div>
                <div class="info-item">
                  <label>Consumo Promedio:</label>
                  <span>${formatNumber(this.hilo.consumo_promedio || 0, 2)} kg/día</span>
                </div>
                <div class="info-item">
                  <label>Días de Stock:</label>
                  <span>${this.calcularDiasStock()} días</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Información Financiera</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Precio por kg:</label>
                  <span>${formatCurrency(this.hilo.precio_kg)}</span>
                </div>
                <div class="info-item">
                  <label>Valor en Stock:</label>
                  <span class="text-bold">
                    ${formatCurrency(this.hilo.stock_actual * this.hilo.precio_kg)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section full-width">
            <h3>Movimientos de Stock</h3>
            <div class="table-container">
              ${this.renderMovimientosTable()}
            </div>
          </div>

          ${this.hilo.observaciones ? `
            <div class="detail-section full-width">
              <h3>Observaciones</h3>
              <p>${this.hilo.observaciones}</p>
            </div>
          ` : ''}
        </div>
      `;

      this.attachEventListeners();
    } catch (error) {
      showNotification('Error al cargar el hilo', 'error');
      window.location.hash = '#/hilos';
    }
  }

  async loadData() {
    this.hilo = await HiloService.getById(this.hiloId);
    this.movimientos = await HiloService.getMovimientos(this.hiloId);
  }

  getEstadoStock() {
    const porcentaje = (this.hilo.stock_actual / this.hilo.stock_minimo) * 100;
    
    if (porcentaje <= 50) {
      return { text: 'Crítico', class: 'danger' };
    } else if (porcentaje <= 100) {
      return { text: 'Bajo', class: 'warning' };
    } else {
      return { text: 'Normal', class: 'success' };
    }
  }

  calcularDiasStock() {
    if (!this.hilo.consumo_promedio || this.hilo.consumo_promedio === 0) {
      return '∞';
    }
    return Math.floor(this.hilo.stock_actual / this.hilo.consumo_promedio);
  }

  renderMovimientosTable() {
    if (this.movimientos.length === 0) {
      return '<div class="empty-state">No hay movimientos registrados</div>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Stock Anterior</th>
            <th>Stock Posterior</th>
            <th>Motivo</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          ${this.movimientos.map(mov => `
            <tr>
              <td>${formatDate(mov.fecha, 'DD/MM/YYYY HH:mm')}</td>
              <td>
                <span class="badge badge-${mov.tipo === 'entrada' ? 'success' : 'danger'}">
                  ${mov.tipo}
                </span>
              </td>
              <td class="${mov.tipo === 'entrada' ? 'text-success' : 'text-danger'}">
                ${mov.tipo === 'entrada' ? '+' : '-'}${formatNumber(mov.cantidad, 2)} kg
              </td>
              <td>${formatNumber(mov.stock_anterior, 2)} kg</td>
              <td>${formatNumber(mov.stock_posterior, 2)} kg</td>
              <td>${mov.motivo || '-'}</td>
              <td>${mov.usuario || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  attachEventListeners() {
    // Botón volver
    document.getElementById('btnVolver').addEventListener('click', () => {
      window.location.hash = '#/hilos';
    });

    // Botón editar
    const btnEditar = document.getElementById('btnEditar');
    if (btnEditar) {
      btnEditar.addEventListener('click', () => {
        window.location.hash = `#/hilos/${this.hiloId}/editar`;
      });
    }
  }
}

export default HiloDetail;