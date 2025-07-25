import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Joguinhos from './Joguinhos.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const router = createBrowserRouter([ // Use createHashRouter for hash-based routing
  { 
    path: '/joguinhos/:game?', 
    element: <Joguinhos />,
    
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

