const Faculties = require('../../../models/Faculties');
const FacultyDbo = require('../../../models/FacultyDbo')
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

module.exports = {
    getPage: (req, res) => {

        Promise.all([Faculties.fetchAll(10, res.locals.slug), Faculties.getCount(res.locals.slug), FacultyDbo.fetchAll(1000)]).then(result => {
            console.log(result[2].recordset);
            res.render('admin/faculty/index', {
                facultyList: result[0].recordset,
                pageCount:result[1].recordset[0].count,
                faculties: result[2].recordset
            })
        })

    },

    create: (req, res) => {


        let object = {
            insert_faculties: JSON.parse(req.body.inputJSON)
        }

        console.log('ENTERD:::::::::::>>',object)

        Faculties.save(object, res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error::::::::::::::<<<',error)
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },


    findOne: (req, res) => {
        programTypeModel.getProgramTypeById(req.query.id).then(result => {

            res.json({
                status: 200,
                message: "Success",
                programData: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    update: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        programTypeModel.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",

            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },



    delete: (req, res) => {
        programTypeModel.delete(req.body.Ids).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
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
        programTypeModel.searchProgramType(rowcount, req.query.keyword).then(result => {
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
        Faculties.fetchChunkRows(rowcount, req.body.pageNo).then(result => {
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