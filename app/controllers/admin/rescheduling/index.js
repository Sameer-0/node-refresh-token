const ProgramSessions = require('../../../models/ProgramSessions');
const Days = require('../../../models/Days');
const CancellationReasons =  require('../../../models/CancellationReasons')

module.exports = {
    getPage: (req, res) => {
        Promise.all([ProgramSessions.getLockedProgram(res.locals.slug), Days.fetchActiveDay(res.locals.slug), CancellationReasons.fetchAll(100)]).then(result => {
            res.render('admin/rescheduling/index', {
                programList: result[0].recordset,
                dayList: result[1].recordset,
                cancelationList : result[2].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        }).catch(error => {
            console.log('error', error)
        })
    }
}