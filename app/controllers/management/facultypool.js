const {
    validationResult
} = require('express-validator');

const FacultyPool = require('../../models/FacultyPool')


module.exports = {
    getPage: (req, res) => {
        FacultyPool.fetchAll().then(result => {
            res.render('management/faculties/pool', {
                facultypool: result.recordset
            })
        })
    },



    refresh: (req, res) => {
        FacultyPool.refresh(res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    }
}