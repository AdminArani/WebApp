import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import config from './config';
import { installHttp405Handler } from './httpError405Handler';

// Seguridad: en producción, evita exponer información sensible en consola.
if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.console) {
  window.console.info = () => {};
  window.console.debug = () => {};
  window.console.warn = () => {};
  window.console.error = () => {};
}
installHttp405Handler({
  supportEmail: config.supportEmail
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
    <App />
  </React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
