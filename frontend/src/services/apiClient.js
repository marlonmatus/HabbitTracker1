const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Cliente HTTP base para conectarse con FastAPI.
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw new Error(data.message || data.detail || 'Ha ocurrido un error inesperado');
    }
    
    return data;
  } catch (error) {
    // Si la conexión falla (ej. Backend apagado), logueamos pero lanzamos el error
    // para que el Service Layer pueda interceptarlo y proveer datos Mock si lo deseamos.
    console.warn(`[API] Connection failed to ${endpoint}:`, error.message);
    throw error;
  }
}
