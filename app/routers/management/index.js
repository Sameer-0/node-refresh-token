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
const rtscontroller = require("../../controllers/management/roomtransactionstages")
const rtypescontroller = require("../../controllers/management/roomtransactiontypes")
const roomtransactioncontroller = require("../../controllers/management/roomtransactions")
const roomslotscontroller = require("../../controllers/management/roomslots")
const programcontroller = require("../../controllers/management/program")
const divisioncontroller = require('../../controllers/management/division')
const programTypeController = require('../../controllers/management/programType')
const todosController = require('../../controllers/management/todos');
const todos = require('../../controllers/management/todos');
//ACADEMIC YEAR ROUTER
router.get('/academic-year', acadYearcontroller.getAcadYearPage)
router.post('/academic-year', acadYearcontroller.updateAcadYear)

// BUILDING ROUTER
router.get('/building', buildingcontroller.getBuildingPage)
router.put('/building', buildingcontroller.updateBuilding)
router.post('/building', buildingcontroller.getAdd)
router.post('/building/pagination', [check('pageNo', 'Invalid Page No').exists().trim().escape()], buildingcontroller.getBuildingPage)
router.get('/building/single', buildingcontroller.getSingleBuilding)
router.get('/building/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], buildingcontroller.searchBuilding)
router.delete('/building', buildingcontroller.deleteById)

// CAMPUS ROUTER
router.get('/campus', campuscontroller.getCampusPage)
router.put('/campus', campuscontroller.updateCampus)
router.post('/campus', campuscontroller.createCampus)
router.post('/campus', [check('pageNo', 'Invalid Page No').exists().trim().escape()], campuscontroller.getCampusPage)
router.get('/campus/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], campuscontroller.search)
router.get('/campus/single', campuscontroller.getCampusById)
router.delete('/campus/delete', campuscontroller.deleteById)

// ORGANIZATION ROUTER
router.get('/organization', orgcontroller.getPage)
router.post('/organization', orgcontroller.createOrg)
router.put('/organization', orgcontroller.updateOrgById)
router.delete('/organization', orgcontroller.deleteById)
router.post('/organization/pagination', [check('pageNo', 'Invalid Page No').exists().trim().escape()], orgcontroller.getPage)
router.post('/organization/single', orgcontroller.getOrgById)
router.post('/organization/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], orgcontroller.search)

//SLUG ROUTER
router.get('/slug', slugcontroller.getPage)
router.post('/slug', slugcontroller.createSlug)
router.put('/slug', slugcontroller.updateSlugById)
router.delete('/slug', slugcontroller.deleteSlugById)
router.get('/slug/single', slugcontroller.getSlugById)
router.get('/slug/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], slugcontroller.search)

//DASHBOARD ROUTER
router.get('/dashboard', dashcontroller.getDashboard)

//ROOM ROUTER
router.get('/room', roomcontroller.getPage)
router.get('/room/single', roomcontroller.getSingleRoom)
router.put('/room', roomcontroller.updateRoomById)
router.delete('/room', roomcontroller.deleteRoomById)
router.post('/room', roomcontroller.addRoom)
router.get('/room/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomcontroller.searchRoom)

//ROOM TYPE ROUTER
router.get('/room/roomtype', roomtype.getRoomTypePage)
router.put('/room/roomtype', roomtype.updateRoomTypeById)
router.post('/room/roomtype', roomtype.createRoomType)
router.get('/room/roomtype/single', roomtype.getRoomTypeById)
router.get('/room/roomtype/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomtype.search)
router.delete('/room/roomtype/delete', roomtype.deleteRoomTypeById)


// ROOM TRANSACTION STATGE =  rtstage
router.get('/room/rtstage', rtscontroller.getPage)
router.put('/room/rtstage', rtscontroller.updateRoomTrabsactionStagesById)
router.post('/room/rtstage', rtscontroller.createRoomTrabsactionStages)
router.get('/room/rtstage/single', rtscontroller.getRoomTrabsactionStagesById)
router.get('/room/rtstage/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], rtscontroller.search)
router.delete('/room/rtstage', rtscontroller.deleteRoomTrabsactionStagesById)


// ROOM TRANSACTION TYPES =  rtypes
router.get('/room/rtypes', rtypescontroller.getPage)
router.post('/room/rtypes', rtypescontroller.createRoomTrabsactionStages)
router.get('/room/rtypes/single', rtypescontroller.getRoomTrabsactionStagesById)
router.put('/room/rtypes', rtypescontroller.updateRoomTrabsactionStagesById)
router.delete('/room/rtypes', rtypescontroller.deleteRoomTrabsactionStagesById)
router.get('/room/rtypes/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], rtypescontroller.search)

// ROOM TRANSACTION
router.get('/room/transaction', roomtransactioncontroller.getPage)
router.post('/room/transaction/single', roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans', roomtransactioncontroller.approveTrans)
router.get('/room/transaction/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], roomtransactioncontroller.search)

//ROOM SLOTS ROUTER
router.get('/room/slots', roomslotscontroller.getPage)

//PROGRAM ROUTER
router.get('/program', programcontroller.getPage)

// PROGRAM TYPE ROUTER
router.get('/program/list', programTypeController.getProgramTypePage)
router.post('/program/programType', programTypeController.createProgramType)
router.put('/program/list', programTypeController.updateProgramTypeById)
router.delete('/program/list', programTypeController.deleteProgramTypeById)
router.get('/program/ptypes/single', programTypeController.getProgramTypeById)
router.get('/room/ptypes/search', [check('keyword', 'Invalid keyword').exists().trim().escape()], programTypeController.search)


// TODOS ROUTER
router.get('/todos', todosController.getPage)
router.post('/todos/create', todosController.createTodos)
router.get('/todos/viewsingle', todosController.viewDetails)
router.put('/todos/single', todosController.updateTodosById)
router.get('/todos/single', todosController.getTodosById)
router.delete('/todos/single', todosController.deleteTodosById)
router.get('/todos/search', todosController.search)






//DIVISION ROUTER
router.get('/divisions', divisioncontroller.getPage)

module.exports = router;