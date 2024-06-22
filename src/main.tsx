import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App/App.tsx'
import Three from './Threejs/Threejs.tsx';

const router = createHashRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/three",
    element: <Three/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
