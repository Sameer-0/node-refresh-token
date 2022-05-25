const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences');
const Programs = require('../../../models/Programs');
const Days = require('../../../models/Days');
const RoomSlots = require('../../../models/RoomSlots')
const isJsonString = require('../../../utils/util')
const RoomTypes = require('../../../models/RoomTypes')
const RoomTransactions = require('../../../models/RoomTransactions')
const CourseWorkload = require('../../../models/CourseWorkload')


module.exports = {

    
    getPage: (req, res) => {
        Promise.all([Days.fetchAll(10, res.locals.slug),  CourseWorkload.icwForPreference(res.locals.slug), RoomTransactions.roomsForCoursePreferences(res.locals.slug), Programs.fetchAll(100, res.locals.slug)]).then(result => {
           console.log('result[3].recordsets::::::::::::',result[3].recordsets)
            res.render('admin/courseworkload/preference', {
                dayList: result[0].recordset,
                icwList: result[1].recordset,
                roomLists :result[2].recordset,
                programList: result[3].recordsets,
                breadcrumbs: req.breadcrumbs,
                
            })
        })
    },

    create: (req, res) => {
        let object = {
            import_faculties: JSON.parse(req.body.inputJSON)
        }
        CourseDayRoomPreferences.save(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error:::::::::::::::::::>>>',error)
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
        let rowcount = 10;
        CourseDayRoomPreferences.search(rowcount, req.body.keyword, res.locals.slug).then(result => {

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
            console.log(error)
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

        console.log('hitting pagination')
        CourseDayRoomPreferences.pagination(req.body.pageNo, res.locals.slug).then(result => {
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

    update: (req, res) => {

        let object = {
            update_faculty_date_times: JSON.parse(req.body.inputJSON)
        }

        CourseDayRoomPreferences.update(object, res.locals.slug, res.locals.userId).then(result => {
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

    acadSessionList: (req, res) => {
        console.log('PROGRAMS::::::::::::',req.body.array)
        Promise.all([CourseDayRoomPreferences.getAcadSessionList(JSON.parse(req.body.array), res.locals.slug), CourseDayRoomPreferences.getDayName(req.body.program_lid, res.locals.slug)])
            .then(result => {
                res.json({
                    status: 200,
                    data: {
                        acadSessionList: result[0].recordset,
                        dayList: result[1].recordset
                    }
                })

            })
    },

    courseList: (req, res) => {
console.log('req.body::::::::::::::::::::',req.body)
        CourseDayRoomPreferences.getCourseList(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })

        })
    },

    divList: (req, res) => {
        CourseDayRoomPreferences.getDivList(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })
        })
    },

    refresh: (req, res) => {
        CourseDayRoomPreferences.refresh(res.locals.slug).then(result => {
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




    batchByDivisionId: (req, res) => {
        console.log('Array::::::::::::',JSON.parse(req.body.array))
        CourseDayRoomPreferences.batchByDivisionId(JSON.parse(req.body.array), res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Division Name",
                    result: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    result: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    }
}