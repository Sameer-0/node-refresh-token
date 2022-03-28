const Faculties = require('../../../models/Faculties');
const FacultyBatch = require('../../../models/FacultyBatch');
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

module.exports = {
    getPage: (req, res) => {

        Promise.all([FacultyBatch.fetchAll(10, res.locals.slug), FacultyBatch.getCount(res.locals.slug), Faculties.fetchAll(1000, res.locals.slug)]).then(result => {
      
            res.render('admin/faculty/facultybatch', {
                FacultyBatchList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
            
            })
        })

    },
}