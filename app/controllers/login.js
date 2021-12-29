
const {RedisStore, redisClient} = require('../../config/redis')

let store = new RedisStore({
    client: redisClient,
    ttl: 260
})


module.exports = {

    login: (req, res, next) => {

        if (req.method === 'GET') {
            res.render('index')
        }

        else if(req.method === 'POST') {
            console.log(req.sessionID)
            console.log(req.session.name)

            req.session.username = req.body.username
            req.session.email = 'bkapilsharma@gmail.com'
            req.session.fName = 'Kapil'
   
            store.get(req.sessionID, async function(err, data){
                let result = await data;
                console.log('Data: ', result)
            })
            res.redirect('/login')

        }

    }

}