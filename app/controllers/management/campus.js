const {
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const Settings =  require('../../models/Settings')


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

        if(req.body.settingName){
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        Campuses.saveWithProc(req.body.inputJSON).then(result => {
            if (result.output.output) {
                res.status(200).json({
                    status: 200,
                    data: result.recordset,
                    message: "success"
                })
            } else {
                res.status(409).json({
                    status: 409,
                    data: result.recordset,
                    message: ["Fail! Dublicate entry found"]
                })
            }
        }).catch(error => {
            console.log('error::::::::::::',error)
            res.status(500).json({
                status: 500,
                message: [error]
            })
        })

    },

    single: (req, res) => {
        Campuses.getCampusById(req.query.Id).then(result => {
            res.json({
                status: 200,
                result: result.recordset[0]
            })
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
        
        Campuses.update(req.body).then(result => {
            res.json({
                status: 200,
                result: result.recordset
            })
        })
    },

    delete: (req, res) => {
        Campuses.deleteById(req.body.Id).then(result => {
            res.json({
                status: 200,
                result: result.recordset
            })
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