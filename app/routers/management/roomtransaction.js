const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const dashboard = require('../../controllers/management/dashboard');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')







// ROOM TRANSACTION
router.get('/room/transaction', roomtransactioncontroller.getPage)
router.post('/room/transaction/single', roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans', roomtransactioncontroller.approveTrans)
router.get('/room/transaction/search', validate('search'), roomtransactioncontroller.search)

module.exports = router;