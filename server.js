const express = require('express');
const app = express();
require('dotenv').config()
const http = require('http');
const path = require('path');
//const https = require("https");
const {
    existsSync,
    mkdirSync,
    accessSync,
    readFileSync,
    constants,
    appendFile
} = require('fs');

//redis
const {
    RedisStore,
    redisClient,
    session
} = require('./config/redis')

//ROUTERS
const loginRouter = require('./app/routers/login')
const userRouter = require('./app/routers/user')
const homeRouter = require('./app/routers/home')

app.use(express.json());
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static('./public'));
app.set('views', './app/views');
app.set('view engine', 'ejs');

app.use(
    session({
        store: new RedisStore({
            client: redisClient,
            ttl: 260
        }),
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        resave: false,
        name: 'token',
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 30,
            httpOnly: false,
            domain: 'localhost',
            sameSite: true,
        }
    })
)


app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('No session found!')) // handle error
    }
    next() // otherwise continue
})


//test router
app.use('/login', isLoggedIn, loginRouter)

app.get('/logout', (req, res, next) => {
    req.session.destroy(function (err) {
        res.redirect('/login')
    })
})

app.use('/user', userRouter)
app.use('/', homeRouter)



let store = new RedisStore({
    client: redisClient,
    ttl: 260
})



function isLoggedIn(req, res, next) {
    let sessionId = req.sessionID;

    store.get(sessionId, async (err, result) => {

        if (result) {
            console.log('Hello')
            res.send('Redirecting to dashboard! Already logged in')
        } else {
            console.log('World')
            next();
        }

    })




}



app.listen(process.env.APP_PORT, () => console.log('Server started at port: ', process.env.APP_PORT))