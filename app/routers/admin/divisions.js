const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/divisions/index')
const batch = require('../../controllers/admin/divisions/batch')

router.get('/divisions', index.getPage)
router.put('/divisions', index.update)
router.get('/divisions/search', index.search)
router.post('/divisions/pagination', index.pagination)
router.post('/divisions/changestatus', index.changestatus)
router.get('/divisions/getAll', index.getAll)

//BATCHES
router.get('/divisions/batches', batch.getPage)
router.get('/divisions/batches/search', batch.search)
router.post('/divisions/batches/pagination', batch.pagination)
router.post('/divisions/batches/changestatus', batch.changestatus)
router.get('/divisions/batches/getAll', batch.getAll)
router.put('/divisions/batches', batch.update)

module.exports = router