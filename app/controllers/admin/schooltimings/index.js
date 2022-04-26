const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const schoolTiming = require("../../../models/schoolTiming")
const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences');
const Programs = require('../../../models/Programs');
const Days = require('../../../models/Days');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings');


module.exports = {
    getPage: (req, res) => {

        Promise.all([schoolTiming.fetchAll(10, res.locals.slug),  Programs.fetchAll(10, res.locals.slug), Days.fetchAll(10, res.locals.slug), SlotIntervalTimings.fetchAll(1000)]).then(result => {
            console.log(result[0].recordset)
            res.render("admin/schooltimings/index",{
                schoolTimingList: result[0].recordset,
                programList: result[1].recordset,
                dayList: JSON.stringify(result[2].recordset),
                slotInterval:result[3].recordset,
                pageCount: 0, 
            })
        })
    },

    create: (req, res) => {
        let object = {
            import_faculties: JSON.parse(req.body.inputJSON)
        }
        schoolTiming.save(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error:::::::::::::::::::>>>',error)
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        schoolTiming.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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

        schoolTiming.pagination(req.body.pageNo, res.locals.slug).then(result => {
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
}