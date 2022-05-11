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
        // console.log('sessionId is ====>>>>> ', sessionId)

        if (req.sessionID) {
            store.get(req.sessionID, async (err, result) => {
                //  console.log('isLoggedIn::::::::::::::::::>> ', err, result)
                if (!result) {
                    res.redirect('/user/login')
                } else {
                    res.locals.userId = result.userId
                    res.locals.firstName = result.firstName
                    next();
                }
            })
        } else {
            res.redirect('/user/login')
        }
    },

    redirectIfLoggedIn: (req, res, next) => {
        let sessionId = req.sessionID;
        //  console.log('sessionId is ====>>>>> ', sessionId);

        if (!req.sessionID) {
            return next();
        }

        store.get(req.sessionID, async (err, result) => {
            console.log('redirectIfLoggedIn result::::::::::::::::::>> ', result);

            if (!result) {

                return next();
            }

            // if (result.modules.length > 1) {
            //     return res.redirect('/user/select-dashboard');
            // }

            if (result.modules.length > 0) {
                res.redirect(`/${result.modules[0].name}/dashboard`);
            } else {
                res.send('You have no permissions.')
            }

        })

    },

    checkPermission: (req, res, next) => {

        // console.log('req.sessionID>>>>>>>>>>>>>> : ', req.sessionID)
        // console.log('endpoint>>>>>>>>>>>>>> : ', req.originalUrl)
        // console.log('method>>>>>>>>>>>>>> : ', req.method)

        let UserPermission = store.get(req.sessionID, async (err, result) => {
            if (result.permissions) {
                // console.log('Resulr::::::::::', result.permissions)
                // console.log('originalUrl::::::::::', req.Url)
                // console.log('originalUrl::::::::::', req._parsedOriginalUrl.pathname)
                // for (let permission of result.permissions) {
                //     if (permission.url_path === req._parsedOriginalUrl.pathname && permission.name === req.method) {
                //         return next();
                //     }
                // }
                return next(); //comment this line 
                //res.send('YOU DO NOT HAVE PERMISSION')
            }
        })
    }
}