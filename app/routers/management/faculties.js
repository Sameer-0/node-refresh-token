const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const faculties = require('../../controllers/management/faculties');
const types = require('../../controllers/management/facultytypes');
const slots = require('../../controllers/management/facultyslot');
const validate = require('../../middlewares/validate')
const facultypool = require('../../controllers/management/facultypool');

// FACULTY ROUTER
router.get('/faculties/faculty', faculties.getPage)
router.post('/faculties/faculty', validate('JsonValidator'), faculties.create)
router.put('/faculties/faculty', validate('JsonValidator'), faculties.update)
router.post('/faculties/faculty/pagination', validate('pagination'), faculties.pagination)
router.get('/faculties/facultyfindOne', validate('single'), faculties.findOne)
router.get('/faculties/faculty/search', validate('search'), faculties.search)
router.delete('/faculties/faculty', faculties.delete)
router.patch('/faculties/faculty', faculties.deleteAll)
router.post('/faculties/faculty/processing', faculties.processing)
router.get('/faculties/faculty/GetAll', faculties.GetAll)
router.post('/faculties/faculty/fetchformsap', faculties.fetchFromSAP)

// FACULTY TYPES ROUTER
router.get('/faculties/types', types.getPage)
router.post('/faculties/types', validate('JsonValidator'), types.create)
router.get('/faculties/types/findOne', validate('single'), types.findOne)
router.get('/faculties/types/search', validate('search'), types.search)
router.post('/faculties/types/update', validate('JsonValidator'), types.update)
router.post('/faculties/types/delete', types.delete)
router.post('/faculties/pagination', validate('pagination'), types.pagination)

// FACULTY SLOATS ROUTER
router.get('/faculties/slots', slots.getPage)


//FACULTY POOL
// FACULTY ROUTER
router.get('/faculties', facultypool.getPage)
router.post('/faculties/refresh', facultypool.refresh)
// router.post('/faculties/faculty', validate('JsonValidator'), faculties.create)
// router.put('/faculties/faculty', validate('JsonValidator'), faculties.update)
// router.post('/faculties/faculty/pagination', validate('pagination'), faculties.pagination)
// router.get('/faculties/facultyfindOne', validate('single'), faculties.findOne)
// router.get('/faculties/faculty/search', validate('search'), faculties.search)
// router.delete('/faculties/faculty', faculties.delete)
// router.patch('/faculties/faculty', faculties.deleteAll)
// router.post('/faculties/faculty/processing', faculties.processing)
// router.get('/faculties/faculty/GetAll', faculties.GetAll)
// router.post('/faculties/faculty/fetchformsap', faculties.fetchFromSAP)
module.exports = router;