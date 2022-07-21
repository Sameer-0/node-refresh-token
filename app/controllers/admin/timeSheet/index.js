const AcademicYear = require('../../../models/AcademicYear')
const Timesheet = require('../../../models/Timesheet')
const Rooms = require('../../../models/Rooms');
const SlotIntervalTiming = require('../../../models/SlotIntervalTimings')
const SchoolTimings = require('../../../models/SchoolTiming');
module.exports = {

    getPage: (req, res, next) => {
        Promise.all([AcademicYear.fetchAll(),  Rooms.fetchBookedRooms(res.locals.organizationId), SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug), SchoolTimings.getTimeTableSimulationSlots(res.locals.slug, req.body.dayLid, req.body.programLid, req.body.acadSessionLid)]).then(result => {
            res.render('admin/timesheet/index.ejs', {
                academicDate: result[0].recordset[0],
                roomList: JSON.stringify(result[1].recordset),
                timeSlotList: JSON.stringify(result[2].recordset),
                slotList: JSON.stringify(result[3].recordset),
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },  


    checkDaysLecture: async (req, res, next) => {
        Timesheet.checkDaysLecture(res.locals.slug, req.body.monthInt).then(result => {
            res.status(200).json({
                status: 200,
                dateList: result.recordset
            })
        })
    },


    getSimulatedData: function (req, res, next) {

        Timesheet.SimulatedData(res.locals.slug, req.body.selectedDate).then(result => {
            console.log('result:::::::::::',result.recordset)
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Data fetched",
                    date: result.recordset[0].date_str,
                    dayName: result.recordset[0].day_str,
                    data: result.recordset
                })
            } else {
                res.json({
                    status: "200",
                    message: "Data not available",
                    data: []
                })
            }
        })

    }

}