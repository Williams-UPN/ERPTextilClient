// constants.js - Configuración y constantes del sistema
export const API_BASE_URL = 'http://localhost:3000/api';

export const USER_ROLES = {
  DUENO: 'dueno',
  ADMINISTRADOR: 'administrador',
  OPERARIO: 'operario',
  REVISADOR: 'revisador'
};

export const PERMISSIONS = {
  [USER_ROLES.DUENO]: {
    canViewAll: true,
    canEditAll: true,
    canDeleteAll: true,
    canGenerateReports: true,
    canManageUsers: true,
    canViewFinancials: true
  },
  [USER_ROLES.ADMINISTRADOR]: {
    canViewAll: true,
    canEditAll: true,
    canDeleteAll: false,
    canGenerateReports: true,
    canManageUsers: true,
    canViewFinancials: false
  },
  [USER_ROLES.OPERARIO]: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    canGenerateReports: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditProduction: true
  },
  [USER_ROLES.REVISADOR]: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    canGenerateReports: false,
    canManageUsers: false,
    canViewFinancials: false,
    canReviewProduction: true
  }
};

export const ESTADOS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  PENDIENTE: 'pendiente',
  FINALIZADO: 'finalizado'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const NOTIFICATION_DURATION = 5000; // 5 segundos