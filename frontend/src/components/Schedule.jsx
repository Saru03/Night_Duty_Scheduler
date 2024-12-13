import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const localizer = momentLocalizer(moment);

const ScheduleCalendar = ({ schedule, selectedMonth, selectedYear }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (schedule) {
            const eventList = mapScheduleToEvents(schedule, selectedYear, selectedMonth);
            setEvents(eventList);
        }
    }, [schedule, selectedYear, selectedMonth]);

    const mapScheduleToEvents = (schedule, year, month) => {
        if (!Array.isArray(schedule)) {
            console.error("Schedule is not an array:", schedule);
            return []; 
        }
    
        const events = [];
    
        schedule.forEach(daySchedule => {
            const date = moment(daySchedule.date);
            if (date.year() === year && date.month() === month - 1) {
                if (daySchedule.doctors && daySchedule.doctors.length > 0) {
                    daySchedule.doctors.forEach(doctor => {
                        events.push({
                            title: doctor, 
                            start: date.startOf('day').toDate(),
                            end: date.endOf('day').toDate(),
                            allDay: true,
                        });
                    });
                }
            }
        });
    
        return events;
    };
    
    const eventStyleGetter = () => {
        const style = {
            backgroundColor: '#f3f4f6',
            color: '#000000',
            borderRadius: '5px',
            opacity: 0.9,
            padding: '2px 5px',
            fontSize: '14px',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
        };
        return {
            style: style
        };
    };

    const defaultDate = moment([selectedYear, selectedMonth - 1, 1]).toDate();
    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultDate={defaultDate}
                style={{ height: 870 }}
                eventPropGetter={eventStyleGetter}
                className="bg-gray-100 border border-gray-300 shadow-md rounded-lg m-4"
                components={{
                    event: ({ event }) => (
                        <span className="text-lg font-normal text-medium">{event.title}</span>
                    ),
                    toolbar: ({ label }) => (
                        <div className="p-2 bg-indigo-500 text-white text-center font-bold">{label}</div>
                    ),
                }}
                views={['month']}
                showMultiDayTimes={true}   
                eventLimit={0}  
            />
        </div>
    );
};

const Schedule = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { schedule, selectedMonth, selectedYear } = location.state || {};

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('https://night-duty-scheduler.onrender.com/checkSession', {
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

    const logout = async () => {
        try {
            await axios.get('https://night-duty-scheduler.onrender.com/logout', {}, { withCredentials: true });
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err.response?.data?.message || 'An error occurred during logout');
        }
    };
    

    const handleLogin = async () => {
        navigate('/login')
    }

    console.log('Schedule:', schedule);

    if (!schedule) {
        return <p>No schedule available. Please generate a schedule first.</p>;
    }
   

    return (
        <div className="p-4">
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

            <ScheduleCalendar
                schedule={schedule}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
            />
        </div>
    );
};

export default Schedule;