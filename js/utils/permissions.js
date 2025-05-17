// permissions.js - Sistema de permisos
import AuthService from '../services/AuthService.js';
import { PERMISSIONS, USER_ROLES } from '../config/constants.js';

class PermissionManager {
  constructor() {
    this.user = AuthService.getUser();
    this.permissions = this.getUserPermissions();
  }

  getUserPermissions() {
    if (!this.user || !this.user.role) return {};
    return PERMISSIONS[this.user.role] || {};
  }

  hasPermission(permission) {
    return this.permissions[permission] === true;
  }

  canView(module) {
    switch (module) {
      case 'usuarios':
        return this.hasPermission('canManageUsers') || this.hasPermission('canViewAll');
      case 'finanzas':
        return this.hasPermission('canViewFinancials');
      case 'reportes':
        return this.hasPermission('canGenerateReports');
      case 'produccion':
        return this.hasPermission('canEditProduction') || 
               this.hasPermission('canReviewProduction') ||
               this.hasPermission('canViewAll');
      default:
        return this.hasPermission('canViewAll');
    }
  }

  canEdit(module) {
    switch (module) {
      case 'usuarios':
        return this.hasPermission('canManageUsers');
      case 'produccion':
        return this.hasPermission('canEditProduction') || this.hasPermission('canEditAll');
      default:
        return this.hasPermission('canEditAll');
    }
  }

  canDelete(module) {
    return this.hasPermission('canDeleteAll');
  }

  canCreate(module) {
    return this.canEdit(module);
  }

  isAdmin() {
    return this.user?.role === USER_ROLES.ADMINISTRADOR || 
           this.user?.role === USER_ROLES.DUENO;
  }

  isOwner() {
    return this.user?.role === USER_ROLES.DUENO;
  }

  isOperario() {
    return this.user?.role === USER_ROLES.OPERARIO;
  }

  isRevisador() {
    return this.user?.role === USER_ROLES.REVISADOR;
  }

  checkPermission(permission, showError = true) {
    const hasPermission = this.hasPermission(permission);
    
    if (!hasPermission && showError) {
      this.showPermissionError();
    }
    
    return hasPermission;
  }

  showPermissionError() {
    alert('No tienes permisos para realizar esta acción');
  }

  updateUser() {
    this.user = AuthService.getUser();
    this.permissions = this.getUserPermissions();
  }

  // Decorador para métodos que requieren permisos
  requirePermission(permission) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = function(...args) {
        if (!this.checkPermission(permission)) {
          return null;
        }
        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }

  // Método para verificar permisos en elementos del DOM
  applyPermissionsToDOM() {
    // Ocultar elementos según permisos
    document.querySelectorAll('[data-permission]').forEach(element => {
      const permission = element.dataset.permission;
      if (!this.hasPermission(permission)) {
        element.style.display = 'none';
      }
    });

    // Deshabilitar elementos según permisos
    document.querySelectorAll('[data-permission-disable]').forEach(element => {
      const permission = element.dataset.permissionDisable;
      if (!this.hasPermission(permission)) {
        element.disabled = true;
        element.classList.add('disabled');
      }
    });

    // Aplicar permisos a módulos específicos
    document.querySelectorAll('[data-module]').forEach(element => {
      const module = element.dataset.module;
      const action = element.dataset.action || 'view';
      
      let hasPermission = false;
      switch (action) {
        case 'view':
          hasPermission = this.canView(module);
          break;
        case 'edit':
          hasPermission = this.canEdit(module);
          break;
        case 'delete':
          hasPermission = this.canDelete(module);
          break;
        case 'create':
          hasPermission = this.canCreate(module);
          break;
      }

      if (!hasPermission) {
        element.style.display = 'none';
      }
    });
  }
}

// Instancia global
const permissionManager = new PermissionManager();

// Funciones de conveniencia
export function hasPermission(permission) {
  return permissionManager.hasPermission(permission);
}

export function canView(module) {
  return permissionManager.canView(module);
}

export function canEdit(module) {
  return permissionManager.canEdit(module);
}

export function canDelete(module) {
  return permissionManager.canDelete(module);
}

export function canCreate(module) {
  return permissionManager.canCreate(module);
}

export function applyPermissionsToDOM() {
  permissionManager.applyPermissionsToDOM();
}

export function updateUser() {
  permissionManager.updateUser();
}

export default permissionManager;