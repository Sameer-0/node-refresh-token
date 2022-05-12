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
router.post('/faculties/create', validate('JsonValidator'), index.create)
router.post('/faculties/search', validate('search'), index.search)
router.post('/faculties/pagination', index.pagination)
router.post('/faculties/findone', validate('single'), index.findOne)
router.post('/faculties/update', validate('JsonValidator'), index.update)
router.post('/faculties/delete', validate('delete'), index.delete)
router.get('/faculties/getslotsbyid', validate('single'), index.getSlotsById)



//Faculty Date Time
router.get('/faculties/date-time', dateTimes.getPage)
router.post('/faculties/date-time/create', dateTimes.create)
router.get('/faculties/date-time/search', dateTimes.search)
router.post('/faculties/date-time/pagination', dateTimes.pagination)
router.post('/faculties/date-time/delete', validate('delete'), dateTimes.delete)


//Batch
router.get('/faculties/batch', batch.getPage)
router.post('/faculties/batch/create', validate('JsonValidator'), batch.create)
router.get('/faculties/batch/search', validate('search'), batch.search)
router.post('/faculties/batch/pagination', batch.pagination)
router.post('/faculties/batch/update', validate('JsonValidator'), batch.update)
router.post('/faculties/batch/delete', validate('delete'), batch.delete)

//faculty works
router.get('/faculties/works', works.getPage)
router.post('/faculties/works/create', validate('JsonValidator'), works.create)
router.get('/faculties/works/search', validate('search'), works.search)
router.post('/faculties/works/pagination', works.pagination)
router.post('/faculties/works/update', validate('JsonValidator'), works.update)
router.post('/faculties/works/delete', validate('delete'), works.delete)

//workpreferences
router.get('/faculties/workpreferences', preferences.getPage)
router.post('/faculties/workpreferences/create', validate('JsonValidator'), preferences.create)
router.post('/faculties/workpreferences/search', preferences.search)
router.post('/faculties/workpreferences/pagination', preferences.pagination)
router.post('/faculties/workpreferences/update', validate('JsonValidator'), preferences.update)
router.post('/faculties/workpreferences/delete', validate('delete'), preferences.delete)
module.exports = router