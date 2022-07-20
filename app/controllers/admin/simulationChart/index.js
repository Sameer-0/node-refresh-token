const TimeTable = require('../../../models/TimeTable')

module.exports = {

    getPage: (req, res) => {
        Promise.all([TimeTable.timeTablePivotedExcel(res.locals.slug)]).then(result => {
            res.render('admin/simulationChart/index', {
                timetableSheet: result[0].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    }

}