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
const booking =  require('../../controllers/admin/rooms/booking')

router.get('/rooms', room.getPage)
router.post('/rooms/search', room.searchForBookedRooms)
router.post('/rooms/pagination', room.bookedRoompagination)
router.post('/rooms/book', validate('JsonValidator'),  room.create)
router.post('/rooms/delete', validate('delete'), room.delete)
router.post('/rooms/delete-room-detail', validate('delete'), details.delete)
router.get('/rooms/download', room.bookedRoomsDownloadMaster)
router.post('/rooms/show-entries', room.showEntries)


//Room booking
router.get('/rooms/booking', booking.getBookingPage)
router.post('/rooms/booking/getbuildingbycampusid', buildings.getBuildingByCampusId)
router.post('/rooms/booking/getroomsbybuildingid', booking.getroomsbybuildingid)
router.post('/rooms/booking/room-slot-by-room-id', booking.roomSlotByRoomId)
router.get('/rooms/booking/download', booking.downloadMaster)
router.post('/rooms/booking/show-entries', booking.showBookingEntries)


//ROOM TRANSACTION DETAILS
router.post('/rooms/details', details.findByLid)




//ROOM APPROVAL
router.post('/rooms/approval', approval.ApproveRequest)


///rooms/requests
router.get('/rooms/requests', roomRequest.getPage)
router.post('/rooms/requests/search', roomRequest.search)
router.post('/rooms/requests/pagination', validate('pagination'), roomRequest.pagination)
module.exports = router