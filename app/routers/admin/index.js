function AdminRoute(app){
    const adminDashboard = require('../../routers/admin/dashboard')
    const days = require('../../routers/admin/days')
    const program = require('../../routers/admin/program')
    app.use('/admin/', adminDashboard)
    app.use('/admin/', days)
    app.use('/admin/', program)
}

module.exports = AdminRoute