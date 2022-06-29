const TimeTable = require('../../../models/TimeTable');
const AcademicYear = require('../../../models/AcademicYear');
const AcademicCalender = require('../../../models/AcademicCalender');
const ProgramSessions = require('../../../models/ProgramSessions');
const SchoolTimings = require('../../../models/SchoolTiming');
const Rooms = require('../../../models/Rooms');
const Days = require('../../../models/Days');
const isJsonString = require('../../../utils/util')

module.exports = {

    getPage: (req, res) => {
        console.log('Hitting get page', )
        Promise.all([
                ProgramSessions.getLockedProgram(res.locals.slug),
                Rooms.fetchBookedRooms(res.locals.organizationId),
                Days.fetchActiveDay(res.locals.slug),
                TimeTable.getPendingEventPrograms(res.locals.slug),
            ])
            .then(result => {
                console.log('pending programs list::::', result[3].recordset)
                res.render('admin/timeTableSimulation/timetable', {
                    programList: result[0].recordset,
                    programListJson: JSON.stringify(result[0].recordset),
                    roomList: JSON.stringify(result[1].recordset),
                    dayList: result[2].recordset,
                    pendingEventPrograms: JSON.stringify(result[3].recordset),

                    breadcrumbs: req.breadcrumbs,
                    Url: req.originalUrl
                })
            }).catch(error => {
                console.log('error', error)
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
            res.status(200).send(result.recordset)
        })
    },

    getEventsByProgramSessionDay: (req, res, next) => {
        console.log('req::::::::::::>', req.body)
        Promise.all([
            TimeTable.getEventsByProgramSessionDay(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid),
            TimeTable.getEventsByProgramSessionDay(res.locals.slug, req.body.dayLid),
            SchoolTimings.getTimeTableSimulationSlots(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid)
        ]).then(results => {
            console.log('results::::::::::', results[0], results[1])
            res.status(200).send({
                eventList: results[0].recordset,
                allEventList: results[1].recordset,
                slotList: results[2].recordset
            })
        })
    },

    getPendingEvents: (req, res, next) => {
        console.log('pending req', req.body)
        TimeTable.getPendingEvents(res.locals.slug, req.body.programLid, req.body.acadSessionLid).then(result => {
            console.log('pending list:::', result.recordset)
            res.status(200).send(result.recordset)
        })
    },

    getPendingEventSessions: (req, res, next) => {
        console.log('pending req', req.body)
        TimeTable.getPendingEventSessions(res.locals.slug, req.body.programLid).then(result => {
            console.log('pending event session list:::', result.recordset)
            res.status(200).send(result.recordset)
        })
    },


    //Implemented in timetablesocket
    dropEvent: (req, res, next) => {
        console.log(req.body);
        TimeTable.dropEvent(res.locals.slug, res.locals.userId, req.body.eventLid).then(result => {
            res.status(200).send(result);
        })
    },

    //Implemented in timetablesocket
    scheduleEvent: (req, res) => {
        let object = {
            allocate_events: JSON.parse(req.body.inputJSON)
        }

        TimeTable.scheduleEvent(res.locals.slug, res.locals.userId, object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },


    //Implemented in timetablesocket
    swapEvents: (req, res) => {
        let object = {
            "swap_events": JSON.parse(req.body.inputJSON)
        }

        TimeTable.swapEvents(res.locals.slug, res.locals.userId, object).then(result => {
            console.log('successfully swaped', result)
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log('error::::::', error);
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },



    allocateFaculties: (req, res) => {
        console.log('faculty allocation request', req.body)
        TimeTable.allocateFaculties(res.locals.slug, req.body).then(result => {

            res.status(200).json({
                description: "Successful!"
            })
        })
    },

    deallocateFaculties: (req, res) => {
        console.log('faculty deallocation request', req.body)
        TimeTable.deallocateFaculties(res.locals.slug, req.body).then(result => {

            res.status(200).json({
                description: "Successful!"
            })
        })
    },
}