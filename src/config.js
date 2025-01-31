// Definir primero el objeto config
const config = {
    apiUrl: 'http://34.201.84.3',
  };
  
  // Luego, usar la propiedad apiUrl de config para definir REACT_APP_API_URL
  const REACT_APP_API_URL = config.apiUrl;
  
  export default config;