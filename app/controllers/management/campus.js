const {
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const Settings = require('../../models/Settings')


module.exports = {
    getCampusPage: (req, res) => {
        if (req.method == "GET") {
            Promise.all([Campuses.fetchAll(10), Campuses.getCount()]).then(result => {
                res.render('management/campus/index', {
                    status: 200,
                    campusList: result[0].recordset,
                    pageCount: result[1].recordset[0].count
                })
            })
        } else if (req.method == "POST") {
            Campuses.fetchChunkRows(req.body.pageNo).then(result => {
                res.json({
                    status: "200",
                    message: "Quotes fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            })
        }
    },

    create: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }
        let object = {
            add_new_campus: JSON.parse(req.body.inputJSON)
        }

        Campuses.saveWithProc(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })

    },

    findOne: (req, res) => {
        Campuses.findOne(req.query.Id).then(result => {
            res.json({
                status: 200,
                result: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        let object = {
            update_campuses: JSON.parse(req.body.inputJSON)
        }
        Campuses.update(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    delete: (req, res) => {
        let object = {
            delete_campuses: JSON.parse(req.body.Ids)
        }
        Campuses.delete(object).then(result => {
            res.json({
                status: 200,
                result: result.recordset
            })
        })
    },

    deleteAll: (req, res) => {
        Campuses.deleteAll().then(result => {
            res.status(200).json({
                status: 200
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },


    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        Campuses.searchCampus(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Campus fetched",
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
    }


}