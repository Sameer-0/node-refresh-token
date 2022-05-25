const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');
const validate = require('../../middlewares/validate')
const courseworkload =  require('../../controllers/admin/courseworkload/workload')
const preference = require('../../controllers/admin/courseworkload/preference')
const index = require('../../controllers/admin/courseworkload/index')

router.get('/courseworkload', index.getPage)
router.post('/courseworkload', index.fetchFromSAP)
// router.post('/courseworkload', courseworkload.fetchFromSAP)
// router.post('/courseworkload/changestatus', courseworkload.changestatus)
// router.get('/courseworkload/getAll', courseworkload.getAll)
// router.get('/courseworkload/search', courseworkload.search)
// router.post('/courseworkload/pagination', courseworkload.pagination)
// router.put('/courseworkload', validate('JsonValidator'), courseworkload.update)


//WORKLOAD
router.get('/courseworkload/workload', courseworkload.getPage)
router.post('/courseworkload/workload/changestatus', courseworkload.changestatus)
router.get('/courseworkload/workload/getAll', courseworkload.getAll)
router.post('/courseworkload/workload/search', courseworkload.search)
router.post('/courseworkload/workload/pagination', courseworkload.pagination)
router.post('/courseworkload/workload/update', validate('JsonValidator'), courseworkload.update)

//Course preference
router.get('/courseworkload/preference', preference.getPage)
router.post('/courseworkload/preference/search', preference.search)
router.post('/courseworkload/preference/pagination', preference.pagination)
router.post('/courseworkload/preference/acadSessionList', validate('isArrayNumber'), preference.acadSessionList)
router.post('/courseworkload/preference/courseList', preference.courseList)
router.post('/courseworkload/preference/divList', preference.divList)
router.post('/courseworkload/preference/refresh', preference.refresh)
router.post('/courseworkload/preference/batch-by-divisionid', validate('isArrayNumber'), preference.batchByDivisionId)
router.post('/courseworkload/preference/find-semester-by-programid',  preference.findSemesterByProgramId)
router.post('/courseworkload/preference/find-module-by-programid-semesterid',  preference.findModuleByProgramIdSemId)
module.exports = router