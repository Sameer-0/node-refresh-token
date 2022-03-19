const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/weeklyConstraint/index')

router.get('/weekly-constraint', index.getPage)
router.post('/weekly-constraint', index.create)
router.get('/weekly-constraint/findOne', index.findOne)
router.put('/weekly-constraint', index.update)
router.delete('/weekly-constraint', index.delete)


module.exports = router