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


// ROOM TRANSACTION TYPES =  rtypes
router.get('/room/rtypes', rtypescontroller.getPage)
router.post('/room/rtypes', validate('createRtypes'), rtypescontroller.create)
router.get('/room/rtypes/single', validate('single'), rtypescontroller.single)
router.put('/room/rtypes', validate('updateRtypes'), rtypescontroller.update)
router.delete('/room/rtypes', validate('delete'), rtypescontroller.delete)
router.get('/room/rtypes/search', validate('search'), rtypescontroller.search)

// ROOM TRANSACTION
router.get('/room/transaction', roomtransactioncontroller.getPage)
router.post('/room/transaction/single', roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans', roomtransactioncontroller.approveTrans)
router.get('/room/transaction/search', validate('search'), roomtransactioncontroller.search)

module.exports = router;