const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/mis/index')
const pivoted =  require('../../controllers/admin/mis/pivoted')
const facultydaywise =  require('../../controllers/admin/mis/facultydaywise')


router.get('/mis/simulation-chart', index.getPage) 
router.get('/mis/simulation-chart/pivoted', pivoted.getPage) 
router.get('/mis/simulation-chart/faculty-day-wise', facultydaywise.getPage) 
router.post('/mis/simulation-chart/faculty-day-wise', facultydaywise.facultyDayWise) 
module.exports = router;