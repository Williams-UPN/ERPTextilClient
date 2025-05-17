// Login.js - Componente de login
import AuthService from '../services/AuthService.js';
import { showNotification } from '../utils/notifications.js';

class Login {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="login-container">
        <div class="login-box">
          <h2>Sistema ERP Textil</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Usuario</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                required 
                autocomplete="username"
              />
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                autocomplete="current-password"
              />
            </div>
            <button type="submit" class="btn btn-primary">
              Iniciar Sesión
            </button>
          </form>
          <div id="loginError" class="error-message"></div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  }

  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
      const response = await AuthService.login(username, password);
      
      if (response.token) {
        showNotification('Inicio de sesión exitoso', 'success');
        // Redirigir al dashboard después del login exitoso
        window.location.href = '#/dashboard';
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'Error al iniciar sesión';
      showNotification('Error al iniciar sesión', 'error');
    }
  }
}

export default Login;