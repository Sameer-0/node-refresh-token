const Faculties = require('../../../models/Faculties');
const FacultyDateTimes = require('../../../models/FacultyDateTimes');
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

module.exports = {
    getPage: (req, res) => {

        Promise.all([FacultyDateTimes.fetchAll(10, res.locals.slug), FacultyDateTimes.getCount(res.locals.slug), Faculties.fetchAll(1000, res.locals.slug)]).then(result => {
      
            res.render('admin/faculty/facultydatetime', {
                FacultyDateTimeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                faculties: result[2].recordset
            })
        })

    },
}