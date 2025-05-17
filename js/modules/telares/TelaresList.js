// TelaresList.js - Lista de telares
import TelarService from '../../services/TelarService.js';
import { showNotification } from '../../utils/notifications.js';
import { formatNumber, formatPercentage, formatDate } from '../../utils/formatters.js';
import { canEdit, canDelete } from '../../utils/permissions.js';
import appState from '../../state/AppState.js';

class TelaresList {
  constructor(container) {
    this.container = container;
    this.telares = [];
    this.loading = false;
    this.activeTab = 'registro';
  }

  async render() {
    this.container.innerHTML = `
      <div class="module-header">
        <h2>Gestión de Telares</h2>
        ${canEdit('telares') ? `
          <div class="header-actions">
            <button class="btn btn-primary" id="btnNuevoTelar">
              <i class="fas fa-plus"></i> Nuevo Telar
            </button>
          </div>
        ` : ''}
      </div>

      <div class="tabs-container">
        <div class="tabs-header">
          <button class="tab-btn active" data-tab="registro">
            Registro de Telares
          </button>
          <button class="tab-btn" data-tab="estado">
            Estado Actual
          </button>
          <button class="tab-btn" data-tab="produccion">
            Producción Activa
          </button>
        </div>

        <div class="tab-content active" id="registro-tab">
          ${this.renderRegistroTab()}
        </div>

        <div class="tab-content" id="estado-tab">
          ${this.renderEstadoTab()}
        </div>

        <div class="tab-content" id="produccion-tab">
          ${this.renderProduccionTab()}
        </div>
      </div>
    `;

    await this.loadData();
    this.attachEventListeners();
  }

