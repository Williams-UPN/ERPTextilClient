// TelarProduccion.js - Gestión de producción de telares
import TelarService from '../../services/TelarService.js';
import TelaService from '../../services/TelaService.js';
import UsuarioService from '../../services/UsuarioService.js';
import { showNotification } from '../../utils/notifications.js';
import { FormValidator } from '../../utils/validators.js';
import AuthService from '../../services/AuthService.js';

class TelarProduccion {
  constructor(container, telarId) {
    this.container = container;
    this.telarId = telarId;
    this.telar = null;
    this.telas = [];
    this.operarios = [];
    this.validator = null;
  }

  async render() {
    try {
      await this.loadData();
      
      this.container.innerHTML = `
        <div class="form-container">
          <div class="form-header">
            <h2>Iniciar Producción - ${this.telar.nombre}</h2>
            <button class="btn btn-secondary" id="btnCancelar">
              <i class="fas fa-arrow-left"></i> Cancelar
            </button>
          </div>

          <div class="production-info">
            <div class="info-card">
              <h4>Información del Telar</h4>
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
                  <label>Estado:</label>
                  <span class="badge badge-${this.getEstadoBadgeClass(this.telar.estado)}">
                    ${this.getEstadoText(this.telar.estado)}
                  </span>
                </div>
                <div class="info-item">
                  <label>Eficiencia Objetivo:</label>
                  <span>${this.telar.eficiencia_objetivo}%</span>
                </div>
              </div>
            </div>
          </div>

          <form id="produccionForm" class="data-form">
            <div class="form-section">
              <h3>Configuración de Producción</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="tela_id">Tela a Producir *</label>
                  <select id="tela_id" name="tela_id" required>
                    <option value="">Seleccionar tela</option>
                    ${this.telas.map(tela => `
                      <option value="${tela.id}">
                        ${tela.codigo} - ${tela.nombre}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label for="operario_id">Operario Asignado *</label>
                  <select id="operario_id" name="operario_id" required>
                    <option value="">Seleccionar operario</option>
                    ${this.operarios.map(operario => `
                      <option value="${operario.id}">
                        ${operario.nombre} - ${operario.codigo}
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="turno">Turno *</label>
                  <select id="turno" name="turno" required>
                    <option value="">Seleccionar turno</option>
                    <option value="mañana">Mañana (6:00 - 14:00)</option>
                    <option value="tarde">Tarde (14:00 - 22:00)</option>
                    <option value="noche">Noche (22:00 - 6:00)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="fecha_inicio">Fecha/Hora Inicio *</label>
                  <input 
                    type="datetime-local" 
                    id="fecha_inicio" 
                    name="fecha_inicio" 
                    value="${new Date().toISOString().slice(0, -8)}"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="metros_objetivo">Metros Objetivo</label>
                  <input 
                    type="number" 
                    id="metros_objetivo" 
                    name="metros_objetivo" 
                    step="0.01"
                    min="0"
                    placeholder="Metros estimados a producir"
                  />
                </div>

                <div class="form-group">
                  <label for="velocidad_telar">Velocidad Telar (rpm)</label>
                  <input 
                    type="number" 
                    id="velocidad_telar" 
                    name="velocidad_telar" 
                    value="${this.telar.revoluciones}"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div class="form-section" id="telaInfoSection" style="display: none;">
              <h3>Información de la Tela</h3>
              <div class="tela-info-container">
                <div class="info-grid" id="telaInfoGrid">
                  <!-- Se llenará dinámicamente -->
                </div>
                
                <div class="composicion-section">
                  <h4>Composición de Hilos</h4>
                  <table class="composicion-table" id="composicionTable">
                    <thead>
                      <tr>
                        <th>Hilo</th>
                        <th>Posición</th>
                        <th>Porcentaje</th>
                        <th>Stock Disponible</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody id="composicionBody">
                      <!-- Se llenará dinámicamente -->
                    </tbody>
                  </table>
                  <div class="composicion-alert" id="composicionAlert" style="display: none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span id="alertMessage"></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Observaciones</h3>
              
              <div class="form-group full-width">
                <label for="observaciones">Observaciones</label>
                <textarea 
                  id="observaciones" 
                  name="observaciones" 
                  rows="3"
                  placeholder="Notas adicionales sobre la producción..."
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="btnIniciar">
                <i class="fas fa-play"></i> Iniciar Producción
              </button>
              <button type="button" class="btn btn-secondary" id="btnCancelarForm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      `;

      this.attachEventListeners();
      this.setupValidation();
    } catch (error) {
      showNotification('Error al cargar datos', 'error');
      window.location.hash = '#/telares';
    }
  }

  async loadData() {
    // Cargar datos en paralelo
    const [telar, telas, usuarios] = await Promise.all([
      TelarService.getById(this.telarId),
      TelaService.getAll(),
      UsuarioService.getByRole('operario')
    ]);

    this.telar = telar;
    this.telas = telas;
    this.operarios = usuarios.filter(u => u.estado === 'activo');

    // Verificar si el telar puede iniciar producción
    if (this.telar.estado !== 'operativo' && this.telar.estado !== 'detenido') {
      throw new Error(`El telar está en estado ${this.telar.estado} y no puede iniciar producción`);
    }
  }

  setupValidation() {
    const rules = {
      tela_id: [
        { type: 'required', message: 'Debe seleccionar una tela' }
      ],
      operario_id: [
        { type: 'required', message: 'Debe seleccionar un operario' }
      ],
      turno: [
        { type: 'required', message: 'Debe seleccionar un turno' }
      ],
      fecha_inicio: [
        { type: 'required', message: 'La fecha de inicio es requerida' }
      ]
    };

    this.validator = new FormValidator(document.getElementById('produccionForm'), rules);
  }

  attachEventListeners() {
    // Formulario
    const form = document.getElementById('produccionForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Botones cancelar
    document.getElementById('btnCancelar').addEventListener('click', () => {
      window.location.hash = '#/telares';
    });

    document.getElementById('btnCancelarForm').addEventListener('click', () => {
      window.location.hash = '#/telares';
    });

    // Cambio de tela
    const telaSelect = document.getElementById('tela_id');
    telaSelect.addEventListener('change', async (e) => {
      if (e.target.value) {
        await this.loadTelaInfo(e.target.value);
      } else {
        document.getElementById('telaInfoSection').style.display = 'none';
      }
    });
  }

  async loadTelaInfo(telaId) {
    try {
      const tela = await TelaService.getById(telaId);
      const hilosRequeridos = await TelaService.getHilosRequeridos(telaId);
      
      // Mostrar información de la tela
      const telaInfoGrid = document.getElementById('telaInfoGrid');
      telaInfoGrid.innerHTML = `
        <div class="info-item">
          <label>Código:</label>
          <span>${tela.codigo}</span>
        </div>
        <div class="info-item">
          <label>Nombre:</label>
          <span>${tela.nombre}</span>
        </div>
        <div class="info-item">
          <label>Tipo:</label>
          <span>${tela.tipo}</span>
        </div>
        <div class="info-item">
          <label>Rendimiento:</label>
          <span>${tela.rendimiento_minimo} - ${tela.rendimiento_maximo} m/kg</span>
        </div>
      `;

      // Mostrar composición de hilos
      const composicionBody = document.getElementById('composicionBody');
      let hayProblemaStock = false;
      
      composicionBody.innerHTML = hilosRequeridos.map(hilo => {
        const stockSuficiente = hilo.stock_actual > 50; // Mínimo 50kg para iniciar
        if (!stockSuficiente) hayProblemaStock = true;
        
        return `
          <tr>
            <td>${hilo.codigo} - ${hilo.color}</td>
            <td>${hilo.posicion}</td>
            <td>${hilo.porcentaje}%</td>
            <td>${hilo.stock_actual} kg</td>
            <td>
              <span class="badge badge-${stockSuficiente ? 'success' : 'danger'}">
                ${stockSuficiente ? 'Disponible' : 'Stock Bajo'}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      // Mostrar alerta si hay problemas de stock
      const composicionAlert = document.getElementById('composicionAlert');
      if (hayProblemaStock) {
        document.getElementById('alertMessage').textContent = 
          'Advertencia: Algunos hilos tienen stock bajo. La producción podría interrumpirse.';
        composicionAlert.style.display = 'block';
      } else {
        composicionAlert.style.display = 'none';
      }

      document.getElementById('telaInfoSection').style.display = 'block';
    } catch (error) {
      showNotification('Error al cargar información de la tela', 'error');
    }
  }

  async handleSubmit() {
    if (!this.validator.validate()) {
      this.validator.showErrors();
      return;
    }

    const formData = new FormData(document.getElementById('produccionForm'));
    const data = Object.fromEntries(formData);

    try {
      // Iniciar producción
      await TelarService.iniciarProduccion(this.telarId, data.tela_id);
      
      // Asignar operario
      await TelarService.asignarOperario(this.telarId, data.operario_id);
      
      showNotification('Producción iniciada correctamente', 'success');
      window.location.hash = `#/telares/${this.telarId}`;
    } catch (error) {
      showNotification(error.message || 'Error al iniciar producción', 'error');
    }
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
}

export default TelarProduccion;