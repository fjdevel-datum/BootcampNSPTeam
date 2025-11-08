import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './context/AuthContext'
import router from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('ViaticosDatum esta listo sin conexion.')
  },
  onNeedRefresh() {
    console.info('Hay una actualizacion disponible para ViaticosDatum.')
  }
})
