const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/weeklyConstraint/index')

router.get('/weekly-constraint', index.getPage)
router.post('/weekly-constraint', index.create)


module.exports = router