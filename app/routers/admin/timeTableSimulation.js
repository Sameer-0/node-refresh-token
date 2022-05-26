const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/timeTableSimulation/index')
const timeTableAllocation =  require('../../controllers/admin/timeTableSimulation/timeTableAllocation')
const timeTable =  require('../../controllers/admin/timeTableSimulation/timetable')
router.get('/time-table-simulation', index.getPage)


router.get('/time-table-simulation/allocation', timeTableAllocation.getPage)


router.get('/time-table-simulation/time-table', timeTable.getPage)
router.post('/time-table-simulation/time-table', timeTable.getSessionByProgram)
router.post('/time-table-simulation/time-table/get-allocationlist-by-dayid', timeTable.getAllocationListBydayid)



module.exports = router