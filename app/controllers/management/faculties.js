const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const Organizations = require('../../models/Organizations')
const Campuses = require('../../models/Campuses')
const FacultyDbo = require('../../models/FacultyDbo')
const Settings = require('../../models/Settings')
module.exports = {
    getPage: (req, res) => {
        Promise.all([SlotIntervalTimings.fetchAll(100), Organizations.fetchAll(100), Campuses.fetchAll(100), FacultyDbo.fetchAll(10)]).then(result => {
            res.render('management/faculties/index', {
                timeList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                facultyList: result[3].recordset
            })
        })
    },

    create: (req, res) => {
        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        let object = {
            add_new_buildings: JSON.parse(req.body.inputJSON)
        }

        FacultyDbo.save(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    findOne: (req, res) => {

        Faculties.findOne(req.query.Id).then(result => {
            res.json({
                status: 200,
                buildingData: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        let object = {
            update_buildings: JSON.parse(req.body.inputJSON)
        }
        FacultyDbo.update(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    delete: (req, res) => {

        console.log('Delete Call', req.body)
        let object = {
            delete_buildings: JSON.parse(req.body.Ids)
        }

        FacultyDbo.delete(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    deleteAll: (req, res) => {
        Faculties.deleteAll().then(result => {

            res.status(200).json({
                status: 200,
                description: "Successfully deleted"
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
        let rowcount = 10;

        FacultyDbo.search(rowcount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Building fetched",
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
    }
}