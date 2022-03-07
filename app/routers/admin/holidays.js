const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');


const holidays = require('../../controllers/admin/holidays/index')
const validate = require('../../middlewares/validate')


router.get('/holidays', holidays.getPage)
router.post('/holidays', validate('JsonValidator') , holidays.create)
router.put('/holidays', validate('JsonValidator'), holidays.update)
router.delete('/holidays', holidays.delete)
// router.patch('/holidays', types.deleteAll)
router.get('/holidays/findOne', holidays.findOne)
 router.get('/holidays/search',validate('search'), holidays.search)
router.post('/holidays/pagination', holidays.pagination)

module.exports = router