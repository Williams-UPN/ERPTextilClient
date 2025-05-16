// js/api-integration.js
// Funciones para integrar la API con el frontend existente

/**
 * Modifica la función handleLogin para usar la API
 */
async function handleLoginAPI(e) {
  e.preventDefault();
  console.log("handleLoginAPI: Intento de login...");
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    // Hacer login usando la API
    const response = await API.auth.login(username, password);
    
    if (response.success && response.token) {
      console.log("handleLoginAPI: Login exitoso para", username);
      
      // Guardar token
      localStorage.setItem('token', response.token);
      
      // Actualizar usuario global
      currentUserGlobal = {
        id: response.user.id,
        name: response.user.nombre,
        username: response.user.username,
        role: response.user.role,
      };
      
      sessionStorage.setItem("currentUser", JSON.stringify(currentUserGlobal));
      loadUserInterface(currentUserGlobal);
      showToast("success", "Inicio de Sesión Exitoso", `Bienvenido ${response.user.nombre}`);
    }
  } catch (error) {
    console.error("handleLoginAPI: Error en login", error);
    showToast(
      "error",
      "Error de Acceso",
      error.message || "Usuario o contraseña incorrectos"
    );
    currentUserGlobal = null;
  }
}

/**
 * Verifica si hay un token válido al cargar la página
 */
async function verificarSesion() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    // Verificar token haciendo una petición a la API
    const userData = await API.auth.verificarToken();
    
    currentUserGlobal = {
      id: userData.id,
      name: userData.nombre,
      username: userData.username,
      role: userData.role,
    };
    
    sessionStorage.setItem("currentUser", JSON.stringify(currentUserGlobal));
    return true;
  } catch (error) {
    console.error("Token inválido o expirado", error);
    localStorage.removeItem('token');
    return false;
  }
}

/**
 * Modifica la función handleLogout para limpiar el token
 */
function handleLogoutAPI() {
  console.log("handleLogoutAPI: Cerrando sesión...");
  
  // Limpiar token y datos de sesión
  localStorage.removeItem('token');
  sessionStorage.removeItem("currentUser");
  currentUserGlobal = null;

  // Ocultar UI principal
  document.querySelector(".sidebar").style.display = "none";
  document.querySelector(".main-header").style.display = "none";

  // Limpiar campos de login
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";

  // Mostrar login
  showPage("login");
  showToast("info", "Sesión Cerrada", "Has cerrado sesión correctamente");
}

// Reemplazar las funciones originales
window.handleLogin = handleLoginAPI;
window.handleLogout = handleLogoutAPI;

// Exportar funciones para uso global
window.verificarSesion = verificarSesion;

// Modificar initApp para verificar primero el token
const originalInitApp = window.initApp;
window.initApp = async function() {
  console.log("initApp: Iniciando aplicación con verificación de API...");
  
  // Primero intentar verificar si hay un token válido
  const sesionValida = await verificarSesion();
  
  if (sesionValida) {
    console.log("initApp: Sesión válida encontrada, cargando interfaz");
    loadUserInterface(currentUserGlobal);
  } else {
    // Si no hay sesión válida, usar el comportamiento original
    originalInitApp();
  }
};

// Agregar interceptors para las llamadas a datos
// Esto permitirá reemplazar gradualmente las llamadas a config con llamadas a la API

// Funciones para cargar datos desde la API
async function cargarHilosDesdeAPI() {
  try {
    const hilos = await API.hilos.getAll();
    return hilos;
  } catch (error) {
    console.error("Error al cargar hilos desde API:", error);
    return config.hilos || []; // Fallback a datos locales
  }
}

async function cargarTelaresDesdeAPI() {
  try {
    const telares = await API.telares.getAll();
    return telares;
  } catch (error) {
    console.error("Error al cargar telares desde API:", error);
    return config.telares || []; // Fallback a datos locales
  }
}

async function cargarTelasDesdeAPI() {
  try {
    const telas = await API.telas.getAll();
    return telas;
  } catch (error) {
    console.error("Error al cargar telas desde API:", error);
    return config.telas || []; // Fallback a datos locales
  }
}

// Exportar funciones de carga de datos
window.cargarHilosDesdeAPI = cargarHilosDesdeAPI;
window.cargarTelaresDesdeAPI = cargarTelaresDesdeAPI;
window.cargarTelasDesdeAPI = cargarTelasDesdeAPI;