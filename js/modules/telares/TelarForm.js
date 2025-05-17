// TelarForm.js - Formulario de telares (crear/editar)
import TelarService from '../../services/TelarService.js';
import { showNotification } from '../../utils/notifications.js';
import { FormValidator } from '../../utils/validators.js';
import { formatDate } from '../../utils/formatters.js';

class TelarForm {
  constructor(container, telar = null) {
    this.container = container;
    this.telar = telar;
    this.isEdit = !!telar;
    this.validator = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="form-container">
        <div class="form-header">
          <h2>${this.isEdit ? 'Editar Telar' : 'Nuevo Telar'}</h2>
          <button class="btn btn-secondary" id="btnCancelar">
            <i class="fas fa-arrow-left"></i> Volver
          </button>
        </div>

        <form id="telarForm" class="data-form">
          <div class="form-section">
            <h3>Información General</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="id">ID Telar *</label>
                <input 
                  type="text" 
                  id="id" 
                  name="id" 
                  value="${this.telar?.id || ''}"
                  ${this.isEdit ? 'readonly' : ''}
                  required
                  placeholder="Ej: MA01"
                />
              </div>

              <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  value="${this.telar?.nombre || ''}"
                  required
                  placeholder="Ej: Telar Picanol OmniPlus"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="marca">Marca *</label>
                <select id="marca" name="marca" required>
                  <option value="">Seleccionar marca</option>
                  <option value="Picanol" ${this.telar?.marca === 'Picanol' ? 'selected' : ''}>
                    Picanol
                  </option>
                  <option value="Toyota" ${this.telar?.marca === 'Toyota' ? 'selected' : ''}>
                    Toyota
                  </option>
                  <option value="Sulzer" ${this.telar?.marca === 'Sulzer' ? 'selected' : ''}>
                    Sulzer
                  </option>
                  <option value="Dornier" ${this.telar?.marca === 'Dornier' ? 'selected' : ''}>
                    Dornier
                  </option>
                  <option value="Tsudakoma" ${this.telar?.marca === 'Tsudakoma' ? 'selected' : ''}>
                    Tsudakoma
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="modelo">Modelo</label>
                <input 
                  type="text" 
                  id="modelo" 
                  name="modelo" 
                  value="${this.telar?.modelo || ''}"
                  placeholder="Ej: JAT810"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="fecha_instalacion">Fecha de Instalación *</label>
                <input 
                  type="date" 
                  id="fecha_instalacion" 
                  name="fecha_instalacion" 
                  value="${this.telar?.fecha_instalacion || ''}"
                  required
                />
              </div>

              <div class="form-group">
                <label for="numero_serie">Número de Serie</label>
                <input 
                  type="text" 
                  id="numero_serie" 
                  name="numero_serie" 
                  value="${this.telar?.numero_serie || ''}"
                  placeholder="Número de serie del fabricante"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Especificaciones Técnicas</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="revoluciones">Revoluciones (rpm) *</label>
                <input 
                  type="number" 
                  id="revoluciones" 
                  name="revoluciones" 
                  value="${this.telar?.revoluciones || ''}"
                  required
                  min="1"
                  placeholder="Ej: 750"
                />
              </div>

              <div class="form-group">
                <label for="ancho_util">Ancho Útil (cm)</label>
                <input 
                  type="number" 
                  id="ancho_util" 
                  name="ancho_util" 
                  value="${this.telar?.ancho_util || ''}"
                  min="1"
                  placeholder="Ej: 180"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="eficiencia_objetivo">Eficiencia Objetivo (%) *</label>
                <input 
                  type="number" 
                  id="eficiencia_objetivo" 
                  name="eficiencia_objetivo" 
                  value="${this.telar?.eficiencia_objetivo || 85}"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div class="form-group">
                <label for="velocidad_maxima">Velocidad Máxima (m/min)</label>
                <input 
                  type="number" 
                  id="velocidad_maxima" 
                  name="velocidad_maxima" 
                  value="${this.telar?.velocidad_maxima || ''}"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Estado y Mantenimiento</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="estado">Estado Actual *</label>
                <select id="estado" name="estado" required>
                  <option value="operativo" ${this.telar?.estado === 'operativo' ? 'selected' : ''}>
                    Operativo
                  </option>
                  <option value="detenido" ${this.telar?.estado === 'detenido' ? 'selected' : ''}>
                    Detenido
                  </option>
                  <option value="mantenimiento" ${this.telar?.estado === 'mantenimiento' ? 'selected' : ''}>
                    En Mantenimiento
                  </option>
                  <option value="fuera_servicio" ${this.telar?.estado === 'fuera_servicio' ? 'selected' : ''}>
                    Fuera de Servicio
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="ultimo_mantenimiento">Último Mantenimiento</label>
                <input 
                  type="date" 
                  id="ultimo_mantenimiento" 
                  name="ultimo_mantenimiento" 
                  value="${this.telar?.ultimo_mantenimiento || ''}"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="proximo_mantenimiento">Próximo Mantenimiento</label>
                <input 
                  type="date" 
                  id="proximo_mantenimiento" 
                  name="proximo_mantenimiento" 
                  value="${this.telar?.proximo_mantenimiento || ''}"
                />
              </div>

              <div class="form-group">
                <label for="horas_operacion">Horas de Operación</label>
                <input 
                  type="number" 
                  id="horas_operacion" 
                  name="horas_operacion" 
                  value="${this.telar?.horas_operacion || 0}"
                  min="0"
                  readonly
                />
              </div>
            </div>
          </div>

          ${this.isEdit ? `
            <div class="form-section">
              <h3>Información Adicional</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Eficiencia Real Actual</label>
                  <input 
                    type="text" 
                    value="${this.telar.eficiencia_real || 0}%"
                    readonly
                    class="readonly-field"
                  />
                </div>

                <div class="form-group">
                  <label>Última Actualización</label>
                  <input 
                    type="text" 
                    value="${formatDate(this.telar.fecha_actualizacion, 'DD/MM/YYYY HH:mm')}"
                    readonly
                    class="readonly-field"
                  />
                </div>
              </div>
            </div>
          ` : ''}

          <div class="form-section">
            <h3>Observaciones</h3>
            
            <div class="form-group full-width">
              <label for="observaciones">Observaciones</label>
              <textarea 
                id="observaciones" 
                name="observaciones" 
                rows="3"
                placeholder="Notas adicionales sobre el telar..."
              >${this.telar?.observaciones || ''}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> 
              ${this.isEdit ? 'Actualizar' : 'Crear'} Telar
            </button>
            <button type="button" class="btn btn-secondary" id="btnCancelarForm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    this.setupValidation();
    this.attachEventListeners();
  }

