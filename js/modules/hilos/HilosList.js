// HilosList.js - Lista de hilos
import HiloService from '../../services/HiloService.js';
import { showNotification } from '../../utils/notifications.js';
import { formatNumber, formatCurrency } from '../../utils/formatters.js';
import { canEdit, canDelete } from '../../utils/permissions.js';

class HilosList {
  constructor(container) {
    this.container = container;
    this.hilos = [];
    this.loading = false;
    this.filteredHilos = [];
  }

  async render() {
    this.container.innerHTML = `
      <div class="module-header">
        <h2>Inventario de Hilos</h2>
        ${canEdit('hilos') ? `
          <div class="header-actions">
            <button class="btn btn-primary" id="btnNuevoHilo">
              <i class="fas fa-plus"></i> Nuevo Hilo
            </button>
            <button class="btn btn-secondary" id="btnAjustarInventario">
              <i class="fas fa-wrench"></i> Ajustar Inventario
            </button>
          </div>
        ` : ''}
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Tipo de Hilo:</label>
          <select id="filterTipo" class="filter-select">
            <option value="">Todos</option>
            <option value="algodon">Algodón</option>
            <option value="poliester">Poliéster</option>
            <option value="mezcla">Mezcla</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Calibre:</label>
          <select id="filterCalibre" class="filter-select">
            <option value="">Todos</option>
            <option value="20/1">20/1</option>
            <option value="30/1">30/1</option>
            <option value="40/1">40/1</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Estado:</label>
          <select id="filterEstado" class="filter-select">
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="bajo">Bajo</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
        
        <div class="filter-group search-filter">
          <input 
            type="text" 
            id="searchHilos" 
            placeholder="Buscar por código o tipo..."
            class="search-input"
          />
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Total Hilos</div>
            <div class="summary-value" id="totalHilos">0</div>
          </div>
        </div>
        
        <div class="summary-card warning">
          <div class="summary-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Stock Bajo</div>
            <div class="summary-value" id="stockBajo">0</div>
          </div>
        </div>
        
        <div class="summary-card danger">
          <div class="summary-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Stock Crítico</div>
            <div class="summary-value" id="stockCritico">0</div>
          </div>
        </div>
        
        <div class="summary-card success">
          <div class="summary-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Valor Total</div>
            <div class="summary-value" id="valorTotal">S/ 0</div>
          </div>
        </div>
      </div>

      <div id="hilosTableContainer" class="table-container">
        ${this.renderTable()}
      </div>
    `;

    await this.loadData();
    this.attachEventListeners();
  }

