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
            Promise.all([Buildings.fetchAll(rowcount), OrganizationMaster.fetchAll(), CampusMaster.fetchAll(), SlotIntervalTimings.fetchAll(), Buildings.getCount()]).then(result => {
                let buildingList = []
                let slotList = []
                result[0].recordset.map(item => {
                    let buildings = {
                        building_id: item.building_id,
                        building_name: item.building_name,
                        building_number: item.building_number,
                        total_floors: item.total_floors,
                        owner: item.owner,
                        handled_by: item.handled_by,
                        start_time: moment(item.start_time).format('LTS'),
                        end_time: moment(item.end_time).format('LTS'),
                        campus_abbr: item.campus_abbr
                    }
                    buildingList.push(buildings)
                })

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
                    buildingList: buildingList,
                    orgList: result[1].recordset,
                    campusList: result[2].recordset,
                    timeList: slotList,
                    pageCount: result[4].recordset[0].count
                })
            }).catch(error => {
                console.log('Error',error)
            })
        } else if (req.method == "POST") {
            Buildings.fetchChunkRows(rowcount, req.body.pageNo).then(result => {
                let buildingList = []
                result.recordset.map(item => {
                    let buildings = {
                        building_id: item.building_id,
                        building_name: item.building_name,
                        building_number: item.building_number,
                        total_floors: item.total_floors,
                        owner: item.owner,
                        handled_by: item.handled_by,
                        start_time: moment(item.start_time).format('LTS'),
                        end_time: moment(item.end_time).format('LTS'),
                        campus_abbr: item.campus_abbr
                    }
                    buildingList.push(buildings)
                })

                res.json({
                    status: "200",
                    message: "Quotes fetched",
                    data: buildingList,
                    length: result.recordset.length
                })
            })
        }

    },

    getAdd: (req, res) => {
        Buildings.save(req.body)
        res.json({
            status: 200,
            message: "Success",
            body: req.body
        })
    },

    getSingleBuilding: (req, res) => {
        Buildings.fetchById(req.body.buildingId).then(result => {
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
    }

}