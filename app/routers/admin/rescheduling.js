const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/rescheduling/index')
router.get('/rescheduling', index.getPage)


module.exports = router