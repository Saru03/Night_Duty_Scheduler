const User = require('../models/user')
const express = require('express')
const router = express.Router()
const {storeReturnTo} = require('../middlewares');
const passport = require('passport')

router.post('/register',async (req,res,next)=>{
    try{
        const {username,email,password} = req.body;
        const user = new User({username,email});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,err =>{
            if(err) return next(err);
            return res.status(200).json({message:"Registered successfully"})
        })
    }
    catch(err){
        if(err.name === 'UserExistsError'){
            res.status(400).json({message:"Username already exists"})
        }
        else{
            res.status(500).json({error:"Failed to register"})

        }
       
    }

})

router.post('/login', storeReturnTo, passport.authenticate('local'), (req, res) => {
    const redirectUrl = res.locals.returnTo || '/doctorsinfo';
    res.status(200).json({
        message: "Logged in successfully! Welcome Back!",
        redirectUrl,
        user: {
            id: req.user._id,
            username: req.user.username
        }
    });
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).json({message:"Logged out successfully!"})
    });
}); 

router.get('/checkSession', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ 
            loggedIn: true,
            user: {
                id: req.user._id,
                username: req.user.username
            }
        });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

module.exports = router;