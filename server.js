const express = require('express');
const app = express();
require('dotenv').config()
const http = require('http');
//const https = require("https");
const {
    existsSync,
    mkdirSync,
    accessSync,
    readFileSync,
    constants,
    appendFile
} = require('fs');

const session = require('express-session')
const redis = require('redis')

const RedisStore = require('connect-redis')(session)
//const redisClient = redis.createClient();
const redisClient = redis.createClient(6379, "127.0.0.1");
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connection established.'));

app.use(express.json());
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    session({
        store: new RedisStore({
            client: redisClient,
            ttl: 260
        }),
        saveUninitialized: true,
        secret: process.env.COOKIE_SECRET,
        resave: false,
        name: 'token',
        cookie: {
            secure: false,
            maxAge: 1000 * 5,
            httpOnly: false,
            domain: 'localhost',
            sameSite: true,
        }
    })
)


app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('No session found!')) // handle error
    }
    next() // otherwise continue
})


//test router
app.use('/test', (req, res, next) => {
    res.send('Hello World!!!')
})






app.listen(process.env.APP_PORT, () => console.log('Server started at port: ', process.env.APP_PORT))