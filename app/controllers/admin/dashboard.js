const Settings = require("../../models/Settings")
const DboDays = require("../../models/DboDays")
const Holidays = require("../../models/Holidays")

module.exports = {
    getDashboard: (req, res) => {
        console.log('LOCALS:::::::::',res.locals)
        Promise.all([Settings.fetchStepForm(res.locals.slug), DboDays.fetchAll(10)]).then(result => {
            console.log('dayList:::::::::>>>>', result[1].recordset)
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                dayList: result[1].recordset,
                path:'/admin'
            })
        })
    },

    dashboardStepForm: (req, res) => {
        console.log('dashboard stepform')
        Promise.all([Settings.fetchStepForm(res.locals.slug), s]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                path:'/admin'
            })
        })
        
    }


}