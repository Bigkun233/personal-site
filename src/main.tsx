// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './home.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter：任意静态托管（GitHub Pages / CloudBase 等）刷新深层路由都不 404，零配置 */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
