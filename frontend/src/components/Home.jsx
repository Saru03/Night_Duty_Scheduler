import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent">
      <div
        style={{
          width: '800px',
          height: '500px',         
          padding: '48px',         
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',  
          borderRadius: '16px',
          display: 'flex',         
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',    
          textAlign: 'center',     
        }}
        className='bg-indigo-50'
      >
        <h1 className="text-4xl mb-6">Welcome to the Night Duty Scheduler App!!</h1> 
        <div>
          <Button variant="contained" size="large">
            <Link to="/register" style={{ textDecoration: 'none' }}> 
              <button className='text-xl'>Register</button>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
