const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const Faculties = require('../../../models/Faculties');
const FacultyDbo = require('../../../models/FacultyDbo');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings');
const AcademicCalender = require("../../../models/AcademicCalender");
const FacultyTypes = require("../../../models/FacultyTypes");
const Settings = require("../../../models/Settings");
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {

        Promise.all([Faculties.fetchAll(10, res.locals.slug), Faculties.getCount(res.locals.slug), FacultyDbo.fetchAll(100000), SlotIntervalTimings.forFaculty(1000), AcademicCalender.fetchAll(100), FacultyTypes.fetchAll(100)]).then(result => {
            console.log(result[0].recordset)
            res.render('admin/faculty/index', {
                facultyList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                faculties: result[2].recordset,
                slotTiming: JSON.stringify(result[3].recordset),
                acadCalender: JSON.stringify(result[4].recordset),
                facultyType: JSON.stringify(result[5].recordset),
                breadcrumbs: req.breadcrumbs,
                // totalentries: result[0].recordset ? result[0].recordset.length : 0
            })
        })
    },

    create: (req, res) => {
        let object = {
            import_faculties: JSON.parse(req.body.inputJSON)
        }
        Faculties.save(object, res.locals.slug, res.locals.userId).then(result => {
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }

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


    findOne: (req, res) => {
        Faculties.findOne(req.query.id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },


    update: (req, res) => {
        let object = {
            update_faculty_date_times: JSON.parse(req.body.inputJSON)
        }

        Faculties.update(object, res.locals.slug, res.locals.userId).then(result => {
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



    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>', req.body.id)
        Faculties.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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


    deleteAll: (req, res) => {
        programTypeModel.deleteAll().then(result => {
            res.status(200).json({
                status: 200
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    search: (req, res) => {

        let rowcount = 10;
        Faculties.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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

        console.log('hitting pagination')
        Faculties.pagination(req.body.pageNo, res.locals.slug).then(result => {
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

    getSlotsById: (req, res, next) => {
        console.log('Req:::::::::::::::',req.query.faculty_lid)
        SlotIntervalTimings.getFacultySlotsById(req.query.faculty_lid, res.locals.slug).then(result => {
            console.log('ReS:::::::::::::::',result.recordset)
            res.json({
                status: 200,
                message: "Success",
                result: result.recordset
            })
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