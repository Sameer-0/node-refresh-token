const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const res = require('express/lib/response');
const Divisions = require('../../../models/Divisions')
const DivisionBatches = require('../../../models/DivisionBatches')
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {
        Promise.all([DivisionBatches.fetchAll(1000, res.locals.slug), DivisionBatches.getCount(res.locals.slug)]).then(result => {
            console.log('divisionBatchList',result[0].recordset)
            res.render('admin/divisions/batches', {
                divisionBatchList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs,
            
            })
        })
    },

    getAll: (req, res) => {
        DivisionBatches.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                result: result.recordset
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        DivisionBatches.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        DivisionBatches.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    },

    changestatus: (req, res) => {
        DivisionBatches.changeStatus(req.body, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Success",
            })
        }).catch(error => {
            throw error
        })
    },

    update: (req, res) => {
        let object = {
            update_division_batches: JSON.parse(req.body.inputJSON)
        }
        DivisionBatches.update(object, res.locals.slug, res.locals.userId).then(result => {
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