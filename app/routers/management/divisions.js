const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const divisionBatch = require('../../controllers/management/divisionBatch')
const division = require('../../controllers/management/division')
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//DIVISION ROUTER
router.get('/divisions', division.getPage)
router.post('/divisions', validate('createDivision'), division.addDivision)
router.get('/divisions/single', division.getDivisionById)
router.put('/divisions/single', validate('updateDivision'), division.updateDivisionById)
router.delete('/divisions/single', validate('delete'), division.deleteDivisionById)
router.get('/divisions/search', validate('search'), division.search)


// DIVISION BATCHES
router.get('/divisions/batches', divisionBatch.getPage)
router.post('/divisions/batches/add', validate('createDivBatch'), divisionBatch.createBatch)
router.get('/division/batches/single', divisionBatch.getBatchById)
router.put('/division/batches', validate('updateDivBatch'), divisionBatch.updateBatchById)

module.exports = router;