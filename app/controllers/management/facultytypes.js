const {
    check,
    validationResult,
    body
} = require('express-validator');

const FacultyTypes = require('../../models/FacultyTypes')

module.exports = {
    getPage: (req, res) => {
        Promise.all([FacultyTypes.fetchAll(10), FacultyTypes.getCount()]).then(result=>{
            res.render('management/faculties/types', {
                typeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                breadcrumbs: req.breadcrumbs
            })
       })
    },

    create: (req, res) => {
          let object = {
            add_faculty_types: JSON.parse(req.body.inputJSON)
        }

        FacultyTypes.save(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    findOne: (req, res) => {
        FacultyTypes.findOne(req.query.Id).then(result => {
            res.json({
                status: 200,
                result: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        let object = {
            update_faculty_types: JSON.parse(req.body.inputJSON)
        }

        FacultyTypes.update(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    delete: (req, res) => {


        let object = {
            delete_faculty_types: JSON.parse(req.body.inputJSON)
        }

        FacultyTypes.delete(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('Error:::::::::::::::',error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    deleteAll: (req, res) => {
        FacultyTypes.deleteAll().then(result => {
            res.status(200).json({
                status: 200
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
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
        let rowcont = 10;
        FacultyTypes.search(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Holiday Fetch",
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

        FacultyTypes.fetchChunkRows(rowcount, req.body.pageNo).then(result => {
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