// UsuariosList.js - Lista de usuarios
import UsuarioService from '../../services/UsuarioService.js';
import { showNotification } from '../../utils/notifications.js';
import { formatDate } from '../../utils/formatters.js';
import { canEdit, canDelete } from '../../utils/permissions.js';

class UsuariosList {
  constructor(container) {
    this.container = container;
    this.usuarios = [];
    this.loading = false;
  }

  async render() {
    this.container.innerHTML = `
      <div class="module-header">
        <h2>Gestión de Usuarios</h2>
        ${canEdit('usuarios') ? `
          <button class="btn btn-primary" id="btnNuevoUsuario">
            <i class="fas fa-plus"></i> Nuevo Usuario
          </button>
        ` : ''}
      </div>

      <div class="filters-section">
        <input 
          type="text" 
          id="searchUsuarios" 
          placeholder="Buscar usuarios..."
          class="search-input"
        />
        <select id="filterRole" class="filter-select">
          <option value="">Todos los roles</option>
          <option value="dueno">Dueño</option>
          <option value="administrador">Administrador</option>
          <option value="operario">Operario</option>
          <option value="revisador">Revisador</option>
        </select>
        <select id="filterEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div id="usuariosTableContainer" class="table-container">
        ${this.renderTable()}
      </div>
    `;

    await this.loadData();
    this.attachEventListeners();
  }

  renderTable() {
    if (this.loading) {
      return '<div class="loading">Cargando usuarios...</div>';
    }

    if (this.usuarios.length === 0) {
      return '<div class="empty-state">No se encontraron usuarios</div>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Último acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${this.usuarios.map(usuario => this.renderRow(usuario)).join('')}
        </tbody>
      </table>
    `;
  }

  renderRow(usuario) {
    return `
      <tr data-id="${usuario.id}">
        <td>${usuario.nombre}</td>
        <td>${usuario.username}</td>
        <td>${usuario.email || '-'}</td>
        <td><span class="badge badge-${usuario.role}">${this.getRoleName(usuario.role)}</span></td>
        <td>
          <span class="badge badge-${usuario.estado}">
            ${usuario.estado}
          </span>
        </td>
        <td>${usuario.ultimo_acceso ? formatDate(usuario.ultimo_acceso, 'DD/MM/YYYY HH:mm') : 'Nunca'}</td>
        <td class="actions">
          <button class="btn btn-sm btn-info view-btn" data-id="${usuario.id}">
            <i class="fas fa-eye"></i>
          </button>
          ${canEdit('usuarios') ? `
            <button class="btn btn-sm btn-warning edit-btn" data-id="${usuario.id}">
              <i class="fas fa-edit"></i>
            </button>
          ` : ''}
          ${canDelete('usuarios') ? `
            <button class="btn btn-sm btn-danger delete-btn" data-id="${usuario.id}">
              <i class="fas fa-trash"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
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

  async loadData() {
    try {
      this.loading = true;
      this.updateTable();
      
      this.usuarios = await UsuarioService.getAll();
      
      this.loading = false;
      this.updateTable();
    } catch (error) {
      this.loading = false;
      showNotification('Error al cargar usuarios', 'error');
      console.error('Error:', error);
    }
  }

  updateTable() {
    const container = document.getElementById('usuariosTableContainer');
    if (container) {
      container.innerHTML = this.renderTable();
    }
  }

  attachEventListeners() {
    // Botón nuevo usuario
    const btnNuevo = document.getElementById('btnNuevoUsuario');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => {
        this.showUserForm();
      });
    }

    // Búsqueda
    const searchInput = document.getElementById('searchUsuarios');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterUsers();
      });
    }

    // Filtros
    const filterRole = document.getElementById('filterRole');
    if (filterRole) {
      filterRole.addEventListener('change', () => {
        this.filterUsers();
      });
    }

    const filterEstado = document.getElementById('filterEstado');
    if (filterEstado) {
      filterEstado.addEventListener('change', () => {
        this.filterUsers();
      });
    }

    // Botones de acciones
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.view-btn')) {
        const id = e.target.closest('.view-btn').dataset.id;
        this.viewUser(id);
      } else if (e.target.closest('.edit-btn')) {
        const id = e.target.closest('.edit-btn').dataset.id;
        this.editUser(id);
      } else if (e.target.closest('.delete-btn')) {
        const id = e.target.closest('.delete-btn').dataset.id;
        this.deleteUser(id);
      }
    });
  }

  filterUsers() {
    const searchTerm = document.getElementById('searchUsuarios').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    const estadoFilter = document.getElementById('filterEstado').value;

    const filteredUsers = this.usuarios.filter(usuario => {
      const matchesSearch = 
        usuario.nombre.toLowerCase().includes(searchTerm) ||
        usuario.username.toLowerCase().includes(searchTerm) ||
        (usuario.email && usuario.email.toLowerCase().includes(searchTerm));
      
      const matchesRole = !roleFilter || usuario.role === roleFilter;
      const matchesEstado = !estadoFilter || usuario.estado === estadoFilter;

      return matchesSearch && matchesRole && matchesEstado;
    });

    this.renderFilteredUsers(filteredUsers);
  }

  renderFilteredUsers(users) {
    const container = document.getElementById('usuariosTableContainer');
    const table = container.querySelector('tbody');
    
    if (table) {
      table.innerHTML = users.map(usuario => this.renderRow(usuario)).join('');
    }
  }

  async viewUser(id) {
    try {
      const usuario = await UsuarioService.getById(id);
      // Aquí podrías mostrar un modal con los detalles del usuario
      console.log('Ver usuario:', usuario);
      // window.location.hash = `#/usuarios/${id}`;
    } catch (error) {
      showNotification('Error al cargar usuario', 'error');
    }
  }

  async editUser(id) {
    try {
      const usuario = await UsuarioService.getById(id);
      this.showUserForm(usuario);
    } catch (error) {
      showNotification('Error al cargar usuario', 'error');
    }
  }

  async deleteUser(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await UsuarioService.delete(id);
      showNotification('Usuario eliminado correctamente', 'success');
      await this.loadData();
    } catch (error) {
      showNotification('Error al eliminar usuario', 'error');
    }
  }

  showUserForm(usuario = null) {
    // Mostrar el formulario de usuario (crear/editar)
    console.log('Mostrar formulario:', usuario);
    // Aquí podrías abrir un modal o cambiar de vista
  }
}

export default UsuariosList;