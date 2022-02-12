const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const program = require("../../controllers/management/program")
const programType = require('../../controllers/management/programType')
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//PROGRAM ROUTER
router.get('/program', program.getPage)


// PROGRAM TYPE ROUTER
router.get('/program/list', programType.getProgramTypePage)
router.post('/program/programType', validate('createProgramType'), programType.createProgramType)
router.put('/program/list', validate('updateProgramType'), programType.updateProgramTypeById)
router.delete('/program/list', validate('delete'), programType.deleteProgramTypeById)
router.get('/program/ptypes/single', programType.getProgramTypeById)
router.get('/room/ptypes/search', validate('search'), programType.search)

module.exports = router;