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
router.get('/programs/search', validate('search'), program.search)

// PROGRAM TYPE ROUTER
router.get('/programs/types', programType.getProgramTypePage)
router.post('/programs/types', validate('createProgramType'), programType.create)
router.put('/programs/types', validate('updateProgramType'), programType.update)
router.delete('/programs/types',  programType.delete)
router.get('/programs/types/findOne', programType.findOne)
router.get('/programs/types/search', validate('search'), programType.search)
router.patch('/programs/types',  programType.deleteAll)
router.post('/programs/pagination', validate('pagination'), programType.pagination)


//PROGRAM DAYS
router.get('/programs/days', days.getPage)
router.post('/programs/days/pagination', days.pagination)
router.get('/programs/days/search', days.search)
router.patch('/programs/days', days.changeStatus)
router.get('/programs/days/GetAll', days.getAll)

//PROGRAM SESSIONS
router.get('/programs/sessions', sessions.getPage)
router.post('/programs/sessions/pagination', validate('pagination'), sessions.pagination)
router.get('/programs/sessions/search', validate('search'), sessions.search)
module.exports = router;