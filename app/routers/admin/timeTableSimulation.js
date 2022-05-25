const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/timeTableSimulation/index')
const timeTableAllocation =  require('../../controllers/admin/timeTableSimulation/timeTableAllocation')
const timeTableGeneration =  require('../../controllers/admin/timeTableSimulation/timeTableGeneration')
router.get('/time-table-simulation', index.getPage)


router.get('/time-table-simulation/time-table-allocation', timeTableAllocation.getPage)


router.get('/time-table-simulation/time-table-generation', timeTableGeneration.getPage)
router.post('/time-table-simulation/time-table-generation', timeTableGeneration.getSessionByProgram)


module.exports = router