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
    app.use('/management/', building)
    app.use('/management/', campus)
    app.use('/management/', organization)
    app.use('/management/', dashboard)
    app.use('/management/', slug)
    app.use('/management/', academic)
    app.use('/management/', slotInterval)
    app.use('/management/', room)
    app.use('/management/', booking)
    app.use('/management/', todos)
    app.use('/management/',divisions)
    app.use('/management/',program)
    //    app.use('/management', isLoggedIn,  management)
}


module.exports = setRouter