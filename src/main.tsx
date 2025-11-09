import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './styles/global.css';
import "primereact/resources/themes/lara-light-blue/theme.css"; // You can change theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
// PrimeReact theme (choose one)
import 'primereact/resources/themes/lara-light-blue/theme.css';

// PrimeReact core
import 'primereact/resources/primereact.min.css';

// PrimeIcons
import 'primeicons/primeicons.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
