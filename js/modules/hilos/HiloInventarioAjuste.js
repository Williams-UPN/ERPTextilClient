// HiloInventarioAjuste.js - Ajuste de inventario de hilos
import HiloService from '../../services/HiloService.js';
import { showNotification } from '../../utils/notifications.js';
import { formatNumber } from '../../utils/formatters.js';
import AuthService from '../../services/AuthService.js';

class HiloInventarioAjuste {
  constructor(container, hilo) {
    this.container = container;
    this.hilo = hilo;
    this.user = AuthService.getUser();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="ajusteModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Ajustar Inventario - ${this.hilo.codigo}</h3>
            <button class="close-modal" id="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form id="ajusteForm">
              <div class="form-group">
                <label>Hilo:</label>
                <input type="text" value="${this.hilo.codigo} - ${this.hilo.color}" readonly />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Stock Actual:</label>
                  <input 
                    type="text" 
                    value="${formatNumber(this.hilo.stock_actual, 2)} kg" 
                    readonly 
                  />
                </div>
                
                <div class="form-group">
                  <label for="nuevo_stock">Nuevo Stock (kg) *</label>
                  <input 
                    type="number" 
                    id="nuevo_stock" 
                    name="nuevo_stock" 
                    step="0.01"
                    required
                    value="${this.hilo.stock_actual}"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Diferencia:</label>
                <div id="diferencia" class="diferencia-display">
                  0.00 kg
                </div>
              </div>
              
              <div class="form-group">
                <label for="motivo">Motivo del Ajuste *</label>
                <select id="motivo" name="motivo" required>
                  <option value="">Seleccionar motivo</option>
                  <option value="inventario_fisico">Inventario Físico</option>
                  <option value="correccion_error">Corrección de Error</option>
                  <option value="merma">Merma</option>
                  <option value="deterioro">Deterioro</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              <div class="form-group" id="otroMotivoGroup" style="display: none;">
                <label for="otro_motivo">Especificar Motivo *</label>
                <input 
                  type="text" 
                  id="otro_motivo" 
                  name="otro_motivo"
                  placeholder="Describir el motivo del ajuste"
                />
              </div>
              
              <div class="form-group">
                <label for="observaciones">Observaciones</label>
                <textarea 
                  id="observaciones" 
                  name="observaciones" 
                  rows="3"
                  placeholder="Detalles adicionales sobre el ajuste..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Registrado por:</label>
                <input type="text" value="${this.user.nombre}" readonly />
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btnCancelar">
              Cancelar
            </button>
            <button type="submit" form="ajusteForm" class="btn btn-primary">
              <i class="fas fa-save"></i> Guardar Ajuste
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Cerrar modal
    document.getElementById('closeModal').addEventListener('click', () => this.close());
    document.getElementById('btnCancelar').addEventListener('click', () => this.close());
    
    // Click fuera del modal
    document.getElementById('ajusteModal').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.close();
      }
    });

    // Calcular diferencia
    const nuevoStockInput = document.getElementById('nuevo_stock');
    nuevoStockInput.addEventListener('input', () => this.calcularDiferencia());

    // Mostrar/ocultar campo otro motivo
    const motivoSelect = document.getElementById('motivo');
    motivoSelect.addEventListener('change', (e) => {
      const otroMotivoGroup = document.getElementById('otroMotivoGroup');
      if (e.target.value === 'otro') {
        otroMotivoGroup.style.display = 'block';
        document.getElementById('otro_motivo').required = true;
      } else {
        otroMotivoGroup.style.display = 'none';
        document.getElementById('otro_motivo').required = false;
      }
    });

    // Submit form
    const form = document.getElementById('ajusteForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  calcularDiferencia() {
    const nuevoStock = parseFloat(document.getElementById('nuevo_stock').value) || 0;
    const diferencia = nuevoStock - this.hilo.stock_actual;
    const diferenciaElement = document.getElementById('diferencia');
    
    diferenciaElement.textContent = `${diferencia > 0 ? '+' : ''}${formatNumber(diferencia, 2)} kg`;
    diferenciaElement.className = `diferencia-display ${diferencia > 0 ? 'positiva' : diferencia < 0 ? 'negativa' : ''}`;
  }

  async handleSubmit() {
    const formData = new FormData(document.getElementById('ajusteForm'));
    const data = Object.fromEntries(formData);
    
    // Calcular diferencia
    const nuevoStock = parseFloat(data.nuevo_stock);
    const diferencia = nuevoStock - this.hilo.stock_actual;
    
    if (diferencia === 0) {
      showNotification('No hay diferencia en el stock', 'warning');
      return;
    }

    // Preparar datos para el ajuste
    const ajusteData = {
      cantidad: Math.abs(diferencia),
      tipo: diferencia > 0 ? 'entrada' : 'salida',
      motivo: data.motivo === 'otro' ? data.otro_motivo : data.motivo,
      observaciones: data.observaciones,
      stock_anterior: this.hilo.stock_actual,
      stock_posterior: nuevoStock,
      usuario_id: this.user.id
    };

    try {
      await HiloService.updateStock(this.hilo.id, ajusteData.cantidad, ajusteData.tipo);
      showNotification('Stock ajustado correctamente', 'success');
      this.close();
      
      // Recargar la lista de hilos si existe
      if (window.location.hash === '#/hilos') {
        window.location.reload();
      }
    } catch (error) {
      showNotification(error.message || 'Error al ajustar stock', 'error');
    }
  }

  close() {
    this.container.innerHTML = '';
  }
}

export default HiloInventarioAjuste;