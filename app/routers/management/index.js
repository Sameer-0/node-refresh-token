const router = require('express').Router();
const {
    check,
    validationResult
} = require('express-validator');
const controller = require('../../controllers/management/index');

router.get('/academic-year', controller.getIAcadYearPage);
router.post('/academic-year', controller.updateAcadYear)
router.get('/buildings', controller.getBuildingPage)
router.post('/buildings/add', controller.getAdd)
module.exports = router;