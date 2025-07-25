import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

