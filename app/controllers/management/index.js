const AcademicYear = require('../../models/management/AcademicYear')
const Buildings = require('../../models/management/Buildings')
const OrganizationMaster = require("../../models/management/OrganizationMaster")
const CampusMaster = require("../../models/management/CampusMaster")
const SlotIntervalTimings = require("../../models/management/SlotIntervalTimings")
const moment = require('moment');
module.exports = {

    getIAcadYearPage: (req, res, next) => {
        AcademicYear.fetchAll().then(result => {
            if (result.recordset.length > 0) {
                let data = {
                    id: result.recordset[0].id,
                    name: result.recordset[0].name,
                    input_acad_year: result.recordset[0].input_acad_year,
                    start_date: moment(result.recordset[0].start_date).format('YYYY-MM-DD'),
                    end_date: moment(result.recordset[0].end_date).format('YYYY-MM-DD')
                }
                res.render('admin/management/academicYear/academicYear', {
                    academicDetails: data,
                    status: 200,
                    message: "Sucess"
                })
            } else {
                res.render('admin/management/academicYear/academicYear', {
                    status: 204,
                    message: "Data not found"
                })
            }
        }).catch(err => {
            res.status(500).json({
                stats: 500,
                message: "Something Went Wrong"
            })
        })
    },

    updateAcadYear: (req, res) => {
        AcademicYear.Save(req.body)
        res.redirect('/management/academic-year')
    },

    getBuildingPage: (req, res) => {

        Promise.all([Buildings.fetchAll(), OrganizationMaster.fetchAll(), CampusMaster.fetchAll(), SlotIntervalTimings.fetchAll()]).then(result => {
            console.log('LOST:::::::::::::', result[0].recordset)
            res.render('admin/management/buildings/index', {
                buildingList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                timeList: result[3].recordset,
             })
         }).catch(error=>{
            console.log(error)
        })

        // Buildings.fetchAll().then(buldingresult => {
        //     OrganizationMaster.fetchAll().then(orgList => {
        //         CampusMaster.fetchAll().then(campuslist => {
        //             SlotIntervalTimings.fetchAll().then(timeslot => {
        //                 res.render('admin/management/buildings/index', {
        //                     buildingList: buldingresult.recordset,
        //                     orgList: orgList.recordset,
        //                     campusList: campuslist.recordset,
        //                     timeList: timeslot.recordset,
        //                 })
        //             })
        //         })
        //     })
        // }).catch(error=>{
        //     console.log(error)
        // })
    }


}