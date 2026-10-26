import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/index.css'

// Store sesi menyimpan sendiri (lazy-load Dexie saat dipanggil) — tidak perlu
// wiring di sini, jadi hot-reload tidak bisa mematikan penyimpanan.

const container = document.getElementById('root')
if (!container) {
  throw new Error('Elemen #root tidak ditemukan')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
