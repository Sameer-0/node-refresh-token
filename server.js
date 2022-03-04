const express = require('express');
const app = express();
require('dotenv').config()
const http = require('http');
const path = require('path');
const setRouter = require("./router")
const {
    verifySubdomain
} = require('././app/middlewares/domain')
const {
    v4: uuidv4
} = require('uuid');
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
        genid: function (req) {
            return uuidv4() // use UUIDs for session IDs
        },
        secret: process.env.COOKIE_SECRET,
        resave: false,
        name: 'token',
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 30,
            httpOnly: false,
            sameSite: false,
            path: '/'
        }
    })
)

app.use('/set-token', (req, res) => {
    req.session.name = "Kapil Sharma"
    res.send('Token set')
})




app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('No session found!')) // handle error
    }
    next() // otherwise continue
})

app.use(verifySubdomain);


setRouter(app)


app.use(function(req, res){
    res.status(404).render('404')
})


app.listen(process.env.APP_PORT, () => console.log('Server started at port: ', process.env.APP_PORT))