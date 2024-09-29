import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import Joguinhos from './Joguinhos.tsx'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Three from './Threejs/Threejs.tsx'
import Login from './Login/Login.tsx'

const router = createHashRouter([
  {
    path: '/',
    element:<Joguinhos/>
  },
  {
    path: '/cubo',
    element: <Three/>
  },
  {
    path: '/login',
    element: <Login/>
  }
])
const rootElement = document.getElementById("root");

if (rootElement?.hasChildNodes) {
  hydrateRoot(rootElement, <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,)
} else createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

