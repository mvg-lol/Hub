import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Joguinhos from './Joguinhos.tsx'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Three from './Threejs/Threejs.tsx'

const router = createHashRouter([
  {
    path: '/joguinhos',
    element:<Joguinhos/>
  },
  {
    path: '/joguinhos/cubo',
    element: <Three/>
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
