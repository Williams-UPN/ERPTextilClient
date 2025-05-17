// HiloForm.js - Formulario de hilos (crear/editar)
import HiloService from '../../services/HiloService.js';
import { showNotification } from '../../utils/notifications.js';
import { FormValidator } from '../../utils/validators.js';

class HiloForm {
  constructor(container, hilo = null) {
    this.container = container;
    this.hilo = hilo;
    this.isEdit = !!hilo;
    this.validator = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="form-container">
        <div class="form-header">
          <h2>${this.isEdit ? 'Editar Hilo' : 'Nuevo Hilo'}</h2>
          <button class="btn btn-secondary" id="btnCancelar">
            <i class="fas fa-arrow-left"></i> Volver
          </button>
        </div>

        <form id="hiloForm" class="data-form">
          <div class="form-section">
            <h3>Información Básica</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="codigo">Código *</label>
                <input 
                  type="text" 
                  id="codigo" 
                  name="codigo" 
                  value="${this.hilo?.codigo || ''}"
                  ${this.isEdit ? 'readonly' : ''}
                  required
                  placeholder="Ej: ALG-20/1-NAT"
                />
              </div>

              <div class="form-group">
                <label for="tipo">Tipo *</label>
                <select id="tipo" name="tipo" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="algodon" ${this.hilo?.tipo === 'algodon' ? 'selected' : ''}>
                    Algodón
                  </option>
                  <option value="poliester" ${this.hilo?.tipo === 'poliester' ? 'selected' : ''}>
                    Poliéster
                  </option>
                  <option value="mezcla" ${this.hilo?.tipo === 'mezcla' ? 'selected' : ''}>
                    Mezcla
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="color">Color *</label>
                <input 
                  type="text" 
                  id="color" 
                  name="color" 
                  value="${this.hilo?.color || ''}"
                  required
                  placeholder="Ej: Natural, Blanco, Negro"
                />
              </div>

              <div class="form-group">
                <label for="color_hex">Color Hex</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    id="color_hex" 
                    name="color_hex" 
                    value="${this.hilo?.color_hex || '#FFFFFF'}"
                  />
                  <input 
                    type="text" 
                    id="color_hex_text" 
                    name="color_hex_text" 
                    value="${this.hilo?.color_hex || '#FFFFFF'}"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="calibre">Calibre *</label>
                <select id="calibre" name="calibre" required>
                  <option value="">Seleccionar calibre</option>
                  <option value="20/1" ${this.hilo?.calibre === '20/1' ? 'selected' : ''}>
                    20/1
                  </option>
                  <option value="30/1" ${this.hilo?.calibre === '30/1' ? 'selected' : ''}>
                    30/1
                  </option>
                  <option value="40/1" ${this.hilo?.calibre === '40/1' ? 'selected' : ''}>
                    40/1
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="proveedor">Proveedor</label>
                <input 
                  type="text" 
                  id="proveedor" 
                  name="proveedor" 
                  value="${this.hilo?.proveedor || ''}"
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Stock y Precios</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="stock_actual">Stock Actual (kg) *</label>
                <input 
                  type="number" 
                  id="stock_actual" 
                  name="stock_actual" 
                  value="${this.hilo?.stock_actual || 0}"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div class="form-group">
                <label for="stock_minimo">Stock Mínimo (kg) *</label>
                <input 
                  type="number" 
                  id="stock_minimo" 
                  name="stock_minimo" 
                  value="${this.hilo?.stock_minimo || 0}"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="precio_kg">Precio por kg (S/) *</label>
                <input 
                  type="number" 
                  id="precio_kg" 
                  name="precio_kg" 
                  value="${this.hilo?.precio_kg || 0}"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div class="form-group">
                <label for="consumo_promedio">Consumo Promedio Diario (kg)</label>
                <input 
                  type="number" 
                  id="consumo_promedio" 
                  name="consumo_promedio" 
                  value="${this.hilo?.consumo_promedio || 0}"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          ${this.isEdit ? `
            <div class="form-section">
              <h3>Información Adicional</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Fecha de Registro</label>
                  <input 
                    type="text" 
                    value="${new Date(this.hilo.fecha_registro).toLocaleString()}"
                    readonly
                    class="readonly-field"
                  />
                </div>

                <div class="form-group">
                  <label>Última Actualización</label>
                  <input 
                    type="text" 
                    value="${new Date(this.hilo.fecha_actualizacion).toLocaleString()}"
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
                placeholder="Notas adicionales sobre el hilo..."
              >${this.hilo?.observaciones || ''}</textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> 
              ${this.isEdit ? 'Actualizar' : 'Crear'} Hilo
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
      codigo: [
        { type: 'required', message: 'El código es requerido' },
        { type: 'productCode', message: 'Formato de código inválido (Ej: ALG-001)' }
      ],
      tipo: [
        { type: 'required', message: 'El tipo es requerido' }
      ],
      color: [
        { type: 'required', message: 'El color es requerido' }
      ],
      calibre: [
        { type: 'required', message: 'El calibre es requerido' }
      ],
      stock_actual: [
        { type: 'required', message: 'El stock actual es requerido' },
        { type: 'positive', message: 'El stock debe ser positivo' }
      ],
      stock_minimo: [
        { type: 'required', message: 'El stock mínimo es requerido' },
        { type: 'positive', message: 'El stock mínimo debe ser positivo' }
      ],
      precio_kg: [
        { type: 'required', message: 'El precio es requerido' },
        { type: 'positive', message: 'El precio debe ser positivo' }
      ]
    };

    this.validator = new FormValidator(document.getElementById('hiloForm'), rules);
  }

  attachEventListeners() {
    // Formulario principal
    const form = document.getElementById('hiloForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Botones de cancelar
    document.getElementById('btnCancelar').addEventListener('click', () => {
      window.location.hash = '#/hilos';
    });

    document.getElementById('btnCancelarForm').addEventListener('click', () => {
      window.location.hash = '#/hilos';
    });

    // Sincronizar color picker con input de texto
    const colorHex = document.getElementById('color_hex');
    const colorHexText = document.getElementById('color_hex_text');
    
    colorHex.addEventListener('change', (e) => {
      colorHexText.value = e.target.value;
    });

    colorHexText.addEventListener('change', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorHex.value = e.target.value;
      }
    });
  }

  async handleSubmit() {
    if (!this.validator.validate()) {
      this.validator.showErrors();
      return;
    }

    const formData = new FormData(document.getElementById('hiloForm'));
    const data = Object.fromEntries(formData);
    
    // Asegurar que color_hex tenga el valor correcto
    data.color_hex = document.getElementById('color_hex').value;

    try {
      if (this.isEdit) {
        await HiloService.update(this.hilo.id, data);
        showNotification('Hilo actualizado correctamente', 'success');
      } else {
        await HiloService.create(data);
        showNotification('Hilo creado correctamente', 'success');
      }
      
      window.location.hash = '#/hilos';
    } catch (error) {
      showNotification(error.message || 'Error al guardar hilo', 'error');
    }
  }
}

export default HiloForm;