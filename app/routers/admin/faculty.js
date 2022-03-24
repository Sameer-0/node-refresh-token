const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const index =  require('../../controllers/admin/faculty/index')
const works =  require('../../controllers/admin/faculty/works')
router.get('/faculties', index.getPage)







//faculty works
router.get('/faculties/works', works.getPage)
module.exports = router