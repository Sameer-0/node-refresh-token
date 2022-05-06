const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences');
const Programs = require('../../../models/Programs');
const Days = require('../../../models/Days');
const RoomSlots = require('../../../models/RoomSlots')

module.exports = {

    
    getPage: (req, res) => {
        Promise.all([CourseDayRoomPreferences.fetchAll(10, res.locals.slug), CourseDayRoomPreferences.getCount(res.locals.slug), Programs.fetchAll(1000, res.locals.slug), Days.fetchAll(10, res.locals.slug), RoomSlots.SlotsForCourcePreference()]).then(result => {
            console.log('dayList', result[3].recordset)
            res.render('admin/courseworkload/preference', {
                coursepreference: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                programList: result[2].recordset,
                dayList: JSON.stringify(result[3].recordset),
                totalentries: result[0].recordset ? result[0].recordset.length : 0,
                roomSlotsList: result[4].recordset,
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
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        CourseDayRoomPreferences.search(rowcount, req.query.keyword, res.locals.slug).then(result => {

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

            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    acadSessionList: (req, res) => {

        Promise.all([CourseDayRoomPreferences.getAcadSession(req.body.program_lid, res.locals.slug), CourseDayRoomPreferences.getDayName(req.body.program_lid, res.locals.slug)])
            .then(result => {
                res.json({
                    status: 200,
                    data: {
                        acadSessionList: result[0].recordset,
                        dayList: result[1].recordset
                    }
                })
                console.log('divList', result[1].recordset);
            })
    },

    courseList: (req, res) => {

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
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    }
}