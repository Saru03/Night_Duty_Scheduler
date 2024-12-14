const mongoose = require('mongoose')
const {Schema} = mongoose
const User = require('./user')

const doctorSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    blockedDates:{
        type:[String],
        default:[],
    },
    
    weekendDuties:{
        type:Number,
    },
    lastDutyDate:{
        type:Date
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:User
    }
})

module.exports = mongoose.model("Doctors",doctorSchema)