const { v4: uuidv4 } = require('uuid');

const Buildings = require('../../models/Buildings')
const Organizations = require("../../models/Organizations")
const Campuses = require("../../models/Campuses")
const Settings = require("../../models/Settings")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")
const OrganizationTypes = require("../../models/OrganizationTypes")
const Rooms = require("../../models/Rooms")
const RoomTypes = require("../../models/RoomTypes")
const {encrypt, decrypt} =  require('../../utils/crypto')
module.exports = {
    getDashboard: (req, res) => {
        console.log('management stepform dashoard')
        Promise.all([Buildings.fetchAll(10), Organizations.fetchAll(50), Campuses.fetchAll(50), SlotIntervalTimings.fetchAll(50), Buildings.getCount(res), Settings.fetchStepForm(res.locals.slug), OrganizationTypes.fetchAll(50), Rooms.fetchAll(50), RoomTypes.fetchAll(500)]).then(result => {
            console.log('SEssionID:::::::::::::::::::>>',encrypt(uuidv4()))
            console.log('SEssionID:::::::::::::::::::>>',decrypt(encrypt(uuidv4())))
            res.render('management/dashboard', {
                buildingList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                timeList: result[3].recordset,
                pageCount: result[4].recordset[0].count,
                currentFormStep: result[5].recordset[0] ? result[5].recordset[0].seq : '',
                orgType: result[6].recordset,
                roomList: result[7].recordset,
                roomTypeList: result[8].recordset,
                userSession : encrypt(uuidv4())
            })
        }).catch(error => {
            throw error
        })
    },

    dashboardStepForm: (req, res) => {
        
        Promise.all([Buildings.getCount(), Organizations.getCount(), Campuses.getCount(), Room.getCount()]).then(result => {
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