const db = require('../../config/db')
const redis = require('../../config/redis')
const User = require('../models/User')


module.exports = {

    getProfile: (req, res, next) => {
        User.fetchAll()
        .then(result => {
            res.render('dsad', {asdasd})
        })

    }
}