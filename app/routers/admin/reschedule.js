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
module.exports = router