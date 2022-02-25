function AdminRoute(app){
    const adminDashboard = require('../../routers/admin/dashboard')
    app.use('/admin/', adminDashboard)
}

module.exports = AdminRoute