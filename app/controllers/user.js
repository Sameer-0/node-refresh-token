// const saltRounds = 10;
const express = require('express')
const session = require('express-session')
const {
    v4: uuidv4
} = require('uuid');
const {
    hashPassword,
    verifyPassword
} = require('../utils/hash')
const User = require('../models/User');
// const res = require('express/lib/response');


const {
    RedisStore,
    redisClient
} = require('../../config/redis')


const {
    body,
    validationResult
} = require('express-validator');
const hash = require('../utils/hash');

let store = new RedisStore({
    client: redisClient,
    ttl: 260
})


module.exports = {

    renderLoginPage: (req, res, next) => {
        res.render('login.ejs')
    },

    renderRegisterPage: (req, res, next) => {
        res.render('register.ejs')
    },

    registerUser: (req, res, next) => {
        // const hash = bcrypt.hashSync(req.body.password, saltRounds);
        // req.body.password = hash
        hash.hashPassword(req.body.password).then(result => {
            console.log('PAss:>:::', result)
            req.body.password = result
            console.log('haspass', result)
            User.addUser(req.body)
            res.redirect('/user/register')
        })


    },


    getProfile: (req, res, next) => {
        User.fetchUserById('session se id nikalo')
            .then(result => {
                // console.log(result)
                res.render("/management/room/index.ejs", {
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

    authenticate: async (req, res, next) => {

        User.getUserByUsername(req.body.username, res.locals.slug).then(result => {
            console.log('result.recordset:::::::::::::>>>', result.recordset)
            if (result.recordset.length > 0) {
                console.log('result.recordset:::::::::::::1>>>', result.recordset)
                verifyPassword(req.body.password, userData.password).then(result => {
                    console.log('result:::::::::::>>>>',result)
                })

                // if (isVerified) {
                //     req.session.username = userData.username;
                //     req.session.firstName = userData.f_name;
                //     req.session.lastName = userData.l_name;
                //     req.session.email = userData.email;

                //     if (userData.role == "management") {
                //         res.redirect('/management/dashboard')
                //     } else if (userData.role == "admin") {
                //         res.redirect('/admin/dashboard')
                //     } else {
                //         res.redirect('404')
                //     }

                // } else {
                //     res.redirect('/user/login')
                // }
            } else {
                res.send('User not exit..!')
            }

        }).catch(error => {
            res.send('User not exit..!')
        })




    },

    dashboard: (req, res, next) => {
        console.log('Dash', req.session)
        res.render('dashboard.ejs', {
            username: req.session.username
        })
    },

    logout: (req, res) => {
        console.log('Logout:::::::::>>>')
        res.redirect('/')
    }

}