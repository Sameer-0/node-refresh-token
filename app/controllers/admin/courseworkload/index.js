const CourseWorkload = require('../../../models/CourseWorkload')
const AcadYear =  require('../../../models/AcademicYear')

module.exports = {
    getPage: (req, res) => {
        Promise.all([CourseWorkload.getCount(res.locals.slug), AcadYear.fetchAll()]).then(result => {
            res.render('admin/courseworkload/index',{
                pageCount: result[0].recordset[0].count,
                acadYear: result[1].recordset[0].input_acad_year
            })
        })

    }
}