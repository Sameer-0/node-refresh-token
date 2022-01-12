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

    getIAcadYearPage: (req, res, next) => {
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
        AcademicYear.save(req.body)
        res.redirect('/management/academic-year')
    },

    getBuildingPage: (req, res) => {
        Promise.all([Buildings.fetchAll(), OrganizationMaster.fetchAll(), CampusMaster.fetchAll(), SlotIntervalTimings.fetchAll()]).then(result => {
            let buildingList = []
            let slotList = []
            // result[0].recordset.map(item => {
            //     let buildings = {
            //         id: item.id,
            //         building_name: item.building_name,
            //         building_number: item.building_number,
            //         total_floors: item.total_floors,
            //         owner_id: item.owner_id,
            //         handled_by: item.handled_by,
            //         start_time: moment(item.start_time).format('LTS'),
            //         end_time: moment(item.end_time).format('LTS'),
            //         campus_id: item.campus_id
            //     }
            //     buildingList.push(buildings)
            // })

            result[3].recordset.map(item => {

                let slot = {
                    id: item.id,
                    start_time: moment(item.start_time).format('LTS'),
                    end_time: moment(item.end_time).format('LTS'),
                    slot_name: item.slot_name
                }
                slotList.push(slot)
            })
            res.render('management/buildings/index', {
                buildingList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                timeList: slotList,
            })
        }).catch(error => {
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
    },

    getAdd: (req, res) => {
        //  let errors = validationResult(req)

        Buildings.save(req.body)
        res.json({
            status: 200,
            message: "Success",
            body: req.body
        })
    },

    getSingleBuilding: (req, res) => {
        Buildings.fetchbyId(req.body.buildingId).then(result => {
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
    }

}