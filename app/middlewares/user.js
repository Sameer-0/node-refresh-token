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
                 console.log('result::::::::::::::::::>> ', err, result)
                if (!result) {

                    res.redirect('/user/login')

                } else {
                    res.locals.userid = result.userid
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
            //   console.log('result::::::::::::::::::>> ', result);

            if (!result) {

                return next();
            }

            if (result.modules.length > 1) {
                return res.redirect('/user/select-dashboard');
            }

            res.redirect(`/${result.modules[0].name}/dashboard`);

        })

    },

    checkPermission: (req, res, next) => {

        // console.log('req.sessionID>>>>>>>>>>>>>> : ', req.sessionID)
        // console.log('endpoint>>>>>>>>>>>>>> : ', req.originalUrl)
        // console.log('method>>>>>>>>>>>>>> : ', req.method)

        let UserPermission = store.get(req.sessionID, async (err, result) => {
            if (result.permissions) {
                console.log('Resulr::::::::::', result.permissions)
                console.log('originalUrl::::::::::', req.Url)
                console.log('originalUrl::::::::::', req._parsedOriginalUrl.pathname)
                for (let permission of result.permissions) {
                    console.log('req.originalUrl', req.originalUrl)

                    //permission.url_path === req.originalUrl && permission.name === req.method
                    if (permission.url_path === req._parsedOriginalUrl.pathname && permission.name === req.method) {
                        return next();
                    }
                }
                return next();//comment this line 
                //res.send('YOU DO NOT HAVE PERMISSION')
            }
        })
    }
}