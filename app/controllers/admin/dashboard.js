const Settings = require("../../models/Settings")
module.exports = {
    getDashboard: (req, res) => {
        Promise.all([Settings.fetchStepForm(res.locals.slug)]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                path:'/admin'
            })
        })

    }



}