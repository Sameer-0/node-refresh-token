const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const roomcontroller = require('../../controllers/management/rooms')
const roomslotscontroller = require("../../controllers/management/roomslots")
const roomtype = require('../../controllers/management/roomtype')
const bookings = require('../../controllers/management/bookings')
const validate = require('../../middlewares/validate')
const roomValidate = require('../../middlewares/roomValidate')
const transactionTypes = require('../../controllers/management/roomtransactiontypes')
const transactionStage = require('../../controllers/management/roomtransactionstages')
const transaction = require('../../controllers/management/roomtransactions')
const RoomRequest = require('../../controllers/management/RoomRequest')

//ROOM ROUTER
router.get('/rooms', roomcontroller.getPage)
router.get('/rooms/room', roomcontroller.getRoomPage)
router.get('/rooms/findone', roomcontroller.findOne)
router.put('/rooms', validate('JsonValidator'), roomcontroller.update)
router.delete('/rooms/room', validate('delete'), roomcontroller.delete)
router.post('/rooms', validate('JsonValidator'), roomcontroller.addRoom)
router.get('/rooms/search', validate('search'), roomcontroller.searchRoom)
router.post('/rooms/rooms_isprocessed', roomcontroller.isProcessed)
router.post('/rooms/buildinglist', roomcontroller.buildingList)
router.post('/rooms/pagination', validate('pagination'), roomcontroller.pagination)
router.post('/rooms/room/getroomtimeslots', roomcontroller.getRoomTimeSlots)

//ROOM TYPE ROUTER
router.get('/rooms/roomtypes', roomtype.getPage)
router.put('/rooms/roomtypes', validate('updateRoomType'), roomtype.update)
router.post('/rooms/roomtypes', validate('createRoomType'), roomtype.create)
router.get('/rooms/roomtypes/single', validate('single'), roomtype.single)
router.get('/rooms/roomtypes/search', validate('search'), roomtype.search)
router.delete('/rooms/roomtypes', roomtype.delete)
router.patch('/rooms/roomtypes', roomtype.deleteAll)

//ROOM SLOTS ROUTER
router.get('/room/slots', roomslotscontroller.getPage)


//ROOM BOOKING

router.get('/rooms/bookings', bookings.getPage)


//ROOM TRANSACTION
router.get('/rooms/bookings/transaction-types', transactionTypes.getPage)
router.delete('/rooms/bookings/transaction-types', transactionTypes.delete)
router.patch('/rooms/bookings/transaction-types', transactionTypes.deleteAll)
router.get('/rooms/bookings/transaction-types/findOne', validate('single'), transactionTypes.findOne)
router.post('/rooms/bookings/transaction-types', validate('JsonValidator'), transactionTypes.create)
router.put('/rooms/bookings/transaction-types', validate('JsonValidator'), transactionTypes.update)
router.get('/rooms/bookings/transaction-types/search', validate('search'), transactionTypes.search)
router.post('/rooms/bookings/transaction-types/pagination', validate('pagination'), transactionTypes.pagination)

//ROOM TRANSACTION STAGE:
router.get('/rooms/bookings/transaction-stages', transactionStage.getPage)
router.put('/rooms/bookings/transaction-stages', validate('updateRtstage'), transactionStage.update)
router.post('/rooms/bookings/transaction-stages', validate('createRtstage'), transactionStage.create)
router.get('/rooms/bookings/transaction-stages/findOne', validate('single'), transactionStage.findOne)
router.get('/rooms/bookings/transaction-stages/search', validate('search'), transactionStage.search)
router.delete('/rooms/bookings/transaction-stages', transactionStage.delete)
router.patch('/rooms/bookings/transaction-stages', transactionStage.deleteAll)



// ROOM TRANSACTION
router.get('/rooms/bookings/transactions', transaction.getPage)
router.post('/rooms/bookings/transactions/findOne', transaction.findOne)
router.post('/rooms/bookings/transactions/approve-trans', transaction.approveTrans)
router.get('/rooms/bookings/transactions/search', validate('search'), transaction.search)


//ROOM REQUESTS
router.get('/rooms/requests', RoomRequest.getPage)
router.get('/rooms/requests/search', validate('search'), RoomRequest.search)
router.post('/rooms/requests/pagination', validate('pagination'), RoomRequest.pagination)
router.get('/rooms/requests/roomInfo', RoomRequest.roomInfo)
router.patch('/rooms/requests', RoomRequest.requestApproval)

module.exports = router;