  renderTable() {
    if (this.loading) {
      return '<div class="loading">Cargando hilos...</div>';
    }

    if (this.filteredHilos.length === 0) {
      return '<div class="empty-state">No se encontraron hilos</div>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tipo</th>
            <th>Color</th>
            <th>Calibre</th>
            <th>Stock (kg)</th>
            <th>Stock Mínimo</th>
            <th>Precio/kg</th>
            <th>Valor Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredHilos.map(hilo => this.renderRow(hilo)).join('')}
        </tbody>
      </table>
    `;
  }

  renderRow(hilo) {
    const estado = this.getEstadoStock(hilo);
    const valorTotal = hilo.stock_actual * hilo.precio_kg;

    return `
      <tr data-id="${hilo.id}">
        <td>${hilo.codigo}</td>
        <td>${hilo.tipo}</td>
        <td>
          <span class="color-badge" style="background-color: ${hilo.color_hex || '#ccc'}">
            ${hilo.color}
          </span>
        </td>
        <td>${hilo.calibre}</td>
        <td class="text-right">${formatNumber(hilo.stock_actual, 2)}</td>
        <td class="text-right">${formatNumber(hilo.stock_minimo, 2)}</td>
        <td class="text-right">${formatCurrency(hilo.precio_kg)}</td>
        <td class="text-right">${formatCurrency(valorTotal)}</td>
        <td>
          <span class="badge badge-${estado.class}">
            ${estado.text}
          </span>
        </td>
        <td class="actions">
          <button class="btn btn-sm btn-info view-btn" data-id="${hilo.id}">
            <i class="fas fa-eye"></i>
          </button>
          ${canEdit('hilos') ? `
            <button class="btn btn-sm btn-warning edit-btn" data-id="${hilo.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-primary adjust-btn" data-id="${hilo.id}">
              <i class="fas fa-exchange-alt"></i>
            </button>
          ` : ''}
          ${canDelete('hilos') ? `
            <button class="btn btn-sm btn-danger delete-btn" data-id="${hilo.id}">
              <i class="fas fa-trash"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }

  getEstadoStock(hilo) {
    const porcentaje = (hilo.stock_actual / hilo.stock_minimo) * 100;
    
    if (porcentaje <= 50) {
      return { text: 'Crítico', class: 'danger' };
    } else if (porcentaje <= 100) {
      return { text: 'Bajo', class: 'warning' };
    } else {
      return { text: 'Normal', class: 'success' };
    }
  }

  async loadData() {
    try {
      this.loading = true;
      this.updateTable();
      
      this.hilos = await HiloService.getAll();
      this.filteredHilos = [...this.hilos];
      
      this.updateSummary();
      this.loading = false;
      this.updateTable();
    } catch (error) {
      this.loading = false;
      showNotification('Error al cargar hilos', 'error');
      console.error('Error:', error);
    }
  }

  updateSummary() {
    const totalHilos = this.hilos.length;
    const stockBajo = this.hilos.filter(h => {
      const estado = this.getEstadoStock(h);
      return estado.text === 'Bajo';
    }).length;
    
    const stockCritico = this.hilos.filter(h => {
      const estado = this.getEstadoStock(h);
      return estado.text === 'Crítico';
    }).length;
    
    const valorTotal = this.hilos.reduce((total, hilo) => {
      return total + (hilo.stock_actual * hilo.precio_kg);
    }, 0);

    document.getElementById('totalHilos').textContent = totalHilos;
    document.getElementById('stockBajo').textContent = stockBajo;
    document.getElementById('stockCritico').textContent = stockCritico;
    document.getElementById('valorTotal').textContent = formatCurrency(valorTotal);
  }

  updateTable() {
    const container = document.getElementById('hilosTableContainer');
    if (container) {
      container.innerHTML = this.renderTable();
    }
  }

  attachEventListeners() {
    // Botón nuevo hilo
    const btnNuevo = document.getElementById('btnNuevoHilo');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => {
        window.location.hash = '#/hilos/nuevo';
      });
    }

    // Botón ajustar inventario
    const btnAjustar = document.getElementById('btnAjustarInventario');
    if (btnAjustar) {
      btnAjustar.addEventListener('click', () => {
        this.showAjusteInventarioModal();
      });
    }

    // Filtros
    const filterTipo = document.getElementById('filterTipo');
    if (filterTipo) {
      filterTipo.addEventListener('change', () => this.applyFilters());
    }

    const filterCalibre = document.getElementById('filterCalibre');
    if (filterCalibre) {
      filterCalibre.addEventListener('change', () => this.applyFilters());
    }

    const filterEstado = document.getElementById('filterEstado');
    if (filterEstado) {
      filterEstado.addEventListener('change', () => this.applyFilters());
    }

    // Búsqueda
    const searchInput = document.getElementById('searchHilos');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    // Botones de acciones
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.view-btn')) {
        const id = e.target.closest('.view-btn').dataset.id;
        this.viewHilo(id);
      } else if (e.target.closest('.edit-btn')) {
        const id = e.target.closest('.edit-btn').dataset.id;
        this.editHilo(id);
      } else if (e.target.closest('.adjust-btn')) {
        const id = e.target.closest('.adjust-btn').dataset.id;
        this.adjustStock(id);
      } else if (e.target.closest('.delete-btn')) {
        const id = e.target.closest('.delete-btn').dataset.id;
        this.deleteHilo(id);
      }
    });
  }

  applyFilters() {
    const tipo = document.getElementById('filterTipo').value;
    const calibre = document.getElementById('filterCalibre').value;
    const estado = document.getElementById('filterEstado').value;
    const searchTerm = document.getElementById('searchHilos').value.toLowerCase();

    this.filteredHilos = this.hilos.filter(hilo => {
      const matchesTipo = !tipo || hilo.tipo === tipo;
      const matchesCalibre = !calibre || hilo.calibre === calibre;
      
      let matchesEstado = true;
      if (estado) {
        const estadoHilo = this.getEstadoStock(hilo);
        matchesEstado = estadoHilo.text.toLowerCase() === estado;
      }
      
      const matchesSearch = !searchTerm || 
        hilo.codigo.toLowerCase().includes(searchTerm) ||
        hilo.tipo.toLowerCase().includes(searchTerm) ||
        hilo.color.toLowerCase().includes(searchTerm);
      
      return matchesTipo && matchesCalibre && matchesEstado && matchesSearch;
    });

    this.updateTable();
  }

  async viewHilo(id) {
    window.location.hash = `#/hilos/${id}`;
  }

  async editHilo(id) {
    window.location.hash = `#/hilos/${id}/editar`;
  }

  async adjustStock(id) {
    const hilo = this.hilos.find(h => h.id == id);
    if (!hilo) return;

    // Aquí podrías mostrar un modal para ajustar el stock
    console.log('Ajustar stock de:', hilo);
  }

  async deleteHilo(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este hilo?')) {
      return;
    }

    try {
      await HiloService.delete(id);
      showNotification('Hilo eliminado correctamente', 'success');
      await this.loadData();
    } catch (error) {
      showNotification('Error al eliminar hilo', 'error');
    }
  }

  showAjusteInventarioModal() {
    // Implementar modal de ajuste de inventario general
    console.log('Mostrar modal de ajuste de inventario');
  }
}

export default HilosList;