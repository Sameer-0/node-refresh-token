const router = require("express").Router();
const {
    isLoggedIn
} = require("./app/middlewares/user")

function setRouter(app) {
    const homeRouter = require("./app/routers/home")
    const userRouter = require("./app/routers/user")
    const building = require("./app/routers/management/building")
    const campus = require("./app/routers/management/campus")
    const organization = require("./app/routers/management/organization")
    const dashboard = require('./app/routers/management/dashboard')
    const slug = require('./app/routers/management/slug')
    const academic = require('./app/routers/management/academic')
    const slotInterval = require('./app/routers/management/slotInterval')
    const room = require('./app/routers/management/room')
    const booking = require('./app/routers/management/booking')
    const todos = require('./app/routers/management/todos')
    const divisions = require('./app/routers/management/divisions')
    const program = require('./app/routers/management/program')

    app.use('/', homeRouter)
    app.use('/user', userRouter)
    app.use('/management/', isLoggedIn, building)
    app.use('/management/', isLoggedIn, campus)
    app.use('/management/', isLoggedIn, organization)
    app.use('/management/', isLoggedIn, dashboard)
    app.use('/management/', isLoggedIn, slug)
    app.use('/management/', isLoggedIn, academic)
    app.use('/management/', isLoggedIn, slotInterval)
    app.use('/management/', isLoggedIn, room)
    app.use('/management/', isLoggedIn, booking)
    app.use('/management/', isLoggedIn, todos)
    app.use('/management/', isLoggedIn, divisions)
    app.use('/management/', isLoggedIn, program)
    //app.use('/management', isLoggedIn,  management)
}


module.exports = setRouter