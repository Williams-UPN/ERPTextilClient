// Dashboard.js - Componente del dashboard principal
import AuthService from '../services/AuthService.js';
import { formatDate, formatCurrency } from '../utils/formatters.js';

class Dashboard {
  constructor(container) {
    this.container = container;
    this.user = AuthService.getUser();
    this.data = {};
  }

  async loadData() {
    // Aquí cargaremos los datos del dashboard según el rol del usuario
    // Por ahora usamos datos de ejemplo
    this.data = {
      totalTelares: 8,
      telaresActivos: 5,
      produccionDiaria: 1250,
      eficienciaPromedio: 89.5,
      pedidosPendientes: 12,
      inventarioTelas: 15000,
      ventasMensuales: 185000
    };
  }

  async render() {
    await this.loadData();

    this.container.innerHTML = `
      <div class="dashboard-container">
        <h2>Dashboard - ${this.user.nombre}</h2>
        
        <div class="dashboard-stats">
          ${this.renderStatCards()}
        </div>

        <div class="dashboard-charts">
          <div class="chart-card">
            <h3>Producción Semanal</h3>
            <canvas id="produccionChart"></canvas>
          </div>
          
          <div class="chart-card">
            <h3>Estado de Telares</h3>
            <canvas id="telaresChart"></canvas>
          </div>
        </div>

        <div class="dashboard-tables">
          ${this.renderRecentActivity()}
        </div>
      </div>
    `;

    // Inicializar gráficos si Chart.js está disponible
    this.initializeCharts();
  }

  renderStatCards() {
    const cards = [
      {
        title: 'Telares Activos',
        value: `${this.data.telaresActivos}/${this.data.totalTelares}`,
        icon: 'fa-cogs',
        color: 'primary'
      },
      {
        title: 'Producción Diaria',
        value: `${this.data.produccionDiaria} m`,
        icon: 'fa-industry',
        color: 'success'
      },
      {
        title: 'Eficiencia',
        value: `${this.data.eficienciaPromedio}%`,
        icon: 'fa-tachometer-alt',
        color: 'info'
      },
      {
        title: 'Ventas del Mes',
        value: formatCurrency(this.data.ventasMensuales),
        icon: 'fa-dollar-sign',
        color: 'warning'
      }
    ];

    return cards.map(card => `
      <div class="stat-card ${card.color}">
        <div class="stat-icon">
          <i class="fas ${card.icon}"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">${card.value}</div>
          <div class="stat-title">${card.title}</div>
        </div>
      </div>
    `).join('');
  }

  renderRecentActivity() {
    return `
      <div class="activity-card">
        <h3>Actividad Reciente</h3>
        <table class="activity-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Evento</th>
              <th>Usuario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${formatDate(new Date(), 'HH:mm')}</td>
              <td>Telar MA01 iniciado</td>
              <td>Juan Pérez</td>
              <td><span class="badge success">Activo</span></td>
            </tr>
            <tr>
              <td>${formatDate(new Date(Date.now() - 3600000), 'HH:mm')}</td>
              <td>Nueva orden de producción</td>
              <td>María Torres</td>
              <td><span class="badge info">Procesando</span></td>
            </tr>
            <tr>
              <td>${formatDate(new Date(Date.now() - 7200000), 'HH:mm')}</td>
              <td>Mantenimiento MA04</td>
              <td>Carlos López</td>
              <td><span class="badge warning">Programado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  initializeCharts() {
    // Si Chart.js está disponible, inicializar gráficos
    if (typeof Chart !== 'undefined') {
      // Gráfico de producción
      const produccionCtx = document.getElementById('produccionChart');
      if (produccionCtx) {
        new Chart(produccionCtx, {
          type: 'line',
          data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
              label: 'Producción (metros)',
              data: [1200, 1350, 1100, 1450, 1500, 1250, 800],
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          }
        });
      }

      // Gráfico de telares
      const telaresCtx = document.getElementById('telaresChart');
      if (telaresCtx) {
        new Chart(telaresCtx, {
          type: 'doughnut',
          data: {
            labels: ['Activos', 'Detenidos', 'Mantenimiento'],
            datasets: [{
              data: [5, 2, 1],
              backgroundColor: [
                'rgb(34, 197, 94)',
                'rgb(239, 68, 68)',
                'rgb(251, 191, 36)'
              ]
            }]
          }
        });
      }
    }
  }
}

export default Dashboard;