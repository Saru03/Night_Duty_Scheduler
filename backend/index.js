if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express')
const app = express()
const cors = require('cors')
const passport = require('passport')
const path = require('path')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const User = require('./models/user')
const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')
const schedulerRoutes = require('./routes/duty')
const userRoutes = require('./routes/users')
const port = process.env.PORT || 4000;
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: 'https://night-duty-scheduler.onrender.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
const dbUrl = process.env.DB_URL
// 'mongodb://127.0.0.1:27017/nds2'
mongoose.connect(dbUrl)
const _dirname = path.resolve()


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'sadjkmcl'
    }

})

store.on("error", function (err) {
    console.log("Error storing", err);
})
const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: app.get('env') === 'production' ? true : false,
        sameSite: 'none', 
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
};
app.use(session(sessionConfig))

app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use('/', userRoutes)
app.use('/scheduler', schedulerRoutes)

app.use(express.static(path.join(_dirname, '/frontend/dist')))
app.get('*', (_, res) => {
    res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


