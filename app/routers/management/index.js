const router = require('express').Router();
const {
    check,
    validationResult
} = require('express-validator');
const buildingcontroller = require('../../controllers/management/building');
const campuscontroller = require('../../controllers/management/campus');


router.get('/academic-year', buildingcontroller.getIAcadYearPage);
router.post('/academic-year', buildingcontroller.updateAcadYear)

// BUILDING ROUTER
router.get('/building', buildingcontroller.getBuildingPage)
router.post('/building/add', buildingcontroller.getAdd)
router.post('/building/fetch-single', buildingcontroller.getSingleBuilding)
router.post('/building/update', buildingcontroller.updateBuilding)

// CAMPUS ROUTER
router.get('/campus',campuscontroller.getCampusPage)
router.post('/campus/add',campuscontroller.createCampus)
router.post('/campus/fetch-single',campuscontroller.getCampusById)
router.post('/campus/update',campuscontroller.updateCampus)
router.post('/campus/delete-single',campuscontroller.deleteById)
module.exports = router;