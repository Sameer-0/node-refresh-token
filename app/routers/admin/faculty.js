const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/faculty/index')
const works =  require('../../controllers/admin/faculty/works')
const dateTimes = require('../../controllers/admin/faculty/dateTimes')
const preferences = require('../../controllers/admin/faculty/preferences')
const batch = require('../../controllers/admin/faculty/batch')
const validate = require('../../middlewares/validate')

//Faculty
router.get('/faculties', index.getPage)
router.post('/faculties', validate('JsonValidator'), index.create)
router.get('/faculties/search', validate('search'), index.search)
router.post('/faculties/pagination', index.pagination)
router.get('/faculties/findOne', validate('single'), index.findOne)
router.put('/faculties', validate('JsonValidator'), index.update)


//Faculty Date Time
router.get('/faculties/date-time', dateTimes.getPage)
router.post('/faculties/date-time', dateTimes.create)
router.get('/faculties/date-time/search', dateTimes.search)
router.post('/faculties/date-time/pagination', dateTimes.pagination)

//Batch
router.get('/faculties/batch', batch.getPage)
router.post('/faculties/batch', validate('JsonValidator'), batch.create)
router.get('/faculties/batch/search', validate('search'), batch.search)
router.post('/faculties/batch/pagination', batch.pagination)
router.put('/faculties/batch', validate('JsonValidator'), batch.update)

//faculty works
router.get('/faculties/works', works.getPage)
router.post('/faculties/works', validate('JsonValidator'), works.create)
router.get('/faculties/works/search', validate('search'), works.search)
router.post('/faculties/works/pagination', works.pagination)

//workpreferences
router.get('/faculties/workpreferences', preferences.getPage)
router.post('/faculties/workpreferences', validate('JsonValidator'), preferences.create)
router.get('/faculties/workpreferences/search', preferences.search)
router.post('/faculties/workpreferences/pagination', preferences.pagination)
module.exports = router