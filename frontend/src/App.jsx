import './App.css';
import Register from "./components/Register"
import Login from "./components/Login"
import Schedule from './components/Schedule';
import DoctorsInfo from './components/DoctorsInfo'
import Home from './components/Home'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';


function App() {
  const router = createBrowserRouter([
    {
      path:'/',
      element:<Home/>

    },
    {
      path:'/register',
      element:<Register/>

    },
    {
      path:'/login',
      element:<Login/>
    },
    {
      path:'/scheduler/doctorsinfo',
      element:<DoctorsInfo/>
    },
    {
      path:'/scheduler/schedule',
      element:<Schedule/>
    }

  ])
  return (
    <>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
      
    </>
  );
}

export default App;


