import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function Register() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((currData) => ({
      ...currData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    try {
      const res = await axios.post('http://localhost:3000/login', { username, password }, { withCredentials: true });
      setMessage(res.data.message);
      navigate('/scheduler/doctorsinfo');
    } catch (err) {
      setMessage(err.response?.data?.message || "Incorrect username or password");
    }
  };
  const handleRegister = async () => {
    navigate('/register')
  }

  const card = (
    <CardContent>
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <TextField
          type="text"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          name="username"
          variant="outlined"
          fullWidth
        />
        <TextField
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          name="password"
          variant="outlined"
          fullWidth
        />
        <Button type="submit" variant="contained" className="bg-blue-500 hover:bg-indigo-600 text-white">
          Login
        </Button>
      </form>
      {message && <p><Alert severity="error">{message} </Alert></p>}
    </CardContent>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ width: '100%' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
            Night Duty Scheduler
          </Typography>
          <Button onClick={handleRegister} className="bg-white text-black px-4 py-2" variant="filled">
            Register
          </Button>

        </Toolbar>
      </AppBar>
      <div className="flex justify-center items-center min-h-screen bg-indigo-50">
        <Card className="w-full max-w-md p-4 shadow-lg">{card}</Card>
      </div>
    </>
  );
}

export default Register;