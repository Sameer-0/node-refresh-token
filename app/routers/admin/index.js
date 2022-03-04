const {
    isLoggedIn
} = require("../../middlewares/user");

function AdminRoute(app){
    const adminDashboard = require('../../routers/admin/dashboard');
    const days = require('../../routers/admin/days');
    app.use('/admin/', isLoggedIn, adminDashboard);
    app.use('/admin/', isLoggedIn, days);
}

module.exports = AdminRoute;