const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/rescheduling/index')

//RESCHEDULING EVENTS
router.get('/rescheduling', index.getPage)
router.post('/rescheduling/fetch-bulk-cancel', index.fetchBulkCancel)
router.post('/rescheduling/get-replacing-faculties', index.getReplacingFaculties)
router.post('/rescheduling/fetch-bulk-cancel-pagination', index.fetchBulkCancelPagination)
router.post('/rescheduling/show-entries', index.showEntries)
router.post('/rescheduling/fetch-faculties-date-range', index.facultiesDateRange)
router.post('/rescheduling/get-extra-class-faculties', index.getExtraClassFaculties)
router.post('/rescheduling/findby-programid', index.findByProgramId)
router.post('/rescheduling/find-division-by-programid-acadsession', index.findByDivisionByProgramSession)
router.post('/rescheduling/find-by-div-program-session', index.findBySchelDivisionByProgramSession)
router.post('/rescheduling/get-new-extra-lectures/', index.getNewExtraLectures)
router.post('/rescheduling/get-cancelled-lectures', index.getCancelledLectures)
router.post('/rescheduling/get-faculties', index.getResFaculties)
router.post('/rescheduling/get-slots', index.getResSlots)
router.post('/rescheduling/get-faculties-rooms-modify', index.getResFacultiesRooms)
router.post('/reschedule/get-rooms', index.getResRooms)

module.exports = router