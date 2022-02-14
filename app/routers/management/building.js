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
router.put('/building', validate('updateBuilding'), building.update)
// router.post('/buildings', validate('createBuilding'), building.create)
router.post('/buildings', building.create)
router.post('/building/pagination', validate('pagination'), building.getPage)
router.get('/building/single', validate('single'), building.single)
router.get('/building/search', validate('search'), building.search)
router.delete('/building', validate('delete'), building.delete)

module.exports = router;