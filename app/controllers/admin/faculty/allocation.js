const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const Faculties = require('../../../models/Faculties')
module.exports = {

    getPage: (req, res) => {
        Promise.all([Faculties.fetchAll(10000, res.locals.slug)]).then(result => {
            res.render('admin/faculty/facultyallocationstatus', {
                facultyList: result[0].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    checkfacultyStatus: (req, res, next) => {
        res.status(200).json({
            status: 200,
            message: "success"
        })
    }
}