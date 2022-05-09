const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const validate = require('../../middlewares/validate')
const room =  require('../../controllers/admin/rooms/index')
const details =  require('../../controllers/admin/rooms/details')
const approval =  require('../../controllers/admin/rooms/approval')
const RoomRequest = require('../../controllers/admin/rooms/RoomRequest')



router.get('/rooms', room.getPage)
router.get('/rooms/search', room.search)
router.post('/rooms/pagination', room.pagination)
router.post('/rooms/create', validate('JsonValidator'),  room.create)
router.post('/rooms/delete', validate('delete'), room.delete)

//Room booking
router.get('/rooms/booking', room.getBookingPage)


//ROOM TRANSACTION DETAILS
router.get('/rooms/details', details.findByLid)




//ROOM APPROVAL
router.post('/rooms/approval', approval.ApproveRequest)


///rooms/requests
router.get('/rooms/requests', RoomRequest.getPage)
router.get('/rooms/requests/search', validate('search'), RoomRequest.search)
router.post('/rooms/requests/pagination', validate('pagination'), RoomRequest.pagination)
module.exports = router