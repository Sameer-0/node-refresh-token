const FacultyWorks = require('../../../models/FacultyWorks')
const Faculties = require('../../../models/Faculties')
const ProgramSessions = require('../../../models/ProgramSessions')
const CourseWorkload = require('../../../models/CourseWorkload')
module.exports = {
    getPage: (req, res) => {
        const slug = res.locals.slug;
        Promise.all([FacultyWorks.fetchAll(10, slug), FacultyWorks.getCount(slug), Faculties.fetchAll(1000, slug), ProgramSessions.fetchAll(100, slug), CourseWorkload.fetchAll(10000, slug)]).then(result => {
            console.log(result[2])
            res.render('admin/faculty/facultyworks', {
                facultyWorkList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList : result[2].recordset,
                programSession: result[3].recordset,
                courseWorkload: result[4].recordset
            })
        })
    }
}