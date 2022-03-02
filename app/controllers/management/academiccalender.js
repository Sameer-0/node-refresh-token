const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const AcademicCalender = require("../../models/AcademicCalender")

module.exports = {
    getPage: (req, res) => {

        Promise.all([AcademicCalender.fetchAll(10), AcademicCalender.getCount()]).then(result=>{
            res.render('management/academic/acadCalender', {
                acadCalender: result[0].recordset,
                pageCount:result[1].recordset[0].count
            })
        })
    },


    search: (req, res) => {
        //here 10is rowcount
        let rowcont  = 10;
        AcademicCalender.search(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "fetched",
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
            res.json({
                status: "500",
                message: "Something went wrong",
            })
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

        AcademicCalender.fetchChunkRows(req.body.pageNo).then(result => {
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