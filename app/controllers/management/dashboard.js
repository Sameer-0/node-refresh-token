const AcademicYear = require('../../models/AcademicYear')
const Buildings = require('../../models/Buildings')
const OrganizationMaster = require("../../models/OrganizationMaster")
const CampusMaster = require("../../models/CampusMaster")
const SlotIntervalTimings = require("../../models/SlotIntervalTimings")

module.exports = {

    getDashboard: (req, res) => {

        Promise.all([Buildings.fetchAll(10), OrganizationMaster.fetchAll(50), CampusMaster.fetchAll(50), SlotIntervalTimings.fetchAll(50), Buildings.getCount()]).then(result => {
            res.render('management/dashboard', {
                buildingList: result[0].recordset,
                orgList: result[1].recordset,
                campusList: result[2].recordset,
                timeList: result[3].recordset,
                pageCount: result[4].recordset[0].count
            })
        })
    }
}