  renderRegistroTab() {
    return `
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Total Telares</div>
            <div class="summary-value" id="totalTelares">0</div>
          </div>
        </div>
        
        <div class="summary-card success">
          <div class="summary-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Operativos</div>
            <div class="summary-value" id="telaresOperativos">0</div>
          </div>
        </div>
        
        <div class="summary-card warning">
          <div class="summary-icon">
            <i class="fas fa-wrench"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">En Mantenimiento</div>
            <div class="summary-value" id="telaresMantenimiento">0</div>
          </div>
        </div>
        
        <div class="summary-card danger">
          <div class="summary-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Fuera de Servicio</div>
            <div class="summary-value" id="telaresFueraServicio">0</div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table" id="telares-registro-table">
          <thead>
            <tr>
              <th>ID Telar</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Revoluciones</th>
              <th>Eficiencia Objetivo</th>
              <th>Estado</th>
              <th>Fecha Instalación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="registro-tbody">
            ${this.loading ? '<tr><td colspan="9" class="loading">Cargando telares...</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  renderEstadoTab() {
    return `
      <div class="filters-section">
        <div class="filter-group">
          <label>Estado:</label>
          <select id="filterEstado" class="filter-select">
            <option value="">Todos</option>
            <option value="operativo">Operativo</option>
            <option value="produciendo">Produciendo</option>
            <option value="detenido">Detenido</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="fuera_servicio">Fuera de Servicio</option>
          </select>
        </div>
        
        <div class="filter-group search-filter">
          <input 
            type="text" 
            id="searchTelares" 
            placeholder="Buscar telares..."
            class="search-input"
          />
        </div>
      </div>

      <div class="table-container">
        <table class="data-table" id="telares-estado-table">
          <thead>
            <tr>
              <th>ID Telar</th>
              <th>Nombre</th>
              <th>Estado Actual</th>
              <th>Tela en Producción</th>
              <th>Operario Asignado</th>
              <th>Tiempo Operativo</th>
              <th>Eficiencia Real</th>
              <th>Último Mantenimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="estado-tbody">
            ${this.loading ? '<tr><td colspan="9" class="loading">Cargando estado de telares...</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  renderProduccionTab() {
    return `
      <div class="production-overview">
        <div class="machine-grid" id="production-machine-grid">
          <!-- Las tarjetas de máquinas se renderizarán aquí -->
        </div>
      </div>

      <div class="table-container">
        <h3>Producciones Activas</h3>
        <table class="data-table" id="producciones-activas-table">
          <thead>
            <tr>
              <th>Telar</th>
              <th>Tela</th>
              <th>Operario</th>
              <th>Inicio</th>
              <th>Tiempo Activo</th>
              <th>Metros Producidos</th>
              <th>Eficiencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="produccion-tbody">
            ${this.loading ? '<tr><td colspan="9" class="loading">Cargando producciones...</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  }

  renderRegistroRow(telar) {
    return `
      <tr data-id="${telar.id}">
        <td>${telar.id}</td>
        <td>${telar.nombre}</td>
        <td>${telar.marca}</td>
        <td>${telar.modelo || '-'}</td>
        <td>${formatNumber(telar.revoluciones)}</td>
        <td>${formatPercentage(telar.eficiencia_objetivo)}</td>
        <td>
          <span class="badge badge-${this.getEstadoBadgeClass(telar.estado)}">
            ${this.getEstadoText(telar.estado)}
          </span>
        </td>
        <td>${formatDate(telar.fecha_instalacion)}</td>
        <td class="actions">
          <button class="btn btn-sm btn-info view-btn" data-id="${telar.id}">
            <i class="fas fa-eye"></i>
          </button>
          ${canEdit('telares') ? `
            <button class="btn btn-sm btn-warning edit-btn" data-id="${telar.id}">
              <i class="fas fa-edit"></i>
            </button>
          ` : ''}
          ${canDelete('telares') ? `
            <button class="btn btn-sm btn-danger delete-btn" data-id="${telar.id}">
              <i class="fas fa-trash"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }

  renderEstadoRow(telar) {
    const tiempoOperativo = telar.inicio_produccion_actual ? 
      this.calcularTiempoOperativo(telar.inicio_produccion_actual) : '-';

    return `
      <tr data-id="${telar.id}">
        <td>${telar.id}</td>
        <td>${telar.nombre}</td>
        <td>
          <span class="badge badge-${this.getEstadoBadgeClass(telar.estado)}">
            ${this.getEstadoText(telar.estado)}
          </span>
        </td>
        <td>${telar.tela_produciendo || '-'}</td>
        <td>${telar.operario_asignado || '-'}</td>
        <td>${tiempoOperativo}</td>
        <td>${formatPercentage(telar.eficiencia_real || 0)}</td>
        <td>${formatDate(telar.ultimo_mantenimiento)}</td>
        <td class="actions">
          ${telar.estado === 'operativo' || telar.estado === 'detenido' ? `
            <button class="btn btn-sm btn-success asignar-btn" data-id="${telar.id}">
              <i class="fas fa-user-plus"></i> Asignar
            </button>
          ` : ''}
          ${telar.estado === 'produciendo' ? `
            <button class="btn btn-sm btn-danger detener-btn" data-id="${telar.id}">
              <i class="fas fa-stop"></i> Detener
            </button>
          ` : ''}
          ${telar.estado === 'mantenimiento' ? `
            <button class="btn btn-sm btn-primary finalizar-mant-btn" data-id="${telar.id}">
              <i class="fas fa-check"></i> Finalizar
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }

  renderMachineCard(telar) {
    const estadoClass = this.getEstadoBadgeClass(telar.estado);
    const isProduciendo = telar.estado === 'produciendo';

    return `
      <div class="machine-card ${estadoClass}" data-id="${telar.id}">
        <div class="machine-header">
          <h4>${telar.id}</h4>
          <span class="badge badge-${estadoClass}">${this.getEstadoText(telar.estado)}</span>
        </div>
        
        <div class="machine-info">
          <div class="info-row">
            <span>Modelo:</span>
            <strong>${telar.nombre}</strong>
          </div>
          
          ${isProduciendo ? `
            <div class="info-row">
              <span>Tela:</span>
              <strong>${telar.tela_produciendo}</strong>
            </div>
            <div class="info-row">
              <span>Operario:</span>
              <strong>${telar.operario_asignado}</strong>
            </div>
            <div class="info-row">
              <span>Eficiencia:</span>
              <strong>${formatPercentage(telar.eficiencia_real || 0)}</strong>
            </div>
          ` : `
            <div class="info-row">
              <span>Estado:</span>
              <strong>${this.getEstadoText(telar.estado)}</strong>
            </div>
            <div class="info-row">
              <span>Último Mant.:</span>
              <strong>${formatDate(telar.ultimo_mantenimiento)}</strong>
            </div>
          `}
        </div>
        
        <div class="machine-actions">
          ${telar.estado === 'operativo' || telar.estado === 'detenido' ? `
            <button class="btn btn-sm btn-primary iniciar-prod-btn" data-id="${telar.id}">
              <i class="fas fa-play"></i> Iniciar Producción
            </button>
          ` : ''}
          
          ${telar.estado === 'produciendo' ? `
            <button class="btn btn-sm btn-warning pausar-btn" data-id="${telar.id}">
              <i class="fas fa-pause"></i> Pausar
            </button>
            <button class="btn btn-sm btn-danger detener-btn" data-id="${telar.id}">
              <i class="fas fa-stop"></i> Detener
            </button>
          ` : ''}
          
          ${telar.estado === 'mantenimiento' ? `
            <button class="btn btn-sm btn-info ver-mant-btn" data-id="${telar.id}">
              <i class="fas fa-tools"></i> Ver Detalles
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  async loadData() {
    try {
      this.loading = true;
      this.telares = await TelarService.getAll();
      this.updateSummary();
      this.updateTables();
      this.loading = false;
    } catch (error) {
      this.loading = false;
      showNotification('Error al cargar telares', 'error');
      console.error('Error:', error);
    }
  }

  updateSummary() {
    const total = this.telares.length;
    const operativos = this.telares.filter(t => 
      t.estado === 'operativo' || t.estado === 'produciendo' || t.estado === 'detenido'
    ).length;
    const mantenimiento = this.telares.filter(t => t.estado === 'mantenimiento').length;
    const fueraServicio = this.telares.filter(t => t.estado === 'fuera_servicio').length;

    document.getElementById('totalTelares').textContent = total;
    document.getElementById('telaresOperativos').textContent = operativos;
    document.getElementById('telaresMantenimiento').textContent = mantenimiento;
    document.getElementById('telaresFueraServicio').textContent = fueraServicio;
  }

  updateTables() {
    // Actualizar tabla de registro
    const registroTbody = document.getElementById('registro-tbody');
    if (registroTbody) {
      registroTbody.innerHTML = this.telares.map(telar => 
        this.renderRegistroRow(telar)
      ).join('');
    }

    // Actualizar tabla de estado
    const estadoTbody = document.getElementById('estado-tbody');
    if (estadoTbody) {
      estadoTbody.innerHTML = this.telares.map(telar => 
        this.renderEstadoRow(telar)
      ).join('');
    }

    // Actualizar vista de producción
    const machineGrid = document.getElementById('production-machine-grid');
    if (machineGrid) {
      machineGrid.innerHTML = this.telares
        .filter(t => t.estado !== 'fuera_servicio')
        .map(telar => this.renderMachineCard(telar))
        .join('');
    }

    // Actualizar tabla de producciones activas
    const produccionTbody = document.getElementById('produccion-tbody');
    if (produccionTbody) {
      const produccionesActivas = this.telares.filter(t => t.estado === 'produciendo');
      produccionTbody.innerHTML = produccionesActivas.length > 0 ?
        produccionesActivas.map(telar => this.renderProduccionRow(telar)).join('') :
        '<tr><td colspan="9" class="empty-state">No hay producciones activas</td></tr>';
    }
  }

  renderProduccionRow(telar) {
    const tiempoActivo = this.calcularTiempoOperativo(telar.inicio_produccion_actual);
    
    return `
      <tr data-id="${telar.id}">
        <td>${telar.id} - ${telar.nombre}</td>
        <td>${telar.tela_produciendo}</td>
        <td>${telar.operario_asignado}</td>
        <td>${formatDate(telar.inicio_produccion_actual, 'DD/MM/YYYY HH:mm')}</td>
        <td>${tiempoActivo}</td>
        <td>${formatNumber(telar.metros_producidos || 0, 2)} m</td>
        <td>${formatPercentage(telar.eficiencia_real || 0)}</td>
        <td>
          <span class="badge badge-success">Produciendo</span>
        </td>
        <td class="actions">
          <button class="btn btn-sm btn-info ver-detalle-btn" data-id="${telar.id}">
            <i class="fas fa-chart-line"></i>
          </button>
          <button class="btn btn-sm btn-danger detener-prod-btn" data-id="${telar.id}">
            <i class="fas fa-stop"></i>
          </button>
        </td>
      </tr>
    `;
  }

  attachEventListeners() {
    // Botón nuevo telar
    const btnNuevo = document.getElementById('btnNuevoTelar');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => {
        window.location.hash = '#/telares/nuevo';
      });
    }

    // Tabs
    const tabButtons = this.container.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Filtros
    const filterEstado = document.getElementById('filterEstado');
    if (filterEstado) {
      filterEstado.addEventListener('change', () => this.applyFilters());
    }

    const searchInput = document.getElementById('searchTelares');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    // Delegación de eventos para botones de acciones
    this.container.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const id = target.dataset.id;
      
      if (target.classList.contains('view-btn')) {
        this.viewTelar(id);
      } else if (target.classList.contains('edit-btn')) {
        this.editTelar(id);
      } else if (target.classList.contains('delete-btn')) {
        this.deleteTelar(id);
      } else if (target.classList.contains('asignar-btn')) {
        this.asignarOperario(id);
      } else if (target.classList.contains('iniciar-prod-btn')) {
        this.iniciarProduccion(id);
      } else if (target.classList.contains('detener-btn') || target.classList.contains('detener-prod-btn')) {
        this.detenerProduccion(id);
      } else if (target.classList.contains('pausar-btn')) {
        this.pausarProduccion(id);
      }
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    
    // Actualizar botones de tabs
    const tabButtons = this.container.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Actualizar contenido
    const tabContents = this.container.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
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

  applyFilters() {
    // Implementar filtrado
    console.log('Aplicar filtros');
  }

  // Métodos de acciones
  async viewTelar(id) {
    window.location.hash = `#/telares/${id}`;
  }

  async editTelar(id) {
    window.location.hash = `#/telares/${id}/editar`;
  }

  async deleteTelar(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este telar?')) {
      return;
    }

    try {
      await TelarService.delete(id);
      showNotification('Telar eliminado correctamente', 'success');
      await this.loadData();
    } catch (error) {
      showNotification('Error al eliminar telar', 'error');
    }
  }

  async asignarOperario(id) {
    // Mostrar modal de asignación
    console.log('Asignar operario a telar:', id);
  }

  async iniciarProduccion(id) {
    window.location.hash = `#/telares/${id}/produccion/iniciar`;
  }

  async detenerProduccion(id) {
    if (!confirm('¿Estás seguro de que deseas detener la producción?')) {
      return;
    }

    try {
      await TelarService.detenerProduccion(id);
      showNotification('Producción detenida', 'success');
      await this.loadData();
    } catch (error) {
      showNotification('Error al detener producción', 'error');
    }
  }

  async pausarProduccion(id) {
    try {
      await TelarService.updateStatus(id, 'detenido');
      showNotification('Producción pausada', 'success');
      await this.loadData();
    } catch (error) {
      showNotification('Error al pausar producción', 'error');
    }
  }
}

export default TelaresList;