const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const FacultyWorks = require('../../../models/FacultyWorks')
const Faculties = require('../../../models/Faculties')
const ProgramSessions = require('../../../models/ProgramSessions')
const CourseWorkload = require('../../../models/CourseWorkload')
const Settings = require("../../../models/Settings");
const Programs = require("../../../models/programs");
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {

        const slug = res.locals.slug;
        
        Promise.all([FacultyWorks.fetchAll(10, slug), FacultyWorks.getCount(slug), Faculties.fetchAll(1000, slug), Programs.fetchAll(100, slug), CourseWorkload.fetchAll(10000, slug)]).then(result => {
            
            res.render('admin/faculty/facultyworks', {
                facultyWorkList: result[0].recordset,
                pageCount: result[1].recordset[0].count, 
                facultyList: result[2].recordset,
                programList: result[3].recordset,
                courseWorkload: result[4].recordset,  
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },

    create: (req, res) => {
     
        let object = {
            add_faculty_works: JSON.parse(req.body.inputJSON)
        }
        console.log('FACULTY WORK::::::::::::::::::::>>',object)
        FacultyWorks.save(object, res.locals.slug, res.locals.userId).then(result => {
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
        FacultyWorks.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
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

        FacultyWorks.pagination(req.body.pageNo, res.locals.slug).then(result => {
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
            update_faculty_works: JSON.parse(req.body.inputJSON)
        }
           
        FacultyWorks.update(object, res.locals.slug, res.locals.userId).then(result => {
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
        console.log('Delete::::::::::::>>',req.body.id)
        FacultyWorks.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
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

    sessionByProgramId: (req, res) => {
      
        FacultyWorks.sessionListByProgram(req.body.program_lid, res.locals.slug).then(result => {
            console.log('result in controller', result)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Session List",
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
            // if (isJsonString.isJsonString(error.originalError.info.message)) {
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // } else {
            //     res.status(500).json({
            //         status: 500,
            //         description: error.originalError.info.message,
            //         data: []
            //     })
            // }
            console.log('errooor', error);
        })
    },

    moduleByprogramSession: (req, res) => {
        console.log('request body in controller', req.body)
        FacultyWorks.moduleByProgramSession(req.body, res.locals.slug).then(result => {
            console.log('result in controller', result)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Session List",
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
            // if (isJsonString.isJsonString(error.originalError.info.message)) {
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // } else {
            //     res.status(500).json({
            //         status: 500,
            //         description: error.originalError.info.message,
            //         data: []
            //     })
            // }
            console.log('errooor', error);
        })
    },

    findOne: (req, res) => {
        FacultyWorks.findOne(req.body.Id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

}