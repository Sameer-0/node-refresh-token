const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const courseworkload =  require('../../controllers/admin/courseworkload/index')

router.get('/courseworkload', courseworkload.getPage)
router.post('/courseworkload', courseworkload.fetchFromSAP)
router.post('/courseworkload/changestatus', courseworkload.changestatus)
router.get('/courseworkload/getAll', courseworkload.getAll)
router.get('/courseworkload/search', courseworkload.search)
router.post('/courseworkload/pagination', courseworkload.pagination)
module.exports = router