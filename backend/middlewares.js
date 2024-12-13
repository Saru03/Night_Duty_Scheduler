const Doctors = require('./models/doctors')
const {doctorsJoiSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const User = require('./models/user')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; 
        return res.redirect('/login');
    }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateDoctor=(req,res,next)=>{
    const {error}=doctorsJoiSchema.validate(req.body);
    console.log(req.body);
    if(error){
        const msg=error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}