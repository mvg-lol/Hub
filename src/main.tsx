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
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
