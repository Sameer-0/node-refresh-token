const TimeTableGeneration = require('../../../models/TimeTableGeneration');
const AcademicYear = require('../../../models/AcademicYear');
const AcademicCalender = require('../../../models/AcademicCalender');
const Programs = require('../../../models/Programs');

module.exports = {

    getPage: (req, res) => {
        Promise.all([AcademicYear.fetchAll(), Programs.fetchAll(1000, res.locals.slug)]).then(result => {
            console.log('programlist:::',  result[1].recordset)
            res.render('admin/time-table-simulation/timetablegeneration', {
                acadmicYear: result[0].recordset,
                programList: result[1].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    getAcadCalenderEvnt: (req, res, next) => {

        AcademicCalender.fetchAll(10000).then(result=>{
            console.log(JSON.stringify(result.recordset))  
            res.status(200).send(result.recordset)
        })


    },

    getSessionByProgram: (req, res, next) => {
console.log(req.body)
        TimeTableGeneration.getAcadSession(res.locals.slug, req.body.program_lid).then(result => {
            console.log(result.recordset)  
            res.status(200).send(result.recordset)
        })
    }
}