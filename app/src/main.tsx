import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Las fuentes se empaquetan con la app en vez de pedirlas a un CDN: la
// aplicacion tiene que verse igual sin conexion en el stand de la feria.
import './styles/fonts.css'
import './styles/theme.css'

import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el elemento #root')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
