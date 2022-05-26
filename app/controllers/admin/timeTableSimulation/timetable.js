const TimeTable = require('../../../models/TimeTable');
const AcademicYear = require('../../../models/AcademicYear');
const AcademicCalender = require('../../../models/AcademicCalender');
const ProgramSessions = require('../../../models/ProgramSessions');
const SchoolTimings = require('../../../models/SchoolTiming');
const Rooms = require('../../../models/Rooms');
const Days = require('../../../models/Days');


module.exports = {

    getPage: (req, res) => {
        Promise.all([
                ProgramSessions.getLockedProgram(res.locals.slug),
                Rooms.fetchBookedRooms(),
                Days.fetchAll(7, res.locals.slug)
            ])
            .then(result => {

                console.log('allocationlist:::', result[1].recordset);

                res.render('admin/timeTableSimulation/timetable', {
                    programList: result[0].recordset,
                    roomList: JSON.stringify(result[1].recordset),
                    dayList: result[2].recordset,
                    breadcrumbs: req.breadcrumbs,
                    Url: req.originalUrl
                })
            })
    },

    getAcadCalenderEvnt: (req, res, next) => {

        AcademicCalender.fetchAll(10000).then(result => {
            console.log(JSON.stringify(result.recordset))
            res.status(200).send(result.recordset)
        })

    },

    getSessionByProgram: (req, res, next) => {

        ProgramSessions.getLockedSessionByProgram(res.locals.slug, req.body.program_lid).then(result => {
            console.log(result.recordset)
            res.status(200).send(result.recordset)
        })
    },

    getEventsByProgramSessionDay: (req, res, next) => {

        console.log("req.body>>> ", req.body)

        Promise.all([
            TimeTable.getEventsByProgramSessionDay(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid),
            SchoolTimings.getTimeTableSimulationSlots(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid)
        ]).then(results => {

            console.log(results[1])

            res.status(200).send({
                eventList: results[0].recordset,
                slotList: results[1].recordset
            })
        })
    }
}