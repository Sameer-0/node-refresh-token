const Mis = require('../../../models/Mis')
const Faculties = require('../../../models/Faculties')


module.exports = {
    getPage: (req, res, next) => {
        Faculties.fetchAll(1000, res.locals.slug).then(result => {
            res.render('admin/mis/facultydaywise', {
                facultyList: result.recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    facultyDayWise: (req, res, next) => {
        Mis.facultyDayWise(res.locals.slug, req.body.faculty_lid).then(result => {
            console.log('result:::::::::::::::', result.recordset.length)
            res.status(200).json({
                status: 200,
                data: result.recordset
            })
        })
    }
}