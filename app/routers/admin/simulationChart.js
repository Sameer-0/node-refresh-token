const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/simulationChart/index')

router.get('/simulation-chart', index.getPage) 


module.exports = router;