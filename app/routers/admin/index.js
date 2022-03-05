const {
    isLoggedIn
} = require("../../middlewares/user");

function AdminRoute(app){
    const adminDashboard = require('../../routers/admin/dashboard');
    const days = require('../../routers/admin/days');
    const program = require('../../routers/admin/program');

    app.use('/admin/', isLoggedIn, adminDashboard);
    app.use('/admin/', isLoggedIn, days);
    app.use('/admin/', isLoggedIn, program);
}

module.exports = AdminRoute;