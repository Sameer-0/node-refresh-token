const Settings = require("../../models/Settings")
const DboDays = require("../../models/DboDays")
const Holidays = require("../../models/Holidays")
const Rooms = require('../../models/Rooms')
const Buildings = require('../../models/Buildings');
const Organizations = require('../../models/Organizations');
const Divisions = require('../../models/Divisions')
module.exports = {
    getDashboard: (req, res) => {
        console.log('LOCALS:::::::::',res.locals)
        Promise.all([Settings.fetchStepForm(res.locals.slug), DboDays.fetchAll(10), Rooms.fetchAll(100), Divisions.fetchAll(10, res.locals.slug), Organizations.fetchAll(200), Buildings.fetchAll(50)]).then(result => {
            console.log('orgList:::::::::>>>>', result[5].recordset);
            console.log('buildList:::::::::>>>>', result[4].recordset);
            
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                dayList: result[1].recordset,
                RoomList: result[2].recordset,
                divisionList: result[3].recordset,
                buildingList: result[4].recordset,
                orgList: result[5].recordset,
                path:'/admin'
            })
        })
    },

    dashboardStepForm: (req, res) => {
        console.log('dashboard stepform', result[1].recordset )
        Promise.all([Settings.fetchStepForm(res.locals.slug), Rooms.fetchAll(100)]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                RoomList: result[1].recordset,
                path:'/admin'
            })
        })
        
    }


}