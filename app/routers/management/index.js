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
router.post('/buildings/fetch-single', controller.getSingleBuilding)
router.post('/buildings/update', controller.updateBuilding)
module.exports = router;