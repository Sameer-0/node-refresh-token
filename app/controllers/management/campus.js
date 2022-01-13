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
    getCampusPage: (req, res) => {

        if (req.method == "GET") {
            Promise.all([CampusMaster.fetchAll(10), CampusMaster.getCount()]).then(result => {
                console.log('result[1].recordset[0].count',result[1].recordset[0])
                res.render('management/campus/index', {
                    status: 200,
                    campusList: result[0].recordset,
                    pageCount: result[1].recordset[0].count
                })
            })
        } else if (req.method == "POST") {
            CampusMaster.fetchChunkRows(req.body.pageNo).then(result => {
                res.json({
                    status: "200",
                    message: "Quotes fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            })
        }
    },

    createCampus: (req, res) => {
        CampusMaster.save(req.body).then(result => {
            res.json({
                status: 200,
                messsage: "Success"
            })
        })
    },

    getCampusById: (req, res) => {
        CampusMaster.getCampusById(req.body.id).then(result => {
            res.json({
                status: 200,
                result: result.recordset[0]
            })
        })
    },

    updateCampus: (req, res) => {
        CampusMaster.update(req.body).then(result => {
            res.json({
                status: 200,
                result: result.recordset
            })
        })
    },

    deleteById: (req, res) => {
        CampusMaster.deleteById(req.body.id).then(result => {
            res.json({
                status: 200,
                result: result.recordset
            })
        })
    },

    searchCampus: (req, res) => {
        //here 10is rowcount
        let rowcont  = 10;
        CampusMaster.searchCampus(rowcont, req.body.keyword).then(result => {
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