const router = require("express").Router();
const {
    isLoggedIn
} = require("../../middlewares/user")

function Management(app) {

    const building = require("../../routers/management/building")
    const campus = require("../../routers/management/campus")
    const organization = require("../../routers/management/organization")
    const dashboard = require('../../routers/management/dashboard')
    const adminDashboard = require('../../routers/admin/dashboard')
    const slug = require('../../routers/management/slug')
    const academic = require('../../routers/management/academic')
    const slotInterval = require('../../routers/management/slotInterval')
    const room = require('../../routers/management/room')
    const booking = require('../../routers/management/booking')
    const todos = require('../../routers/management/todos')
    const divisions = require('../../routers/management/divisions')
    const program = require('../../routers/management/program')
    const holidays = require('../../routers/management/holidays')
    const faculties = require('../../routers/management/faculties')

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
    app.use('/management', isLoggedIn, holidays)
    app.use('/management', isLoggedIn, faculties)
}
module.exports = Management