const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/simulationChart/index')
const pivoted =  require('../../controllers/admin/simulationChart/pivoted')

router.get('/simulation-chart', index.getPage) 
router.get('/simulation-chart/pivoted', pivoted.getPage) 

module.exports = router;