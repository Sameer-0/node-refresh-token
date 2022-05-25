const TimeTableGeneration = require('../../../models/TimeTableGeneration');
const AcademicYear = require('../../../models/AcademicYear');
const AcademicCalender = require('../../../models/AcademicCalender');
const Programs = require('../../../models/Programs');

module.exports = {

    getPage: (req, res) => {
        Promise.all([AcademicYear.fetchAll(), Programs.fetchAll(1000, res.locals.slug), TimeTableGeneration.fetchAll(1000, res.locals.slug), TimeTableGeneration.getRoomRow(res.locals.slug), TimeTableGeneration.getSlotColumn(res.locals.slug)]).then(result => {
            console.log('allocationlist:::',  result[2].recordset)
            res.render('admin/time-table-simulation/timetablegeneration', {
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

        TimeTableGeneration.getAcadSession(res.locals.slug, req.body.program_lid).then(result => {
            console.log(result.recordset)  
            res.status(200).send(result.recordset)
        })
    }
}