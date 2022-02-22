const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const dashboard = require('../../controllers/management/dashboard');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')


// ROOM TRANSACTION STATGE =  rtstage
router.get('/room/rtstage', rtscontroller.getPage)
router.put('/room/rtstage', validate('updateRtstage'), rtscontroller.update)
router.post('/room/rtstage', validate('createRtstage'), rtscontroller.create)
router.get('/room/rtstage/single', validate('single'), rtscontroller.single)
router.get('/room/rtstage/search', validate('search'), rtscontroller.search)
router.delete('/room/rtstage', validate('delete'), rtscontroller.delete)




// ROOM TRANSACTION
router.get('/room/transaction', roomtransactioncontroller.getPage)
router.post('/room/transaction/single', roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans', roomtransactioncontroller.approveTrans)
router.get('/room/transaction/search', validate('search'), roomtransactioncontroller.search)

module.exports = router;