const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const Programs = require('../../../models/Programs')
const ProgramTypes = require('../../../models/programType')
module.exports = {
    getPage: (req, res) => {

        Promise.all([Programs.fetchAll(10, res.locals.slug), ProgramTypes.fetchAll(100, res.locals.slug), Programs.getCount(res.locals.slug)]).then(result => {
            res.render('admin/programs/index', {
                programList: result[0].recordset,
                programTypeList: result[1].recordset,
                pageCount: result[2].recordset[0].count
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        Programs.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    pagination: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        Programs.pegination(rowcount, req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    }
}