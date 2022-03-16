const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const courseworkload =  require('../../controllers/admin/courseworkload/index')

router.get('/courseworkload', courseworkload.getPage)
router.post('/courseworkload', courseworkload.fetchFromSAP)
module.exports = router