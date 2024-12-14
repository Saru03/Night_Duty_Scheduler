const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Doctors = require('../models/doctors')
const{isLoggedIn}=require('../middlewares')
const NightDutyScheduler = require('../public/javascripts/generateSchedule');

router.post('/doctorsinfo', isLoggedIn, async (req, res) => {
    console.log("POST request received at /doctorsinfo");
    try {
        const doctorsData = req.body;
        const userId = req.user._id;  
        const doctorsWithUserId = doctorsData.map(doctor => ({
            ...doctor,
            author: userId  
        }));
        
        await Doctors.insertMany(doctorsWithUserId);
        res.status(201).json({ message: 'Doctors added successfully' });
    } catch (error) {
        console.error("Error saving doctors:", error);
        res.status(500).json({ message: 'Error saving doctors', error: error.message, stack: error.stack });
    }
});

router.post('/schedule',isLoggedIn,async (req,res)=>{
    const {selectedMonth,selectedYear,dutiesPerDay} = req.body;
    const userId = req.user._id;
    try{
        const doctors = await Doctors.find({author:userId}).exec()
        // console.log("fetched doctors:",doctors)
        const scheduler = new NightDutyScheduler(doctors,selectedMonth,selectedYear,dutiesPerDay);
        const schedule = await scheduler.generateSchedule();
        // console.log(schedule)
        return res.status(201).json({message:"Generated schedule successfully",schedule});
    }
    catch(err){
        console.log("no schedule mann")
        return res.status(400).json({error:"Failed to generate a schedule"});
    }
})

router.get('/doctors',isLoggedIn, async (req,res)=>{
    const userId = req.user._id;
    try{
        const existingDoctors = await Doctors.find({author:userId}).exec()
        // console.log(existingDoctors)
        return res.status(201).json({message:"Fetched Existing doctors successfully",existingDoctors})
    }
    catch(err){
        console.error("Error fetching doctors:", err);
        return res.status(400).json({error:"No existing doctors"})
    }
})



module.exports = router