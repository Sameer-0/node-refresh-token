const router = require("express").Router();
const isLoggedIn = require("./app/middlewares/user")

function setRouter(app) {
    const homeRouter = require("./app/routers/home")
    const userRouter = require("./app/routers/user")
    const loginRouter = require("./app/routers/login")
    const management = require("./app/routers/management/index")
    
    app.use('/', homeRouter)
    app.use('/user', userRouter)
    app.use('/user/login',  loginRouter)
    app.use('/management',  management)
}


module.exports = setRouter