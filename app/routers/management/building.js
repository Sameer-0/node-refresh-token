const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const building = require('../../controllers/management/building');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// BUILDING ROUTER
router.get('/buildings', building.getPage)
router.put('/buildings', validate('JsonValidator'), building.update)
router.post('/buildings',validate('JsonValidator'), building.create)
router.post('/building/pagination', validate('pagination'), building.getPage)
router.get('/buildings/findOne', validate('single'), building.findOne)
router.get('/building/search', validate('search'), building.search)
router.delete('/buildings',  building.delete)

module.exports = router;