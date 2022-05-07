const AcademicYear = require('../../../models/AcademicYear')
const AcademicCalender = require('../../../models/AcademicCalender')
module.exports = {

    getPage: (req, res) => {
        AcademicYear.fetchAll().then(result => {
            res.render('admin/time-table-generation/index', {
                acadmicYear: result.recordset[0],
                breadcrumbs: req.breadcrumbs
            })
        })
    },

    getAcadCalenderEvnt: (req, res, next) => {

        AcademicCalender.fetchAll(10000).then(result=>{
            console.log(JSON.stringify(result.recordset))
            res.status(200).send(result.recordset)
        })


    }
}