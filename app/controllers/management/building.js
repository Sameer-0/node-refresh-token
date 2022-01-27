const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const OrganizationMaster = require("../../models/OrganizationMaster")
const CampusMaster = require("../../models/CampusMaster")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const moment = require('moment');
module.exports = {



    getBuildingPage: (req, res) => {
        let rowcount = 10
        if (req.method == "GET") {
            Promise.all([Buildings.fetchAll(10), OrganizationMaster.fetchAll(50), CampusMaster.fetchAll(50), SlotIntervalTimings.fetchAll(50), Buildings.getCount()]).then(result => {
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

    getAdd: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        Buildings.save(req.body)
        res.json({
            status: 200,
            message: "Success",
            body: req.body
        })
    },

    getSingleBuilding: (req, res) => {
        Buildings.fetchById(req.query.buildingId).then(result => {
            res.json({
                status: 200,
                buildingData: result.recordset[0]
            })
        })
    },

    updateBuilding: (req, res) => {
        Buildings.update(req.body).then(result => {
            res.json({
                status: 200
            })
        })
    },

    deleteById: (req, res) => {
        Buildings.softDeleteById(req.body.buildingId).then(result => {
            res.json({
                status: 200
            })
        })
    },

    searchBuilding: (req, res) => {
        console.log('REQ::::::::::::::>>>',req.query.keyword)
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