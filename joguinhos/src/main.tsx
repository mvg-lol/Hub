import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Joguinhos from './Joguinhos.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Joguinhos />
  </StrictMode>,
)
