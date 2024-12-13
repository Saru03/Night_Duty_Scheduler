// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo color for primary elements
    },
    secondary: {
      main: '#F59E0B', // Amber color for secondary elements
    },
    error: {
      main: '#F44336', // Red for error messages
    },
    background: {
      default: '#F3F4F6', // Light grey background color for the app
    },
    text: {
      primary: '#1F2937', // Dark text color for readability
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    // You can define more typography variants here
  },
});

export default theme;
