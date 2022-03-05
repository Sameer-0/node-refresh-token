const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const session =  require('../../controllers/admin/sessions/sessions')
const types =  require('../../controllers/admin/sessions/types')

//Session
router.get('/sessions', session.getPage)

router.delete('/sessions/GetAll', session.getPage)
router.put('/sessions/GetAll', session.getPage)
router.get('/sessions/search', session.getPage)
router.get('/sessions/findOne', session.getPage)
router.get('/sessions/pagination', session.getPage)

//Session Type
router.get('/sessions/types', types.getPage)
router.post('/sessions/types', types.create)
router.put('/sessions/types', types.update)
router.delete('/sessions/types', types.delete)
router.patch('/sessions/types', types.deleteAll)
router.get('/sessions/types/findOne', types.findOne)
router.get('/sessions/types/search', types.search)
router.post('/sessions/types/pagination', types.pagination)

//Session Dates
router.get('/sessions/dates', types.getPage)
router.post('/sessions/dates', types.create)
router.put('/sessions/dates', types.update)
router.delete('/sessions/dates', types.delete)
router.patch('/sessions/dates', types.deleteAll)
router.get('/sessions/dates/findOne', types.findOne)
router.get('/sessions/dates/search', types.search)
router.post('/sessions/dates/pagination', types.pagination)
module.exports = router;