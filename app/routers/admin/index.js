function AdminRoute(app){
    const adminDashboard = require('../../routers/admin/dashboard')
    const days = require('../../routers/admin/days')
    app.use('/admin/', adminDashboard)
    app.use('/admin/', days)
}

module.exports = AdminRoute