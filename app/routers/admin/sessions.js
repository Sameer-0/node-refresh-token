const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const session =  require('../../controllers/admin/sessions/sessions')
const types =  require('../../controllers/admin/sessions/types')
const dates =  require('../../controllers/admin/sessions/dates')
const validate = require('../../middlewares/validate')

//Session
router.get('/sessions', session.getPage)

router.delete('/sessions/GetAll', session.getPage)
router.put('/sessions/GetAll', session.getPage)
router.get('/sessions/search', session.getPage)
router.get('/sessions/findOne', session.getPage)
router.get('/sessions/pagination', session.getPage)

//Session Type
router.get('/sessions/types', types.getPage)
router.post('/sessions/types', validate('SessionType') , types.create)
router.put('/sessions/types', validate('SessionType'), types.update)
router.delete('/sessions/types', types.delete)
router.patch('/sessions/types', types.deleteAll)
router.get('/sessions/types/findOne', types.findOne)
router.get('/sessions/types/search', types.search)
router.post('/sessions/types/pagination', types.pagination)

//Session Dates
router.get('/sessions/dates', dates.getPage)
router.post('/sessions/dates', validate('JsonValidator'), dates.create)
router.put('/sessions/dates', validate('JsonValidator'), dates.update)
router.delete('/sessions/dates', dates.delete)
router.patch('/sessions/dates', dates.deleteAll)
router.get('/sessions/dates/findOne', dates.findOne)
router.get('/sessions/dates/search', dates.search)
router.post('/sessions/dates/pagination', dates.pagination)
module.exports = router;