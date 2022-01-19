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
const roomtype = require('../../controllers/management/roomtype');
const acadYearcontroller = require('../../controllers/management/academicYear');
const slugcontroller = require('../../controllers/management/slug');
const rtscontroller =  require("../../controllers/management/roomtransactionstages")
const rtypescontroller =  require("../../controllers/management/roomtransactiontypes")
const roomtransactioncontroller =  require("../../controllers/management/roomtransactions")
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
router.post('/building/building-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], buildingcontroller.searchBuilding)


// CAMPUS ROUTER
router.get('/campus', campuscontroller.getCampusPage)
router.post('/campus', [check('pageNo', 'Invalid Page No').exists().trim().escape()], campuscontroller.getCampusPage)
router.post('/campus-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], campuscontroller.search)
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
router.post('/organization-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], orgcontroller.search)

//SLUG ROUTER
router.get('/slug', slugcontroller.getPage)
router.post('/slug/add', slugcontroller.createSlug)
router.post('/slug/fetch-single', slugcontroller.getSlugById)
router.post('/slug/update-single', slugcontroller.updateSlugById)
router.post('/slug/delete-single', slugcontroller.deleteSlugById)
router.post('/slug/slug-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], slugcontroller.search)

//DASHBOARD ROUTER
router.get('/dashboard', dashcontroller.getDashboard)

//ROOM DASHBOARD ROUTER START roomtype
router.get('/room', roomcontroller.getPage)
router.post('/room/fetch-single', roomcontroller.getSingleRoom)
router.post('/room/update', roomcontroller.updateRoomById)
router.post('/room/delete-room', roomcontroller.deleteRoomById)
router.post('/room-search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomcontroller.searchRoom)

//ROOM TYPE ROUTER
router.get('/room/roomtype', roomtype.getRoomTypePage)
router.post('/room/roomtype/add', roomtype.createRoomType)
router.post('/room/roomtype/fetch-single', roomtype.getRoomTypeById)
router.post('/room/roomtype/update-single', roomtype.updateRoomTypeById)
router.post('/room/roomtype/delete-single', roomtype.deleteRoomTypeById)
router.post('/room/roomtype/roomtype-search',[check('keyword', 'Invalid keyword').exists().trim().escape()], roomtype.search)



// ROOM TRANSACTION STATGE =  rtstage
router.get('/room/rtstage', rtscontroller.getPage)
router.post('/room/rtstage/add', rtscontroller.createRoomTrabsactionStages)
router.post('/room/rtstage/fetch-single', rtscontroller.getRoomTrabsactionStagesById)
router.post('/room/rtstage/update-single', rtscontroller.updateRoomTrabsactionStagesById)
router.post('/room/rtstage/delete-single', rtscontroller.deleteRoomTrabsactionStagesById)
router.post('/room/rtstage/rtstage-search',[check('keyword', 'Invalid keyword').exists().trim().escape()], rtscontroller.search)

// ROOM TRANSACTION TYPES =  rtypes

router.get('/room/rtypes', rtypescontroller.getPage)
router.post('/room/rtypes/add', rtypescontroller.createRoomTrabsactionStages)
router.post('/room/rtypes/fetch-single', rtypescontroller.getRoomTrabsactionStagesById)
router.post('/room/rtypes/update-single', rtypescontroller.updateRoomTrabsactionStagesById)
router.post('/room/rtypes/delete-single', rtypescontroller.deleteRoomTrabsactionStagesById)
router.post('/room/rtypes/rtypes-search',[check('keyword', 'Invalid keyword').exists().trim().escape()], rtypescontroller.search)

// ROOM TRANSACTION
router.get('/room/transaction',roomtransactioncontroller.getPage)
router.post('/room/transaction/view-details',roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans',roomtransactioncontroller.approveTrans)
router.post('/room/transaction/transaction-search',[check('keyword', 'Invalid keyword').exists().trim().escape()], roomtransactioncontroller.search)
module.exports = router;