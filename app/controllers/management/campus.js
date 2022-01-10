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
const moment = require('moment');

module.exports = {
    getCampusPage: (req, res) => {

        CampusMaster.fetchAll().then(result => {
            res.render('admin/management/campus/index', {
                campusList: result.recordset
            })
        })
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

    deleteById:(req, res)=>{

        CampusMaster.deleteById(req.body.id).then(result=>{
            res.json({
                status: 200,
                result: result.recordset
            })
        })
    }


}