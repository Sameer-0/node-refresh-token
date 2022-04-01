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

router.get('/rooms', room.getPage)
router.get('/rooms/search', room.search)
router.post('/rooms/pagination', room.pagination)
router.post('/rooms', validate('JsonValidator'),  room.create)




//ROOM TRANSACTION DETAILS
router.get('/rooms/details', details.findByLid)




//ROOM APPROVAL
router.get('/rooms/approval', approval.getPage)
module.exports = router