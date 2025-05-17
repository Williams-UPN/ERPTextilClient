// UsuarioForm.js - Formulario de usuarios (crear/editar)
import UsuarioService from '../../services/UsuarioService.js';
import { showNotification } from '../../utils/notifications.js';
import { FormValidator } from '../../utils/validators.js';
import { USER_ROLES } from '../../config/constants.js';

class UsuarioForm {
  constructor(container, usuario = null) {
    this.container = container;
    this.usuario = usuario;
    this.isEdit = !!usuario;
    this.validator = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="form-container">
        <div class="form-header">
          <h2>${this.isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button class="btn btn-secondary" id="btnCancelar">
            <i class="fas fa-arrow-left"></i> Volver
          </button>
        </div>

        <form id="usuarioForm" class="data-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre completo *</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                value="${this.usuario?.nombre || ''}"
                required
              />
            </div>

            <div class="form-group">
              <label for="username">Usuario *</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value="${this.usuario?.username || ''}"
                ${this.isEdit ? 'readonly' : ''}
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value="${this.usuario?.email || ''}"
                required
              />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input 
                type="tel" 
                id="telefono" 
                name="telefono" 
                value="${this.usuario?.telefono || ''}"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="role">Rol *</label>
              <select id="role" name="role" required>
                <option value="">Seleccionar rol</option>
                ${Object.entries(USER_ROLES).map(([key, value]) => `
                  <option value="${value}" ${this.usuario?.role === value ? 'selected' : ''}>
                    ${this.getRoleName(value)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="estado">Estado *</label>
              <select id="estado" name="estado" required>
                <option value="activo" ${this.usuario?.estado === 'activo' ? 'selected' : ''}>
                  Activo
                </option>
                <option value="inactivo" ${this.usuario?.estado === 'inactivo' ? 'selected' : ''}>
                  Inactivo
                </option>
              </select>
            </div>
          </div>

          ${!this.isEdit ? `
            <div class="form-row">
              <div class="form-group">
                <label for="password">Contraseña *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required
                />
                <small>Mínimo 8 caracteres, una mayúscula, una minúscula y un número</small>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar contraseña *</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required
                />
              </div>
            </div>
          ` : ''}

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> 
              ${this.isEdit ? 'Actualizar' : 'Crear'} Usuario
            </button>
            <button type="button" class="btn btn-secondary" id="btnCancelarForm">
              Cancelar
            </button>
          </div>
        </form>

        ${this.isEdit ? `
          <div class="additional-actions">
            <h3>Cambiar Contraseña</h3>
            <form id="passwordForm" class="data-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="newPassword">Nueva contraseña</label>
                  <input type="password" id="newPassword" name="newPassword" />
                </div>
                <div class="form-group">
                  <label for="confirmNewPassword">Confirmar nueva contraseña</label>
                  <input type="password" id="confirmNewPassword" name="confirmNewPassword" />
                </div>
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-key"></i> Cambiar Contraseña
              </button>
            </form>
          </div>
        ` : ''}
      </div>
    `;

    this.setupValidation();
    this.attachEventListeners();
  }

  getRoleName(role) {
    const roles = {
      dueno: 'Dueño',
      administrador: 'Administrador',
      operario: 'Operario',
      revisador: 'Revisador'
    };
    return roles[role] || role;
  }

  setupValidation() {
    const rules = {
      nombre: [
        { type: 'required', message: 'El nombre es requerido' },
        { type: 'minLength', min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
      ],
      username: [
        { type: 'required', message: 'El usuario es requerido' },
        { type: 'minLength', min: 3, message: 'El usuario debe tener al menos 3 caracteres' }
      ],
      email: [
        { type: 'required', message: 'El email es requerido' },
        { type: 'email', message: 'Email inválido' }
      ],
      role: [
        { type: 'required', message: 'El rol es requerido' }
      ],
      estado: [
        { type: 'required', message: 'El estado es requerido' }
      ]
    };

    if (!this.isEdit) {
      rules.password = [
        { type: 'required', message: 'La contraseña es requerida' },
        { type: 'strongPassword', message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' }
      ];
      rules.confirmPassword = [
        { type: 'required', message: 'Debes confirmar la contraseña' },
        { 
          type: 'custom', 
          validator: (value) => value === document.getElementById('password').value,
          message: 'Las contraseñas no coinciden'
        }
      ];
    }

    this.validator = new FormValidator(document.getElementById('usuarioForm'), rules);
  }

  attachEventListeners() {
    // Formulario principal
    const form = document.getElementById('usuarioForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Botones de cancelar
    document.getElementById('btnCancelar').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('btnCancelarForm').addEventListener('click', () => {
      window.history.back();
    });

    // Formulario de contraseña (solo en edición)
    if (this.isEdit) {
      const passwordForm = document.getElementById('passwordForm');
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePasswordChange();
      });
    }
  }

  async handleSubmit() {
    if (!this.validator.validate()) {
      this.validator.showErrors();
      return;
    }

    const formData = new FormData(document.getElementById('usuarioForm'));
    const data = Object.fromEntries(formData);

    try {
      if (this.isEdit) {
        await UsuarioService.update(this.usuario.id, data);
        showNotification('Usuario actualizado correctamente', 'success');
      } else {
        await UsuarioService.create(data);
        showNotification('Usuario creado correctamente', 'success');
      }
      
      window.location.hash = '#/usuarios';
    } catch (error) {
      showNotification(error.message || 'Error al guardar usuario', 'error');
    }
  }

  async handlePasswordChange() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!newPassword || !confirmNewPassword) {
      showNotification('Debes llenar ambos campos de contraseña', 'warning');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    try {
      await UsuarioService.updatePassword(this.usuario.id, {
        password: newPassword
      });
      
      showNotification('Contraseña actualizada correctamente', 'success');
      document.getElementById('passwordForm').reset();
    } catch (error) {
      showNotification(error.message || 'Error al cambiar contraseña', 'error');
    }
  }
}

export default UsuarioForm;