import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

// Asegúrate de que el elemento con id 'root' existe y no es null
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se encontró el elemento con id 'root'");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si deseas medir el rendimiento
reportWebVitals();
