const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const AcademicYear = require('../../models/management/AcademicYear')
const Buildings = require('../../models/management/Buildings')
const OrganizationMaster = require("../../models/management/OrganizationMaster")
const CampusMaster = require("../../models/management/CampusMaster")
const SlotIntervalTimings = require("../../models/management/SlotIntervalTimings")
const Pagination = require("../../utils/Pagination")
const moment = require('moment');

module.exports = {
    getCampusPage: (req, res) => {

        if (req.method == "GET") {
            Promise.all([CampusMaster.fetchAll(), CampusMaster.getCount()]).then(result => {
                console.log('Page Count', result[1].recordset[0])
                res.render('admin/management/campus/index', {
                    status: 200,
                    campusList: result[0].recordset,
                    pageCount: result[1].recordset[0].count
                })
            })
        } else if (req.method == "POST") {
            console.log('Page:::::::::::', req.body.pageNo)
            CampusMaster.fetchAllForPagination(req.body.pageNo).then(result => {
                console.log('Page:::::::::::', result.recordset)
                res.json({
                    status: "200",
                    message: "Quotes fetched",
                    data: result.recordset
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
    }


}