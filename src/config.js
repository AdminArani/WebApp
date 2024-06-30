// Definir primero el objeto config
const config = {
    apiUrl: 'https://app.arani.hn',
  };
  
  // Luego, usar la propiedad apiUrl de config para definir REACT_APP_API_URL
  const REACT_APP_API_URL = config.apiUrl;
  
  export default config;