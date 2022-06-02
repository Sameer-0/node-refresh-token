const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/timeTableSimulation/index')
const allocation =  require('../../controllers/admin/timeTableSimulation/allocation')
const timeTable =  require('../../controllers/admin/timeTableSimulation/timetable');
const { Router } = require('express');

//TIME TABLE SIMULATION 
router.get('/time-table-simulation', index.getPage)

//TIME TABLE ALLOCATION
router.get('/time-table-simulation/allocation', allocation.getPage)
router.post('/time-table-simulation/allocation/generate', allocation.generateTimeTable)
// router.post('/time-table-simulation/allocation/clear', allocation.clearTimeTable)

//TIME TABLE 
router.get('/time-table-simulation/time-table', timeTable.getPage)
router.post('/time-table-simulation/time-table', timeTable.getSessionByProgram)
router.post('/time-table-simulation/time-table/events', timeTable.getEventsByProgramSessionDay)
router.post('/time-table-simulation/time-table/pending-events', timeTable.getPendingEvents)
router.post('/time-table-simulation/time-table/drop-event', timeTable.dropEvent)
router.post('/time-table-simulation/time-table/schedule-event', timeTable.scheduleEvent)


module.exports = router