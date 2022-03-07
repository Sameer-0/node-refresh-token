const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');


const events =  require('../../controllers/admin/events/index')
const types =  require('../../controllers/admin/events/types')
const validate = require('../../middlewares/validate')


router.get('/events', events.getPage)

//EVENT TPES
router.get('/events/types', types.getPage)
router.post('/events/types', validate('EventType') , types.create)
router.put('/events/types', validate('EventType'), types.update)
router.delete('/events/types', types.delete)
router.patch('/events/types', types.deleteAll)
router.get('/events/types/findOne', types.findOne)
router.get('/events/types/search', types.search)
router.post('/events/types/pagination', types.pagination)
module.exports = router