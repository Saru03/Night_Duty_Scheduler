import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import MUI theming
import CssBaseline from '@mui/material/CssBaseline'; // Normalize default styles
import App from './App.jsx';
import './index.css';

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // Replace with your desired primary color
    },
    secondary: {
      main: '#50E3C2', // Replace with your desired secondary color
    },
    background: {
      default: '#F9F9F9', // Optional: Customize the default background
    },
    text: {
      primary: '#333333', // Customize text color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Customize fonts
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
