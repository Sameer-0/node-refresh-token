const Buildings = require('../../models/Buildings')
const OrganizationMaster = require("../../models/OrganizationMaster")
const CampusMaster = require("../../models/CampusMaster")
const Room = require("../../models/RoomData")
const Settings = require("../../models/Settings")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const OrganizationType =  require("../../models/OrganizationType")
const roomData = require("../../models/RoomData")

module.exports = {

    getDashboard: (req, res) => {

        Promise.all([Buildings.fetchAll(10), OrganizationMaster.fetchAll(50), CampusMaster.fetchAll(50), SlotIntervalTimings.fetchAll(50), Buildings.getCount(), Settings.getCount(res.locals.slug), OrganizationType.fetchAll(50), roomData.fetchAll(50)]).then(result => {
           
           console.log('LIst:::::::',result[7].recordset)
            res.render('management/dashboard', {
                buildingList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                timeList: result[3].recordset,
                pageCount: result[4].recordset[0].count,
                settingCount: result[5].recordset[0].count,
                orgType:result[6].recordset,
                roomTypeList:result[7].recordset
            })
        }).catch(error => {
            throw error
        })

    },

    dashboardStepForm: (req, res) => {
        Promise.all([Buildings.getCount(), OrganizationMaster.getCount(), CampusMaster.getCount(), Room.getCount()]).then(result => {
            console.log('result:::::::::::>>>', result[0].recordset[0].count)
            res.json({
                status: 200,
                message: "Success",
                buildingCount: result[0].recordset[0].count,
                organizationCount: result[1].recordset[0].count,
                campusCount: result[2].recordset[0].count,
                roomCount: result[3].recordset[0].count
            })
        }).catch(error => {
            res.json({
                status: 500,
                message: error
            })
        })
    }
}