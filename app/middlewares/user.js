const {
    RedisStore,
    redisClient,
    session
} = require('./redis')





module.exports = {

    
    isLoggedIn(req, res, next) {
        let sessionId = req.sessionID;
        let store = new RedisStore({
            client: redisClient,
            ttl: 260
        })
        
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
}