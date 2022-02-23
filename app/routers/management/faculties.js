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


// FACULTY ROUTER
router.get('/faculties', faculties.getPage)
router.post('/faculties', validate('JsonValidator'), faculties.create)
router.put('/faculties', validate('JsonValidator'), faculties.update)
router.post('/faculties/pagination', validate('pagination'), faculties.getPage)
router.get('/faculties/findOne', validate('single'), faculties.findOne)
router.get('/faculties/search', validate('search'), faculties.search)
router.delete('/faculties', faculties.delete)
router.patch('/faculties', faculties.deleteAll)


// FACULTY TYPES ROUTER
router.get('/faculties/types', types.getPage)
router.post('/faculties/types', validate('FacultyType'), types.create)
router.get('/faculties/types/findOne', validate('single'), types.findOne)
router.get('/faculties/types/search', validate('search'), types.search)
router.put('/faculties/types', validate('FacultyType'), types.update)
router.delete('/faculties/types', types.delete)
router.patch('/faculties/types', types.deleteAll)


// FACULTY SLOATS ROUTER
router.get('/faculties/slots', slots.getPage)
module.exports = router;