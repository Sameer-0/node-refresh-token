const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');
const validate = require('../../middlewares/validate')
const courseworkload =  require('../../controllers/admin/courseworkload/index')
const preference = require('../../controllers/admin/courseworkload/preference')


router.get('/courseworkload', courseworkload.getPage)
router.post('/courseworkload', courseworkload.fetchFromSAP)
router.post('/courseworkload/changestatus', courseworkload.changestatus)
router.get('/courseworkload/getAll', courseworkload.getAll)
router.get('/courseworkload/search', courseworkload.search)
router.post('/courseworkload/pagination', courseworkload.pagination)
router.put('/courseworkload', validate('JsonValidator'), courseworkload.update)

//Course preference
router.get('/courseworkload/preference', preference.getPage)
router.get('/courseworkload/preference/search', preference.search)
router.post('/courseworkload/preference/pagination', preference.pagination)
router.post('/courseworkload/preference/acadSessionList',preference.acadSessionList)
router.post('/courseworkload/preference/courseList',preference.courseList)
router.post('/courseworkload/preference/divList',preference.divList)
module.exports = router