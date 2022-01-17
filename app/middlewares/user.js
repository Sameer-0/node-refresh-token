const {
    RedisStore,
    redisClient,
    session
} = require('../../config/redis')


module.exports = {
    
    isLoggedIn: (req, res, next) => {

        console.log('res.sessionID====>>>>> ', req.sessionID)

        let sessionId = req.sessionID;
        let store = new RedisStore({
            client: redisClient,
            ttl: 260
        })
        
        store.get(sessionId, async (err, result) => {
            console.log('result::::::::::::::::::>> ',err, result, sessionId)
            if (!result) {
                res.redirect('/user/login')
            } else {
                next();
            }
        })
    }
}