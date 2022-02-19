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
router.get('/campus/findOne', validate('single'), campus.findOne)
router.delete('/campuses',  campus.delete)
router.patch('/campuses',  campus.deleteAll)
module.exports = router;