const Mis = require('../../../models/Mis')
const TimeTable = require('../../../models/TimeTable');
const ProgramSessions = require('../../../models/ProgramSessions');
const SlotIntervalTiming = require('../../../models/SlotIntervalTimings')
const Rooms = require('../../../models/Rooms');
const Days = require('../../../models/Days');
const isJsonString = require('../../../utils/util')

module.exports = {

    getPage: (req, res, next) => {
        Promise.all([
            Rooms.fetchBookedRooms(res.locals.organizationId),
            Days.fetchAll(10, res.locals.slug),
            SlotIntervalTiming.slotTimesForSchoolTiming(res.locals.slug),
        ]).then(result => {
            res.render('admin/mis/roomwiseallocation', {
                roomListStr: result[0].recordset,
                dayList: JSON.stringify(result[1].recordset),
                timeSlotList:JSON.stringify(result[2].recordset),
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
    },



    getRoomAllocation: (req, res, next) => {
        console.log('division wise allocation', req.body)
        TimeTable.getRoomAllocation(res.locals.slug,  req.body.room_lid).then(result => {
           console.log('division allocation list:::', result.recordset)
            res.status(200).json({status:200, result: result.recordset})
        })
    },
}