import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'  // <-- HashRouter ici
import './index.css'

// ✅ Enregistrement automatique du Service Worker via vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'
registerSW()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />  {/* App n'a plus de Router */}
    </HashRouter>
  </React.StrictMode>
)
