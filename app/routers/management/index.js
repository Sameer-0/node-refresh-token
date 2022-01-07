const router = require('express').Router();
const controller = require('../../controllers/management/index');

router.get('/academic-year', controller.getIAcadYearPage);
router.post('/academic-year',controller.updateAcadYear)
router.get('/buildings',controller.getBuildingPage)
module.exports = router;