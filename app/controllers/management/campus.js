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
        // const {
        //     page,
        //     size
        // } = req.query;
        // const {
        //     limit,
        //     offset
        // } = Pagination.getPagination(page, size);
//   CampusMaster.fetchAll(limit, offset)
        CampusMaster.fetchAll().then(result => {
            // res.render('admin/management/campus/index', {
            //     campusList: result.recordset
            // })
            res.render('admin/management/campus/index',{
                     status: 200,
                    // totalTtems: result.recordset.length,
                     campusList: result.recordset,
                    // totalPages: limit,
                    // currentpage: page
                 })
            // res.json({
            //     status: 200,
            //     totalTtems: result.recordset.length,
            //     campusList: result.recordset,
            //     totalPages: offset,
            //     currentpage: page
            // })
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

    deleteById: (req, res) => {

        CampusMaster.deleteById(req.body.id).then(result => {
            res.json({
                status: 200,
                result: result.recordset
            })
        })
    }


}