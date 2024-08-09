import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './Components/App/App.tsx'
import Three from './Components/Threejs/Threejs.tsx';
import Login from './Components/Login/Login.tsx';
import Joguinhos from './Components/Joguinhos/Joguinhos.tsx';

const router = createHashRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/three",
    element: <Three/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/joguinhos",
    element: <Joguinhos/>,
  },
]);

const changeBackgroundColor = (colorScheme: 'light' | 'dark') => {document.getElementsByTagName('body')[0].style.backgroundColor = colorScheme === 'light' ? "white" :  "white";}// TODO GET BETTER DARK MODE "rgb(45, 45, 45)";}

changeBackgroundColor(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' :'dark')

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event: MediaQueryListEvent) => {
  const colorScheme = event.matches ? 'light' : 'dark';
  changeBackgroundColor(colorScheme);
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
