import axios from 'axios';

// Definir primero el objeto config
const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  // Solo usa el valor del .env
  supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'soporte@arani.hn'
};
if (!config.apiUrl) {
  throw new Error('La variable de entorno REACT_APP_API_URL no está definida.');
}

// Configurar timeouts globales razonables para axios
// Aumentado a 60 segundos para permitir endpoints lentos
// pero detectar errores de conexión real
axios.defaults.timeout = 60000; // 60 segundos

export default config;
