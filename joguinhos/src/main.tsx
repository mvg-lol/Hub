import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Joguinhos from './Joguinhos.tsx'
import { createHashRouter, RouterProvider } from 'react-router-dom'

const router = createHashRouter([
  {
    path: '/:game?',
    element: <Joguinhos/>
  }
])


/*
///! para o caso de mudar o mvg.lol do github pages para outro servidor, usar o browserRouter em vez do hashrouter
const router = createBrowserRouter([ 
  { 
    path: '/joguinhos/:game?', 
    element: <Joguinhos />,
    
  },
])
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

