const Faculties = require('../../../models/Faculties');
const FacultyDateTimes = require('../../../models/FacultyDateTimes');
const AcademicCalender  = require('../../../models/AcademicCalender');
const SlotIntervalTimings  = require('../../../models/SlotIntervalTimings');
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const isJsonString = require('../../../utils/util')
module.exports = {
    getPage: (req, res) => {

        Promise.all([FacultyDateTimes.fetchAll(10, res.locals.slug), FacultyDateTimes.getCount(res.locals.slug), Faculties.fetchAll(1000, res.locals.slug), AcademicCalender.fetchAll(1000), SlotIntervalTimings.fetchAll(1000)]).then(result => {
            res.render('admin/faculty/facultydatetime', {
                FacultyDateTimeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
                AcademicCalenderList: result[3].recordset,
                SlotIntervalTimingsList: result[4].recordset
            })
        })

    },

    create: (req, res) => {
       
        let object = {
            add_faculty_date_times: JSON.parse(req.body.inputJSON)
        }

        FacultyDateTimes.save(object, res.locals.slug, res.locals.userId).then(result => {
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
    },

    search: (req, res) => {
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        //here 10is rowcount
        let rowcount = 10;
        FacultyDateTimes.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Holiday fetched",
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
            console.log(error)
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
        FacultyDateTimes.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Holiday fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log(error)
            throw error
        })
    },
}