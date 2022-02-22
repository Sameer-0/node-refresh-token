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
// router.post('/organizations', validate('JsonValidator'), organization.create)
// router.put('/organizations', validate('JsonValidator'), organization.update)
// router.delete('/organizations',  organization.delete)
// router.patch('/organizations',  organization.deleteAll)
// router.post('/organization/pagination', validate('pagination'), organization.getPage)
// router.post('/organization/single', validate('single'), organization.single)
// router.post('/organization/search', validate('search'), organization.search)



// HOLIDAY TYPES ROUTER
router.get('/holidays/types', holidaytype.getPage)
router.post('/holidays/types', validate('Holiday'), holidaytype.create)
router.get('/holidays/types/findOne', validate('Holiday'), holidaytype.findOne)
router.get('/holidays/types/search', validate('search'), holidaytype.search)
router.put('/holidays/types', validate('Holiday'), holidaytype.update)
router.delete('/holidays/types', holidaytype.delete)
router.patch('/holidays/types', holidaytype.deleteAll)
module.exports = router;