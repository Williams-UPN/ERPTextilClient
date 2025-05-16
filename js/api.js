// js/api.js
// Funciones para comunicarse con la API

const API_URL = 'http://localhost:3000/api';

// Función para hacer peticiones a la API con token de autenticación
async function fetchAPI(endpoint, options = {}) {
  // Obtener token del localStorage
  const token = localStorage.getItem('token');
  
  // Configurar headers con token si existe
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Siempre usar Content-Type: application/json para peticiones con cuerpo
  if (options.body) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };
    
    // Convertir body a JSON string si no es un string
    if (typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    }
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    // Si la respuesta es exitosa pero vacía (ej. 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    // Intentar parsear respuesta como JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error;
  }
}

// Funciones de autenticación
const authAPI = {
  // Login
  async login(username, password) {
    return fetchAPI('/usuarios/login', {
      method: 'POST',
      body: { username, password }
    });
  },
  
  // Verificar si el token es válido
  async verificarToken() {
    try {
      const userData = await fetchAPI('/usuarios/verificar');
      return userData;
    } catch (error) {
      // Limpiar token si no es válido
      localStorage.removeItem('token');
      throw error;
    }
  }
};

// Funciones para hilos
const hilosAPI = {
  // Obtener todos los hilos
  async getAll() {
    return fetchAPI('/hilos');
  },
  
  // Obtener un hilo por ID
  async getById(id) {
    return fetchAPI(`/hilos/${id}`);
  },
  
  // Crear un nuevo hilo
  async create(hiloData) {
    return fetchAPI('/hilos', {
      method: 'POST',
      body: hiloData
    });
  },
  
  // Actualizar un hilo
  async update(id, hiloData) {
    return fetchAPI(`/hilos/${id}`, {
      method: 'PUT',
      body: hiloData
    });
  },
  
  // Eliminar un hilo
  async delete(id) {
    return fetchAPI(`/hilos/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Obtener hilos por estado de stock
  async getByEstadoStock(estado) {
    return fetchAPI(`/hilos/estado/${estado}`);
  },
  
  // Ajustar stock de un hilo
  async ajustarStock(id, cantidad, motivo) {
    return fetchAPI(`/hilos/${id}/ajustar-stock`, {
      method: 'POST',
      body: { cantidad, motivo }
    });
  }
};

// Funciones para telares
const telaresAPI = {
  // Obtener todos los telares
  async getAll() {
    return fetchAPI('/telares');
  },
  
  // Obtener un telar por ID
  async getById(id) {
    return fetchAPI(`/telares/${id}`);
  },
  
  // Crear un nuevo telar
  async create(telarData) {
    return fetchAPI('/telares', {
      method: 'POST',
      body: telarData
    });
  },
  
  // Actualizar un telar
  async update(id, telarData) {
    return fetchAPI(`/telares/${id}`, {
      method: 'PUT',
      body: telarData
    });
  },
  
  // Eliminar un telar
  async delete(id) {
    return fetchAPI(`/telares/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Obtener telares por estado
  async getByStatus(status) {
    return fetchAPI(`/telares/status/${status}`);
  },
  
  // Iniciar producción
  async iniciarProduccion(id, telaId, operarioId) {
    return fetchAPI(`/telares/${id}/iniciar-produccion`, {
      method: 'POST',
      body: { telaId, operarioId }
    });
  },
  
  // Detener producción
  async detenerProduccion(id, motivo) {
    return fetchAPI(`/telares/${id}/detener-produccion`, {
      method: 'POST',
      body: { motivo }
    });
  },
  
  // Registrar mantenimiento
  async registrarMantenimiento(id, fecha, descripcion) {
    return fetchAPI(`/telares/${id}/mantenimiento`, {
      method: 'POST',
      body: { fecha, descripcion }
    });
  },
  
  // Finalizar mantenimiento
  async finalizarMantenimiento(id) {
    return fetchAPI(`/telares/${id}/finalizar-mantenimiento`, {
      method: 'POST'
    });
  }
};

// Funciones para telas
const telasAPI = {
  // Obtener todas las telas
  async getAll() {
    return fetchAPI('/telas');
  },
  
  // Obtener una tela por ID
  async getById(id) {
    return fetchAPI(`/telas/${id}`);
  },
  
  // Crear una nueva tela
  async create(telaData) {
    return fetchAPI('/telas', {
      method: 'POST',
      body: telaData
    });
  },
  
  // Actualizar una tela
  async update(id, telaData) {
    return fetchAPI(`/telas/${id}`, {
      method: 'PUT',
      body: telaData
    });
  },
  
  // Actualizar composición de una tela
  async updateComposicion(id, composicion) {
    return fetchAPI(`/telas/${id}/composicion`, {
      method: 'PUT',
      body: { composicion }
    });
  },
  
  // Eliminar una tela
  async delete(id) {
    return fetchAPI(`/telas/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Obtener composición de una tela
  async getComposicion(id) {
    return fetchAPI(`/telas/${id}/composicion`);
  },
  
  // Calcular consumo de hilos para producir metros de una tela
  async calcularConsumoHilos(id, metros) {
    return fetchAPI(`/telas/${id}/calcular-consumo`, {
      method: 'POST',
      body: { metros }
    });
  }
};

// Exportar todas las APIs
window.API = {
  auth: authAPI,
  hilos: hilosAPI,
  telares: telaresAPI,
  telas: telasAPI
};