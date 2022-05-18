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
const roomRequest = require('../../controllers/admin/rooms/RoomRequest')
const buildings =  require('../../controllers/management/building')


router.get('/rooms', room.getPage)
router.post('/rooms/search', room.search)
router.post('/rooms/pagination', room.pagination)
router.post('/rooms/create', validate('JsonValidator'),  room.create)
router.post('/rooms/delete', validate('delete'), room.delete)

//Room booking
router.get('/rooms/booking', room.getBookingPage)
router.post('/rooms/booking/getbuildingbycampusid', buildings.getBuildingByCampusId)
router.post('/rooms/booking/getroomsbybuildingid', room.getroomsbybuildingid)


//ROOM TRANSACTION DETAILS
router.post('/rooms/details', details.findByLid)




//ROOM APPROVAL
router.post('/rooms/approval', approval.ApproveRequest)


///rooms/requests
router.get('/rooms/requests', roomRequest.getPage)
router.post('/rooms/requests/search', validate('search'), roomRequest.search)
router.post('/rooms/requests/pagination', validate('pagination'), roomRequest.pagination)
module.exports = router