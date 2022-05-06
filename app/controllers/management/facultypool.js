const {
    validationResult
} = require('express-validator');

const FacultyPool = require('../../models/FacultyPool')
const isJsonString = require('../../utils/util')

module.exports = {
    getPage: (req, res) => {
        FacultyPool.fetchAll().then(result => {
            res.render('management/faculties/pool', {
                facultypool: result.recordset,
                breadcrumbs: req.breadcrumbs
            })
        })
    },



    refresh: (req, res) => {
        FacultyPool.refresh(res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    }
}