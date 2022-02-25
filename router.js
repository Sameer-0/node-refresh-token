const router = require("express").Router();
const {
    isLoggedIn
} = require("./app/middlewares/user")

const Management =  require('./app/routers/management/index')
const AdminRoute =  require('./app/routers/admin/index')

function setRouter(app) {
    const homeRouter = require("./app/routers/home")
    const userRouter = require("./app/routers/user")

    //Managemnt Router 
     Management(app)

     //Admin Router
     AdminRoute(app)
    app.use('/user', userRouter)
 
    app.use('/', homeRouter)
}


module.exports = setRouter