const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const Divisions = require('../../../models/Divisions')
const Settings = require('../../../models/Settings')
const CourseWorkload = require('../../../models/CourseWorkload')
const Programs = require('../../../models/Programs')
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {
        let slugName = res.locals.slug;
        Promise.all([Divisions.fetchAll(10000, slugName), Divisions.getCount(slugName), CourseWorkload.fetchAll(1000, slugName), Programs.fetchAll(10000, slugName)]).then(result => {
            //console.log('Result::::::::',result[0].recordset)
            res.render('admin/divisions/index', {
                divisionList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                moduleList: result[2].recordset,
                programList: result[3].recordset,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },



    getAll: (req, res) => {
        Divisions.fetchAll(10, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                result: result.recordset
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        Divisions.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
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

        Divisions.pagination(req.body.pageNo, res.locals.slug).then(result => {
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
        Divisions.changeStatus(req.body, res.locals.slug).then(result => {
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
            update_divisions: JSON.parse(req.body.inputJSON)
        }

        console.log('userid::::::::::>>>>>><><<<<', res.locals.userId)
        Divisions.update(object, res.locals.slug, res.locals.userId).then(result => {

            //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
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

    // Generate Division
    generateDivision: (req, res) => {
        console.log('Refresh Divisions::::::::>>')
        Divisions.generateDivision(res.locals.slug, res.locals.userId).then(result => {
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
        Divisions.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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


    divisionByModuleId: (req, res) => {
        Divisions.divisionByModuleId(req.body, res.locals.slug).then(result => {
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
    },


    divisionByProgramId: (req, res) => {
        Promise.all([Divisions.divisionByProgramId(req.body.programid, res.locals.slug), CourseWorkload.getmoduleByProgramId(req.body.program_id, res.locals.slug)]).then(result => {
            console.log('result::::::::::', result[0])
            res.json({
                status: "200",
                message: "success",
                division: result[0].recordset,
                moduleList: result[1].recordset,
            })
        }).catch(error => {
            console.log('error::::::::::::::', error)
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
}