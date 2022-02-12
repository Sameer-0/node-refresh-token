const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const roomrejection = require("../../controllers/management/roombookingrejectionreasons")
const cancellationreasons = require("../../controllers/management/cancellationreasons")
const validator = require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// BOOKING REJECTION REASONS
router.get('/room/bookingrejectionreasons', roomrejection.getPage)
router.post('/room/bookingrejectionreasons', validate('createBookingRejectionReasons'), roomrejection.create)
router.put('/room/bookingrejectionreasons', validate('updateBookingRejectionReasons'), roomrejection.update)
router.get('/room/bookingrejectionreasons/search', validate('search'), roomrejection.search)
router.get('/room/bookingrejectionreasons/single', roomrejection.getById)
router.delete('/room/bookingrejectionreasons', roomrejection.delete)

//BOOKING CANCELLATION REASONS
router.get('/cancellationreasons', cancellationreasons.getPage)
router.post('/cancellationreasons', validate('createCancellationreasons'), cancellationreasons.create)
router.put('/cancellationreasons', validate('updateCancellationreasons'), cancellationreasons.update)
router.get('/cancellationreasons/single', validate('single'), cancellationreasons.single)
router.get('/cancellationreasons/search', validate('search'), cancellationreasons.search)
router.delete('/cancellationreasons', validate('delete'), cancellationreasons.delete)

module.exports = router;