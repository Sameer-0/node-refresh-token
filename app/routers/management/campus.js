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
router.get('/campus', campus.getCampusPage)
router.put('/campus', validate('updateCampus'), campus.update)
// router.post('/campus', validate('createCampus'), campus.create)
router.post('/campus',  campus.create)
router.post('/campus/pagination', validate('pagination'), campus.getCampusPage)
router.get('/campus/search', validate('search'), campus.search)
router.get('/campus/single', validate('single'), campus.single)
router.delete('/campus', validate('delete'), campus.delete)

module.exports = router;