const TimeTable = require('../../../models/TimeTable');
const AcademicYear = require('../../../models/AcademicYear');
const AcademicCalender = require('../../../models/AcademicCalender');
const Programs = require('../../../models/Programs');
const SchoolTimings = require('../../../models/SchoolTiming');

module.exports = {

    getPage: (req, res) => {
        Promise.all([AcademicYear.fetchAll(), Programs.fetchAll(1000, res.locals.slug), TimeTable.getAllocationListByDayId(res.locals.slug), TimeTable.getRoomRow(res.locals.slug), SchoolTimings.getTimeTableSimulationSlots(res.locals.slug) ]).then(result => {
            console.log('allocationlist:::',  result[2].recordset)
            res.render('admin/timeTableSimulation/timetable', {
                acadmicYear: result[0].recordset,
                programList: result[1].recordset,
                allocationList: JSON.stringify(result[2].recordset),
                uniqueRoomList: result[3].recordset,
                RoomList: JSON.stringify(result[3].recordset),
                uniqueSlotList: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl 
            })
        })
    },

    getAcadCalenderEvnt: (req, res, next) => {

        AcademicCalender.fetchAll(10000).then(result=>{
            console.log(JSON.stringify(result.recordset))  
            res.status(200).send(result.recordset)
        })

    },

    getSessionByProgram: (req, res, next) => {

        TimeTable.getAcadSession(res.locals.slug, req.body.program_lid).then(result => {
            console.log(result.recordset)  
            res.status(200).send(result.recordset)
        })
    },

    getAllocationListBydayid: (req, res, next) => {

        TimeTable.getAllocationListByDayId(res.locals.slug, req.body.day_lid).then(result => {
            console.log(result.recordset)  
            res.status(200).send(result.recordset)
        })
    }
}