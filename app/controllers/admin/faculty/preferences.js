const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const FacultyWorks = require('../../../models/FacultyWorks')
const ProgramDays = require('../../../models/ProgramDays')
const FacultyWorkTimePreferences = require('../../../models/FacultyWorkTimePreferences')
const Settings = require("../../../models/Settings");
const isJsonString = require('../../../utils/util')

module.exports = {
    getPage: (req, res) => {
        Promise.all([FacultyWorkTimePreferences.fetchAll(10, res.locals.slug), SlotIntervalTimings.forFaculty(1000), FacultyWorkTimePreferences.getCount(res.locals.slug), FacultyWorkTimePreferences.facultyPrefList(res.locals.slug)]).then(result => {
            res.render('admin/faculty/preference', {
                facultyworktimepref: result[0].recordset,
                slotIntervalTimings: result[1].recordset,
                pageCount: result[2].recordset ? result[2].recordset[0].count : 0,
                breadcrumbs: req.breadcrumbs,
                facultyList: result[3].recordset
            })
        })
    },

    create: (req, res) => {

        let object = {
            add_faculty_work_time_preferences: JSON.parse(req.body.inputJSON)
        }

        FacultyWorkTimePreferences.save(object, res.locals.slug, res.locals.userId).then(result => {
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }
            res.status(200).json(JSON.parse(result.output.output_json))
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
        FacultyWorkTimePreferences.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
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

        FacultyWorkTimePreferences.pagination(req.body.pageNo, res.locals.slug).then(result => {
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


    update: (req, res) => {

        let object = {
            update_faculty_work_time_preferences: JSON.parse(req.body.inputJSON)
        }

        FacultyWorkTimePreferences.update(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
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
    },

    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>', req.body.id)
        FacultyWorkTimePreferences.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
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
    },



    getSlotsByIdAndPrograms: (req, res, next) => {
        console.log('BODY:::::::::', req.body.facultyId)
        Promise.all([SlotIntervalTimings.getFacultySlotsById(req.body.facultyDboLId, res.locals.slug), FacultyWorkTimePreferences.programByFacultyId(req.body.faculty_lid, res.locals.slug)]).then(result => {
            console.log('result::::::::',result[1].recordset)
            res.json({
                status: 200,
                message: "Success",
                slotList: result[0].recordset,
                programList: result[1].recordset
            })
        }).catch(error => {
            console.log(error)
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
    },

    moduleByprogramAndSessionId: (req, res, next) => {
       FacultyWorkTimePreferences.moduleByprogramAndSessionId(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset,
            })
        }).catch(error => {
            console.log(error)
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
    },

    sessionDayByProgramId: (req, res, next) => {
        Promise.all([FacultyWorks.sessionListByProgram(req.body.programId, res.locals.slug), ProgramDays.dayByProgramId(req.body.programId, res.locals.slug)]).then(result => {
            console.log('Result:::::::::::::::', result)
            res.json({
                status: 200,
                message: "Success",
                sessonList: result[0].recordset,
                dayList: result[1].recordset,
            })
         }).catch(error => {
             console.log(error)
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
     },

     //facultyWorkloadForPrefernce


     facultyWorkloadForPrefernce: (req, res, next) => {
        FacultyWorks.facultyWorkloadForPrefernce(req.body, res.locals.slug).then(result => {
            console.log('Result:::::::::::::::', result)
            res.json({
                status: 200,
                message: "Success",
                worklist: result.recordset,
            })
         }).catch(error => {
             console.log(error)
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