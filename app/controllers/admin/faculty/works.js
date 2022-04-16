const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const FacultyWorks = require('../../../models/FacultyWorks')
const Faculties = require('../../../models/Faculties')
const ProgramSessions = require('../../../models/ProgramSessions')
const CourseWorkload = require('../../../models/CourseWorkload')
module.exports = {
    getPage: (req, res) => {

        const slug = res.locals.slug;
        Promise.all([FacultyWorks.fetchAll(10, slug), FacultyWorks.getCount(slug), Faculties.fetchAll(1000, slug), ProgramSessions.fetchAll(100, slug), CourseWorkload.fetchAll(10000, slug)]).then(result => {
            console.log(result[0].recordset)
            res.render('admin/faculty/facultyworks', {
                facultyWorkList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
                programSession: result[3].recordset,
                courseWorkload: result[4].recordset
            })
        })
    },

    create: (req, res) => {
        console.log('inputJSON11::::::::::::::::::::>>',res.locals.slug, res.locals.userId)
        let object = {
            add_faculty_works: JSON.parse(req.body.inputJSON)
        }
        FacultyWorks.save(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
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
        FacultyWorks.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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

            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },
}