const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const program = require("../../controllers/admin/programs/program")
const days = require("../../controllers/admin/programs/days")
const sessions = require("../../controllers/admin/programs/sessions")
const programType = require('../../controllers/admin/programs/programType')
const validate = require('../../middlewares/validate')


//PROGRAM ROUTER
router.get('/programs', program.getPage)
router.post('/programs/pagination', validate('pagination'), program.pagination)
router.post('/programs/update', validate('JsonValidator'), program.update)
router.get('/programs/search', validate('search'), program.search)
router.get('/programs/findone', validate('search'), program.findOne)
router.post('/programs/create', validate('JsonValidator'), program.create)
router.post('/programs/delete', validate('delete'), program.delete)



// PROGRAM TYPE ROUTER
router.get('/programs/types', programType.getProgramTypePage)
router.post('/programs/types/create', validate('createProgramType'), programType.create)
router.post('/programs/types/update', validate('updateProgramType'), programType.update)
router.post('/programs/types/delete',  programType.delete)
router.get('/programs/types/findone', programType.findOne)
router.get('/programs/types/search', validate('search'), programType.search)
router.post('/programs/pagination', validate('pagination'), programType.pagination)


//PROGRAM DAYS
router.get('/programs/days', days.getPage)
router.post('/programs/days/pagination', days.pagination)
router.get('/programs/days/search', days.search)
router.post('/programs/days/change', days.changeStatus)
router.get('/programs/days/GetAll', days.getAll)
router.post('/programs/days/refresh', days.refresh)


//PROGRAM SESSIONS
router.get('/programs/sessions', sessions.getPage)
router.post('/programs/sessions/pagination', validate('pagination'), sessions.pagination)
router.get('/programs/sessions/search', validate('search'), sessions.search)
router.post('/programs/sessions/refresh', sessions.refresh)

module.exports = router;