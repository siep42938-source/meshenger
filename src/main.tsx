import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Сброс кэша при обновлении структуры
const CACHE_VERSION = '6'
if (localStorage.getItem('app-version') !== CACHE_VERSION) {
  localStorage.removeItem('meshenger-chats')
  localStorage.removeItem('meshenger-auth')
  localStorage.removeItem('meshenger-theme')
  localStorage.setItem('app-version', CACHE_VERSION)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
