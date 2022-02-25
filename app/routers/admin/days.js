const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const days =  require('../../controllers/admin/days')

router.get('/days', days.getPage)

module.exports = router;