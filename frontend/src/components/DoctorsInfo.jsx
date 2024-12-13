import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DatePicker from "react-multi-date-picker";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

function DoctorsInfo() {
    const [value, setValue] = useState(new Date());
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [doctors, setDoctors] = useState([
        { name: '', blockedDates: [] }
    ]);
    const [dutiesPerDay, setDutiesPerDay] = useState('');
    const [schedule, setSchedule] = useState([]);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [existingDoctors, setExistingDoctors] = useState([]);
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: 2030 - 2024 + 1 },
        (_, index) => 2024 + index
    );


    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('http://localhost:3000/checkSession', {
                    withCredentials: true 
                });
                if (response.data.loggedIn) {
                    setIsLoggedIn(true);
                } else {
                    navigate('/login');
                }
            } catch (err) {
                console.error('Session check error:', err);
                navigate('/login');
            }
        };

        checkSession();
    }, [navigate]);


    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const addDoctor = () => {
        const newDoctor = { name: '', blockedDates: [] };
        setDoctors([...doctors, newDoctor]);
    };

    const removeDoctor = (indexToRemove) => {
        setDoctors(doctors.filter((_, index) => index !== indexToRemove));
    };

    const updateDoctor = (index, field, value) => {
        const updatedDoctors = [...doctors];
        if (field === 'name') {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        updatedDoctors[index][field] = value;
        setDoctors(updatedDoctors);
    };

    const generateSchedule = async () => {
        if (doctors.some(doctor => !doctor.name.trim())) {
            setMessage("Please ensure all doctors have a name before generating the schedule.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:3000/scheduler/schedule', { selectedMonth, selectedYear, dutiesPerDay }, { withCredentials: true });
            const scheduleData = response.data.schedule
            setMessage(response.data.message)
            setSchedule(scheduleData)
            navigate('/scheduler/schedule', { state: { schedule: scheduleData, selectedMonth, selectedYear } })

        }
        catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred')
        }
    };

    const addAllDoctors = async () => {
        if (doctors.some(doctor => !doctor.name.trim())) {
            setMessage("Please ensure all doctors have a name before saving.");
            return;
        }
        try {
            console.log("Sending doctors data:", doctors);
            const res = await axios.post('http://localhost:3000/scheduler/doctorsinfo', doctors, { withCredentials: true });
            setMessage(res.data.message);
        } catch (err) {
            console.error("Error adding doctors:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'An error occurred');
        }
    };


    const logout = async () => {
        try {
            await axios.get('http://localhost:3000/logout', {}, { withCredentials: true })
            navigate('/login')
        }
        catch (err) {
            setMessage(err.response?.data?.message || 'An error occured during logout')
        }
    }

    const handleLogin = async () => {
        navigate('/login')
    }

    useEffect(() => {
        const fetchExistingDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/scheduler/doctors', { withCredentials: true })
                setExistingDoctors(response.data.existingDoctors);
                setDoctors(response.data.existingDoctors)
                console.log(response.data.existingDoctors)
            } catch (err) {
                console.error("Error fetching existing doctors:", err);
                setMessage(err.response?.data?.message || 'An error occurred while fetching doctors');
            }
        }
        fetchExistingDoctors();
    }, []);

    const populateExistingDoctors = () => {
        if (existingDoctors.length > 0) {
            setDoctors(existingDoctors.map(doctor => ({
                name: doctor.name,
                blockedDates: doctor.blockedDates || []
            })));
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ width: '100%' }}>
                <Toolbar>

                    <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                        Night Duty Scheduler
                    </Typography>
                    {isLoggedIn ? (
                        <Button color="inherit" onClick={logout}>Logout</Button>
                    ) : (
                        <Button color="inherit" onClick={handleLogin}>Login</Button>
                    )}

                </Toolbar>
            </AppBar>

            <div className='min-h-screen bg-indigo-50 p-6 m-5'>
                {message && (
                    <div className='m-4'>
                        <Alert
                            severity="warning"
                            onClose={() => setMessage('')}
                            className='mb-4'
                        >
                            {message}
                        </Alert>
                    </div>
                )}

                <Card className="max-w-4xl mx-auto mb-6">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Existing Doctors
                        </Typography>
                        <div className="flex space-x-4 items-center">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={populateExistingDoctors}
                                disabled={existingDoctors.length === 0}
                            >
                                Load Existing Doctors
                            </Button>
                            {existingDoctors.length > 0 && (
                                <Typography variant="body2">
                                    {existingDoctors.length} doctors available
                                </Typography>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="max-w-4xl mx-auto" sx={{ padding: 0, paddingBottom: '82px' }}>

                    <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        className="bg-indigo-500 text-white text-2xl font-bold p-2 m-0"

                    >
                        Doctors Information
                    </Typography>
                    <CardContent className='p-8'>
                        <div className="space-y-6">
                            {doctors.map((doctor, index) => (
                                <div key={index} className="relative p-4 border rounded-md">
                                    {doctors.length > 1 && (
                                        <button
                                            onClick={() => removeDoctor(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                            title="Remove Doctor"
                                        >
                                            <DeleteOutlinedIcon />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor={`doctor-name-${index}`}
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Doctor Name
                                            </label>
                                            <input
                                                id={`doctor-name-${index}`}
                                                value={doctor.name}
                                                onChange={(e) => updateDoctor(index, 'name', e.target.value)}
                                                placeholder="Enter doctor's full name"
                                                className="w-full border rounded p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Blocked Dates
                                            </label>
                                            <DatePicker
                                                multiple
                                                value={doctor.blockedDates}
                                                onChange={(dates) => updateDoctor(index, 'blockedDates', dates)}

                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center">
                                <Button
                                    onClick={addDoctor}
                                    variant="outlined"
                                    className="border-indigo-500 text-indigo-500 hover:bg-indigo-100"
                                >
                                    + Add Another Doctor
                                </Button>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <Button
                                    onClick={addAllDoctors}
                                    variant='contained'
                                >
                                    Save the Doctors :)
                                </Button>

                            </div>

                        </div>
                    </CardContent>
                </Card>
                <Card className="max-w-4xl mx-auto m-8 p-4">
                    <p className='font-semibold text-3xl p-3'>
                        Select the month and year of the schedule to be generated
                    </p>
                    <div className="flex space-x-4">

                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="p-2 border rounded"
                        >
                            {months.map((month, index) => (
                                <option key={month} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>


                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="p-2 border rounded"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>


                        <input
                            type="number"
                            placeholder="Duties Per day"
                            value={dutiesPerDay}
                            onChange={(e) => setDutiesPerDay(e.target.value)}
                            className="p-2 border rounded"
                        />
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Button
                            onClick={generateSchedule}
                            variant='contained'
                        >
                            Generate Schedule
                        </Button>
                    </div>

                </Card>
                {message && <p><Alert severity="error">{message} </Alert></p>}
            </div>

        </>
    );
}

export default DoctorsInfo;