  setupValidation() {
    const rules = {
      id: [
        { type: 'required', message: 'El ID del telar es requerido' },
        { type: 'maxLength', max: 10, message: 'El ID no puede exceder 10 caracteres' }
      ],
      nombre: [
        { type: 'required', message: 'El nombre es requerido' },
        { type: 'minLength', min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
      ],
      marca: [
        { type: 'required', message: 'La marca es requerida' }
      ],
      fecha_instalacion: [
        { type: 'required', message: 'La fecha de instalación es requerida' }
      ],
      revoluciones: [
        { type: 'required', message: 'Las revoluciones son requeridas' },
        { type: 'positive', message: 'Las revoluciones deben ser un número positivo' }
      ],
      eficiencia_objetivo: [
        { type: 'required', message: 'La eficiencia objetivo es requerida' },
        { type: 'inRange', min: 0, max: 100, message: 'La eficiencia debe estar entre 0 y 100' }
      ],
      estado: [
        { type: 'required', message: 'El estado es requerido' }
      ]
    };

    this.validator = new FormValidator(document.getElementById('telarForm'), rules);
  }

  attachEventListeners() {
    // Formulario principal
    const form = document.getElementById('telarForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Botones de cancelar
    document.getElementById('btnCancelar').addEventListener('click', () => {
      window.location.hash = '#/telares';
    });

    document.getElementById('btnCancelarForm').addEventListener('click', () => {
      window.location.hash = '#/telares';
    });

    // Auto-calcular próximo mantenimiento cuando se actualiza el último
    const ultimoMant = document.getElementById('ultimo_mantenimiento');
    ultimoMant.addEventListener('change', (e) => {
      if (e.target.value) {
        const fecha = new Date(e.target.value);
        fecha.setMonth(fecha.getMonth() + 3); // 3 meses después por defecto
        document.getElementById('proximo_mantenimiento').value = fecha.toISOString().split('T')[0];
      }
    });
  }

  async handleSubmit() {
    if (!this.validator.validate()) {
      this.validator.showErrors();
      return;
    }

    const formData = new FormData(document.getElementById('telarForm'));
    const data = Object.fromEntries(formData);

    try {
      if (this.isEdit) {
        await TelarService.update(this.telar.id, data);
        showNotification('Telar actualizado correctamente', 'success');
      } else {
        await TelarService.create(data);
        showNotification('Telar creado correctamente', 'success');
      }
      
      window.location.hash = '#/telares';
    } catch (error) {
      showNotification(error.message || 'Error al guardar telar', 'error');
    }
  }
}

export default TelarForm;