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
    
    app.use('/admin/', isLoggedIn, adminDashboard);
    app.use('/admin/', isLoggedIn, days);
    app.use('/admin/', isLoggedIn, program);
    app.use('/admin/', isLoggedIn, sessions);
    app.use('/admin/', isLoggedIn, events);
    app.use('/admin/', isLoggedIn, holidays);
    app.use('/admin/', isLoggedIn, courseworkload);
    app.use('/admin/', isLoggedIn, divisions);
}

module.exports = AdminRoute;