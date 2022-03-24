const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/faculty/index')
const works =  require('../../controllers/admin/faculty/works')
const dateTimes = require('../../controllers/admin/faculty/dateTimes')
router.get('/faculties', index.getPage)

router.get('/faculties/date-time', dateTimes.getPage)





//faculty works
router.get('/faculties/works', works.getPage)
module.exports = router