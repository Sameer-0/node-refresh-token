const {
    isLoggedIn
} = require("../../middlewares/user");

function AdminRoute(app){
    const adminDashboard = require('../../routers/admin/dashboard');
    const days = require('../../routers/admin/days');
    const program = require('../../routers/admin/program');
    const sessions = require('../../routers/admin/sessions');
    const events = require('../../routers/admin/events');
    const holidays = require('../../routers/admin/holidays');
    const courseworkload = require('../../routers/admin/courseworkload');
    const divisions = require('../../routers/admin/divisions');
    const roomtransacton = require('./rooms');
    const faculty = require('../../routers/admin/faculty');
    const weeklyConstraint = require('../../routers/admin/weeklyConstraint');
    const timeTableGeneration = require('../../routers/admin/timeTableGeneration');
    const timeTableSimulation = require('../../routers/admin/timeTableSimulation');
    const rescheduling = require('../../routers/admin/rescheduling');


    app.use('/admin/', isLoggedIn, adminDashboard);
    app.use('/admin/', isLoggedIn, days);
    app.use('/admin/', isLoggedIn, program);
    app.use('/admin/', isLoggedIn, sessions);
    app.use('/admin/', isLoggedIn, events);
    app.use('/admin/', isLoggedIn, holidays);
    app.use('/admin/', isLoggedIn, courseworkload);
    app.use('/admin/', isLoggedIn, divisions);
    app.use('/admin/', isLoggedIn, roomtransacton);
    app.use('/admin/', isLoggedIn, faculty);
    app.use('/admin/', isLoggedIn, weeklyConstraint);
    app.use('/admin/', isLoggedIn, timeTableGeneration);
    app.use('/admin/', isLoggedIn, timeTableSimulation);
    app.use('/admin/', isLoggedIn, rescheduling);

}

module.exports = AdminRoute;