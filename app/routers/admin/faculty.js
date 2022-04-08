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

router.get('/faculties', index.getPage)
router.post('/faculties', validate('JsonValidator'), index.create)
router.get('/faculties/search', validate('search'), index.search)
router.post('/faculties/pagination', index.pagination)




router.get('/faculties/date-time', dateTimes.getPage)

router.get('/faculties/batch', batch.getPage)

//faculty works
router.get('/faculties/works', works.getPage)

//workpreferences
router.get('/faculties/workpreferences', preferences.getPage)
module.exports = router