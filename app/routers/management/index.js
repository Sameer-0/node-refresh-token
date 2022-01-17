const router = require('express').Router();
const {
    check,
    validationResult
} = require('express-validator');

const buildingcontroller = require('../../controllers/management/building');
const campuscontroller = require('../../controllers/management/campus');
const orgcontroller = require('../../controllers/management/organization');
const dashcontroller = require('../../controllers/management/dashboard');
const roomcontroller = require('../../controllers/management/room');
const acadYearcontroller = require('../../controllers/management/academicYear');
const slugcontroller = require('../../controllers/management/slug');
const rtscontroller =  require("../../controllers/management/roomtransactionstages")
//ACADEMIC YEAR ROUTER
router.get('/academic-year', acadYearcontroller.getAcadYearPage)
router.post('/academic-year', acadYearcontroller.updateAcadYear)

// BUILDING ROUTER
router.get('/building', buildingcontroller.getBuildingPage)
router.post('/building', [check('pageNo', 'Invalid Page No').exists().trim().escape()], buildingcontroller.getBuildingPage)
router.post('/building/add', buildingcontroller.getAdd)
router.post('/building/fetch-single', buildingcontroller.getSingleBuilding)
router.post('/building/update', buildingcontroller.updateBuilding)
router.post('/building/delete-single', buildingcontroller.deleteById)
// CAMPUS ROUTER
router.get('/campus', campuscontroller.getCampusPage)
router.post('/campus', [check('pageNo', 'Invalid Page No').exists().trim().escape()], campuscontroller.getCampusPage)
router.post('/campus-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], campuscontroller.searchCampus)
router.post('/campus/add', campuscontroller.createCampus)
router.post('/campus/fetch-single', campuscontroller.getCampusById)
router.post('/campus/update', campuscontroller.updateCampus)
router.post('/campus/delete-single', campuscontroller.deleteById)

// ORGANIZATION ROUTER
router.get('/organization', orgcontroller.getPage)
router.post('/organization', [check('pageNo', 'Invalid Page No').exists().trim().escape()], orgcontroller.getPage)
router.post('/organization/add', orgcontroller.createOrg)
router.post('/organization/fetch-single', orgcontroller.getOrgById)
router.post('/organization/update-single', orgcontroller.updateOrgById)
router.post('/organization/delete-single', orgcontroller.deleteById)


//SLUG ROUTER
router.get('/slug', slugcontroller.getPage)
router.post('/slug/add', slugcontroller.createSlug)
router.post('/slug/fetch-single', slugcontroller.getSlugById)
router.post('/slug/update-single', slugcontroller.updateSlugById)
router.post('/slug/delete-single', slugcontroller.deleteSlugById)


//DASHBOARD ROUTER
router.get('/dashboard', dashcontroller.getDashboard)

//ROOM DASHBOARD ROUTER START
router.get('/room', roomcontroller.getPage)
router.get('/room/roomtype', roomcontroller.getRoomTypePage)
router.post('/room/roomtype/add', roomcontroller.createRoomType)
router.post('/room/roomtype/fetch-single', roomcontroller.getRoomTypeById)
router.post('/room/roomtype/update-single', roomcontroller.updateRoomTypeById)
router.post('/room/roomtype/delete-single', roomcontroller.deleteRoomTypeById)
router.post('/room-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomcontroller.searchRoom)


// ROOM TRANSACTION STATGE =  rtstage

router.get('/room/rtstage', rtscontroller.getPage)
router.post('/room/rtstage/add', rtscontroller.createRoomTrabsactionStages)
router.post('/room/rtstage/fetch-single', rtscontroller.getRoomTrabsactionStagesById)
router.post('/room/rtstage/update-single', rtscontroller.updateRoomTrabsactionStagesById)
router.post('/room/rtstage/delete-single', rtscontroller.deleteRoomTrabsactionStagesById)
module.exports = router;