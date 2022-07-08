const ProgramSessions = require('../../../models/ProgramSessions');
const Days = require('../../../models/Days');
const CancellationReasons = require('../../../models/CancellationReasons')
const RescheduleFlags = require('../../../models/RescheduleFlags')
const AcademicCalender = require('../../../models/AcademicCalender')

module.exports = {
    getPage: (req, res) => {
        Promise.all([ProgramSessions.getLockedProgram(res.locals.slug), Days.fetchActiveDay(res.locals.slug), CancellationReasons.fetchAll(100), RescheduleFlags.fetchAll(), AcademicCalender.fetchAll(1000)]).then(result => {
            res.render('admin/rescheduling/index', {
                programList: result[0].recordset,
                dayList: result[1].recordset,
                cancelationList: result[2].recordset,
                rescheduleFlags : result[3].recordset,
                acadCalender: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        }).catch(error => {
            console.log('error', error)
        })
    }
}