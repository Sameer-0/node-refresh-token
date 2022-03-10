const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/divisions/index')
const batches = require('../../controllers/admin/divisions/batch')

router.get('/divisions', index.getPage)
router.get('/divisions/search', index.search)
router.post('/divisions/pagination', index.pagination)

//BATCHES
router.get('/divisions/batches', batches.getPage)

module.exports = router