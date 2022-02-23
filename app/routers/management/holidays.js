const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const holiday = require('../../controllers/management/holidays');
const holidaytype = require('../../controllers/management/holidaytypes');
const validate = require('../../middlewares/validate')


// HOLIDAY ROUTER
router.get('/holidays', holiday.getPage)
router.get('/holidays/search', holiday.search)

// HOLIDAY TYPES ROUTER
router.get('/holidays/types', holidaytype.getPage)
router.post('/holidays/types', validate('Holiday'), holidaytype.create)
router.get('/holidays/types/findOne', validate('Holiday'), holidaytype.findOne)
router.get('/holidays/types/search', validate('search'), holidaytype.search)
router.put('/holidays/types', validate('Holiday'), holidaytype.update)
router.delete('/holidays/types', holidaytype.delete)
router.patch('/holidays/types', holidaytype.deleteAll)
module.exports = router;