const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const transactions =  require('../../controllers/admin/room-transactions/index')

router.get('/room-transactions', transactions.getPage)
router.get('/room-transactions/search', transactions.search)
router.post('/room-transactions/pagination', transactions.pagination)
module.exports = router