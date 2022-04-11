const Settings = require("../../models/Settings")
const DboDays = require("../../models/DboDays")
const Holidays = require("../../models/Holidays")
const Rooms = require('../../models/Rooms')
const Buildings = require('../../models/Buildings');
const Organizations = require('../../models/Organizations');
const Divisions = require('../../models/Divisions');
const SlotIntervalTimings = require('../../models/SlotIntervalTimings');
const Campuses = require('../../models/Campuses');
const AcademicCalender = require("../../models/AcademicCalender");
const Programs = require('../../models/Programs')
const ProgramTypes = require('../../models/programType')

module.exports = {
    getDashboard: (req, res) => {
        console.log('LOCALS:::::::::',res.locals)
        Promise.all([Settings.fetchStepForm(res.locals.slug), DboDays.fetchAll(10), Rooms.fetchAll(100), Divisions.fetchAll(10, res.locals.slug), Organizations.fetchAll(200), Buildings.fetchAll(50), SlotIntervalTimings.fetchAll(100), Campuses.fetchAll(500), AcademicCalender.fetchAll(100), Programs.fetchAll(10, res.locals.slug), ProgramTypes.fetchAll(100, res.locals.slug)]).then(result => {
           
            console.log('Programs:::::::::>>>>', result[9].recordset);
            
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                dayList: result[1].recordset,
                RoomList: result[2].recordset,
                divisionList: result[3].recordset,
                orgList: result[4].recordset,
                buildingList: result[5].recordset,
                slotTiming:JSON.stringify(result[6].recordset),
                campusList: result[7].recordset, 
                acadCalender: JSON.stringify(result[8].recordset),
                programList: result[9].recordset,
                programTypeList: JSON.stringify(result[10].recordset),
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