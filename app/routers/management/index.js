const router = require('express').Router();
const controller = require('../../controllers/management/index');

router.get('/academic-year', controller.getIndex);
router.post('/academic-year',controller.addAcadYear)

module.exports = router;