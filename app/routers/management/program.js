const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const program = require("../../controllers/management/program")
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//PROGRAM ROUTER
router.get('/programs', program.getPage)




module.exports = router;