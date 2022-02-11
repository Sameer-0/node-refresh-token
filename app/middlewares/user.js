const {
    RedisStore,
    redisClient,
    session
} = require('../../config/redis')


module.exports = {

    isLoggedIn: (req, res, next) => {
        console.log('res.sessionID====>>>>> ', req.cookies.token)

        let sessionId = req.sessionID;
        let store = new RedisStore({
            client: redisClient,
            ttl: 260
        })

        if (req.cookies.token) {
            store.get(req.cookies.token, async (err, result) => {
                console.log('result::::::::::::::::::>> ', err, result)
                if (!result) {
                    res.redirect('/user/login')
                } else {
                    next();
                }
            })
        } else {
            res.redirect('/user/login')
        }
    }
}