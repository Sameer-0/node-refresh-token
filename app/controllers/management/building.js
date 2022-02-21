const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const Settings = require('../../models/Settings');
module.exports = {



    getPage: (req, res) => {
        let rowcount = 10
        if (req.method == "GET") {
            Promise.all([Buildings.fetchAll(10), Organizations.fetchAll(50), Campuses.fetchAll(50), SlotIntervalTimings.fetchAll(50), Buildings.getCount()]).then(result => {
                res.render('management/buildings/index', {
                    buildingList: result[0].recordset,
                    orgList: result[1].recordset,
                    campusList: result[2].recordset,
                    timeList: result[3].recordset,
                    pageCount: result[4].recordset[0].count
                })
            }).catch(error => {
                throw error
            })
        } else if (req.method == "POST") {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(422).json({
                    statuscode: 422,
                    errors: errors.array()
                });
                return;
            }

            Buildings.fetchChunkRows(rowcount, req.body.pageNo).then(result => {

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

    },

    create: (req, res) => {

        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     res.status(422).json({
        //         statuscode: 422,
        //         errors: errors.array()
        //     });
        //     return;
        // }

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        Buildings.saveWithProc(req.body.buildingJson)
        res.json({
            status: 200,
            message: "Success"
        })
    },

    single: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        Buildings.fetchById(req.query.Id).then(result => {
            res.json({
                status: 200,
                buildingData: result.recordset[0]
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

        Buildings.update(req.body).then(result => {
            res.json({
                status: 200
            })
        })
    },

    delete: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        Buildings.softDeleteById(req.body.id).then(result => {
            res.json({
                status: 200
            })
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

        Buildings.search(rowcount, req.query.keyword).then(result => {
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