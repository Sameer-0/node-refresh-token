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

        Programs.pagination(rowcount, req.body.pageNo, res.locals.slug).then(result => {
            res.status(200).json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    },

    findOne: (req, res) => {
        Programs.findOne(req.query.id).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    update: (req, res) => {

        let object = {
            update_programs: JSON.parse(req.body.inputJSON)
        }


        Programs.update(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {

            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },
}