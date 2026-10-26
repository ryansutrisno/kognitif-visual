import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { saveSessionRecord } from './lib/db'
import { setSessionSaver } from './features/session/store'
import './styles/index.css'

// Store sesi tidak tahu soal IndexedDB; penyimpanannya disuntikkan di sini.
setSessionSaver(saveSessionRecord)

const container = document.getElementById('root')
if (!container) {
  throw new Error('Elemen #root tidak ditemukan')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
