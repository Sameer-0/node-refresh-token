const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const days =  require('../../controllers/admin/days')

router.get('/days', days.getPage)
router.post('/days', days.changeStatus)
router.get('/days/GetAll', days.GetAll)
module.exports = router;