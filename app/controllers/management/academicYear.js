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

module.exports ={
   getAcadYearPage: (req, res, next) => {
        AcademicYear.fetchAll().then(result => {
            let data = {
                id: result.recordset[0].id,
                name: result.recordset[0].name,
                input_acad_year: result.recordset[0].input_acad_year,
                start_date: moment(result.recordset[0].start_date).format('YYYY-MM-DD'),
                end_date: moment(result.recordset[0].end_date).format('YYYY-MM-DD')
            }
            res.render('management/academicYear/academicYear', {
                academicDetails: data,
                status: 200,
                message: "Sucess"
            })

        }).catch(err => {
            res.status(500).json({
                stats: 500,
                message: "Something Went Wrong"
            })
        })
    },

    updateAcadYear: (req, res) => {
        AcademicYear.update(req.body)
        res.redirect('/management/academic-year')
    },
}