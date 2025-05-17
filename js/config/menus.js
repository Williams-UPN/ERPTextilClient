// menus.js - Configuración de menús por rol
export const MENU_CONFIG = {
  dueno: [
    {
      id: "dashboard",
      icon: "fas fa-chart-line",
      label: "Dashboard General",
    },
    { id: "kpis", icon: "fas fa-tachometer-alt", label: "KPIs" },
    { id: "analisis", icon: "fas fa-chart-pie", label: "Análisis de Datos" },
    {
      id: "hilos-inventario",
      icon: "fas fa-box-open",
      label: "Inventario Hilos",
    },
    {
      id: "produccion",
      icon: "fas fa-industry",
      label: "Supervisión Producción",
    },
    {
      id: "telas-inventario",
      icon: "fas fa-layer-group",
      label: "Inventario Telas",
    },
    { id: "ventas", icon: "fas fa-receipt", label: "Gestión Ventas" },
    {
      id: "finanzas",
      icon: "fas fa-money-bill-wave",
      label: "Gestión Financiera",
    },
    { id: "reportes", icon: "fas fa-file-alt", label: "Reportes Detallados" },
    {
      id: "configuracion",
      icon: "fas fa-cog",
      label: "Configuración Sistema",
    },
  ],
  administrador: [
    {
      id: "ingreso-manual",
      icon: "fas fa-plus-square",
      label: "Ingreso Manual Prod.",
    },
    { id: "telares", icon: "fas fa-cogs", label: "Gestión Telares" },
    { id: "gestion-telas", icon: "fas fa-scroll", label: "Definición Telas" },
    { id: "operarios", icon: "fas fa-users-cog", label: "Gestión Operarios" },
    {
      id: "asignaciones",
      icon: "fas fa-calendar-alt",
      label: "Asignaciones Diarias",
    },
    {
      id: "hilos-inventario",
      icon: "fas fa-box-open",
      label: "Inventario Hilos",
    },
    {
      id: "produccion",
      icon: "fas fa-industry",
      label: "Supervisión Producción",
    },
    {
      id: "telas-inventario",
      icon: "fas fa-layer-group",
      label: "Inventario Telas",
    },
    { id: "ventas", icon: "fas fa-receipt", label: "Gestión Ventas" },
    { id: "reportes", icon: "fas fa-file-alt", label: "Reportes" },
    { id: "configuracion", icon: "fas fa-cog", label: "Configuración" },
  ],
  operario: [
    {
      id: "operario-control",
      icon: "fas fa-tasks",
      label: "Control Operaciones",
    },
  ],
  revisador: [
    {
      id: "revisador",
      icon: "fas fa-clipboard-check",
      label: "Control de Cortes",
    },
  ],
};