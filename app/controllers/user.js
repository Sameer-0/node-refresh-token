
const saltRounds = 10;
const hash = require('../utils/hash')
const User = require('../models/User');
const res = require('express/lib/response');
const {
    RedisStore,
    redisClient
} = require('../../config/redis')

const {
    body,
    validationResult
} = require('express-validator');

let store = new RedisStore({
    client: redisClient,
    ttl: 260
})



const {
    request
} = require('express');
const e = require('express');


module.exports = {

    userLogin: (req, res, next) => {

        res.render('login.ejs')
    },

    userRegister: (req, res, next) => {
        res.render('register.ejs')
    },

    registerUser: (req, res, next) => {
        // const hash = bcrypt.hashSync(req.body.password, saltRounds);
        // req.body.password = hash


        hash.hashPassword(req.body.password).then(result=>{
            console.log('PAss:>:::',result)

           req.body.password = result
           console.log('haspass', result)

           
    
            User.addUser(req.body)
            res.redirect('/user/register')
        })

        
    },


    getProfile: (req, res, next) => {
        User.fetchAll()
            .then(result => {
                // console.log(result)
                res.render("user.ejs", {
                    userList: result.recordset
                })
            }).catch(err => {
                console.log(err)
            })

    },
    getUserById: (req, res, next) => {
        User.fetchUserById(req.body.id).then(result => {
            res.json({
                status: 200,
                message: 'User details are ready.',
                userData: result.recordset
            })
        })
    },

    updateUser: (req, res, next) => {

        User.updateUserById(req.body).then(result => {
            res.json({
                status: 200,
            })
        })
    },

    addUser: (req, res, next) => {
        // console.log('reqBody', req.body)

        User.addUser(req.body)
        res.json({
            status: 200,
            message: 'Ok'
        })
    },

    deleteUser: (req, res, next) => {

        console.log('reqBodyId', req.body.id)
        User.deleteUser(req.body.id).then(result => {
            res.json({
                status: 200,
                message: 'delete successfully',
            })
        })
    },

    authenticate: (req, res, next) => {

console.log('REQQ::::::::::',req)
const{username, password} = req.body
       req.session.username = username
       req.session.password = password
       console.log('REQQ1::::::::::',req.body)
    
        console.log("REQ::::::::>>", req.sessionID)
        User.findByUserName(req.body.username).then(result => {
            let userinfo = result.recordset[0]
            console.log('userinfo::::>>', userinfo)
            if (userinfo == undefined) {
                // console.log('Please register..')
                res.send('User does not exist...')
            }


            let access = hash.verify(req.body.password, userinfo.password)
            if (access) {
                res.redirect("/user/dashboard")
            } else {
                console.log('Not Match')
            }

        }).catch(err => {
            console.log("Error::::::::::::::", err)
        })
    },

    dashboard: (req, res, next) => {
        console.log('Dash', req.session)
        res.render('dashboard.ejs', {
            username: req.session.username
        })
    }

}

