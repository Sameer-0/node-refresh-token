const CourseWorkload = require('../../../models/CourseWorkload')
const AcadYear = require('../../../models/AcademicYear')
const Programs = require('../../../models/Programs')
const AcadSession = require('../../../models/AcadSession')


module.exports = {
    getPage: (req, res) => {
        Promise.all([CourseWorkload.getCount(res.locals.slug), AcadYear.fetchAll(), Programs.fetchAll(100, res.locals.slug), AcadSession.fetchAll(1000)]).then(result => {
            res.render('admin/courseworkload/index', {
                pageCount: result[0].recordset[0].count,
                acadYear: result[1].recordset[0].input_acad_year,
                programList: result[2].recordset,
                AcadSessionList: result[3].recordset
            })
        })

    }
}