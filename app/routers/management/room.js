const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const roomcontroller = require('../../controllers/management/rooms')
const roomslotscontroller = require("../../controllers/management/roomslots")
const roomtype = require('../../controllers/management/roomtype')
const validate = require('../../middlewares/validate')
const roomValidate = require('../../middlewares/roomValidate')

//ROOM ROUTER
router.get('/rooms', roomcontroller.getPage)
router.get('/rooms/findone', roomcontroller.findOne)
router.put('/rooms', validate('JsonValidator'), roomcontroller.update)
router.delete('/rooms', roomcontroller.delete)
router.post('/rooms', validate('JsonValidator'), roomcontroller.addRoom)
router.get('/room/search', validate('search'), roomcontroller.searchRoom)
router.patch('/rooms', roomcontroller.deleteAll)

//ROOM TYPE ROUTER
router.get('/room/roomtype', roomtype.getPage)
router.put('/room/roomtype', validate('updateRoomType'), roomtype.update)
router.post('/room/roomtype', validate('createRoomType'), roomtype.create)
router.get('/room/roomtype/single', validate('single'), roomtype.single)
router.get('/room/roomtype/search', validate('search'), roomtype.search)
router.delete('/room/roomtype/delete', validate('delete'), roomtype.delete)


//ROOM SLOTS ROUTER
router.get('/room/slots', roomslotscontroller.getPage)

module.exports = router;