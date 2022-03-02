const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const program = require("../../controllers/admin/program")
const programType = require('../../controllers/admin/programType')
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//PROGRAM ROUTER
router.get('/programs', program.getPage)


// PROGRAM TYPE ROUTER
router.get('/programs/types', programType.getProgramTypePage)
router.post('/programs/types', validate('createProgramType'), programType.create)
router.put('/programs/types', validate('updateProgramType'), programType.update)
router.delete('/programs/types',  programType.delete)
router.get('/programs/types/findOne', programType.findOne)
router.get('/programs/types/search', validate('search'), programType.search)
router.patch('/programs/types',  programType.deleteAll)
router.post('/programs/pagination', validate('pagination'), programType.pagination)
module.exports = router;