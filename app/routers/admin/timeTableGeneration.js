const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/timeTableGeneration/index')
router.get('/time-table-generation', index.getPage)


module.exports = router