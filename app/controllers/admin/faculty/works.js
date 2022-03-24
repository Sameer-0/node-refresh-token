const FacultyWorks = require('../../../models/FacultyWorks')
const Faculties = require('../../../models/Faculties')
module.exports = {
    getPage: (req, res) => {
        const slug = res.locals.slug;
        Promise.all([FacultyWorks.fetchAll(10, slug), FacultyWorks.getCount(slug), Faculties.fetchAll(1000, slug)]).then(result => {
            res.render('admin/faculty/facultyworks', {
                facultyWorkList: result[0].recordset,
                pageCount: result[1].recordset[0].count
            })
        })
    }
}