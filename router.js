const router  =  require("express").Router();
function setRouter(app){
    const homeRouter = require("./app/routers/home")
    const userRouter = require("./app/routers/user")
    const loginRouter = require("./app/routers/login")
    app.use('/',homeRouter)
    app.use('/user',userRouter)
    app.use('/user/login',loginRouter)
}

module.exports = setRouter