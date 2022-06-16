const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');
const validate = require('../../middlewares/validate')
const courseworkload = require('../../controllers/admin/courseworkload/workload')
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
router.post('/courseworkload/workload/create', validate('JsonValidator'), courseworkload.create)
router.post('/courseworkload/workload/create', validate('JsonValidator'), courseworkload.create)

//Course preference

router.get('/courseDayRoomPreference', preference.getPage)
router.post('/courseDayRoomPreference/create', preference.create)
router.post('/courseDayRoomPreference/search', preference.search)
router.post('/courseDayRoomPreference/pagination', preference.pagination)
router.post('/courseDayRoomPreference/acadSessionList', validate('isArrayNumber'), preference.acadSessionList)
router.post('/courseDayRoomPreference/courseList', preference.courseList)
router.post('/courseDayRoomPreference/divList', preference.divList)
router.post('/courseDayRoomPreference/refresh', preference.refresh)
router.post('/courseDayRoomPreference/batch-by-divisionid', validate('isArrayNumber'), preference.batchByDivisionId)
router.post('/courseDayRoomPreference/find-semester-by-programid',  preference.findSemesterByProgramId)
router.post('/courseDayRoomPreference/find-module-by-programid-semesterid',  preference.findModuleByProgramIdSemId)
router.post('/courseDayRoomPreference/find-division-by-moduleid',  preference.findDivisionByModuleId)
router.post('/courseDayRoomPreference/filter-records',  preference.filterPreference)
router.post('/courseDayRoomPreference/occupiedroomdays', preference.occupiedRoomDays)
module.exports = router