// Definir primero el objeto config
const config = {
    apiUrl: process.env.REACT_APP_API_URL, // Solo usa el valor del .env
    supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'soporte@arani.hn',
};

if (!config.apiUrl) {
    throw new Error('La variable de entorno REACT_APP_API_URL no está definida.');
}

export default config;