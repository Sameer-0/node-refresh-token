const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const campus = require('../../controllers/management/campus');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// CAMPUS ROUTER
router.get('/campuses', campus.getCampusPage)
router.put('/campuses', validate('JsonValidator'), campus.update)
router.post('/campuses', validate('JsonValidator'),  campus.create)
router.post('/campus', validate('pagination'), campus.getCampusPage)
router.get('/campus/search', validate('search'), campus.search)
router.get('/campus/single', validate('single'), campus.single)
router.delete('/campus', validate('delete'), campus.delete)

module.exports = router;