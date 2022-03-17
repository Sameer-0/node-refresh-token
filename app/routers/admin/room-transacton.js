const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const validate = require('../../middlewares/validate')
const transactions =  require('../../controllers/admin/room-transactions/index')
const details =  require('../../controllers/admin/room-transactions/details')


router.get('/room-transactions', transactions.getPage)
router.get('/room-transactions/search', transactions.search)
router.post('/room-transactions/pagination', transactions.pagination)
router.post('/room-transactions', validate('JsonValidator'),  transactions.create)




//ROOM TRANSACTION DETAILS
router.get('/room-transactions/details', details.findByLid)
module.exports = router