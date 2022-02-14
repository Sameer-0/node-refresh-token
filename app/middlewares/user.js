const {
    RedisStore,
    redisClient,
    session
} = require('../../config/redis')

let store = new RedisStore({
    client: redisClient,
    ttl: 260
})

module.exports = {

    isLoggedIn: (req, res, next) => {
        let sessionId = req.sessionID;
        console.log('sessionId====>>>>> ', sessionId)

        if (req.sessionID) {
            store.get(req.sessionID, async (err, result) => {
                console.log('result::::::::::::::::::>> ', err, result)
                if (!result) {
                 //   res.redirect('/user/login')
                    next();
                } else {
                    next();
                }
            })
        } else {
            res.redirect('/user/login')
        }
    }
}