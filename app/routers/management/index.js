const router = require('express').Router();
const {
    check,
    validationResult,
    body
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
const roomrejectioncontroller = require("../../controllers/management/roombookingrejectionreasons")
const academiccontroller = require("../../controllers/management/academic")
const acadsessioncontroller = require("../../controllers/management/academicsession")
const acadCalender = require("../../controllers/management/academiccalender")

const cancellationreasons = require("../../controllers/management/cancellationreasons")
const slotIntervalSetting = require("../../controllers/management/slotinterval/intervalsetting")
const slotIntervalTiming = require("../../controllers/management/slotinterval/intervaltiming")

const courseWorkload = require('../../controllers/management/courseWorkload')
const divisionBatch = require('../../controllers/management/divisionBatch')
const validate = require('../../middlewares/validate')
const programcheck = require('../../middlewares/programcheck');
const roomValidate = require('../../middlewares/roomValidate');
const validationFunctions = require('../../middlewares/validationFunctions')
const validator =  require('../../middlewares/validator')

//ACADEMIC YEAR ROUTER
router.get('/academic/academic-year', acadYearcontroller.getAcadYearPage)
router.post('/academic/academic-year', validate('createAcadYear'), acadYearcontroller.updateAcadYear)

// BUILDING ROUTER
router.get('/building', buildingcontroller.getPage)
router.put('/building', validate('updateBuilding'), buildingcontroller.update)
router.post('/building', validate('createBuilding'), buildingcontroller.create)
router.post('/building/pagination', validate('pagination'), buildingcontroller.getPage)
router.get('/building/single', validate('single'), buildingcontroller.single)
router.get('/building/search', validate('search'), buildingcontroller.search)
router.delete('/building', validate('delete'), buildingcontroller.delete)

// CAMPUS ROUTER
router.get('/campus', campuscontroller.getCampusPage)
router.put('/campus', validate('updateCampus'), campuscontroller.update)
router.post('/campus', validate('createCampus'), campuscontroller.create)
router.post('/campus', validate('pagination'), campuscontroller.getCampusPage)
router.get('/campus/search', validate('search'), campuscontroller.search)
router.get('/campus/single', validate('single'), campuscontroller.single)
router.delete('/campus', validate('delete'), campuscontroller.delete)

// ORGANIZATION ROUTER
router.get('/organization', orgcontroller.getPage)
//router.post('/organization', validate('createOrganization'), orgcontroller.create)
router.post('/organization', validate('createOrganization'), orgcontroller.create)
router.put('/organization', validate('updateOrganization'), orgcontroller.update)
router.delete('/organization', validate('delete'), orgcontroller.delete)
router.post('/organization/pagination', validate('pagination'), orgcontroller.getPage)
router.post('/organization/single', validate('single'), orgcontroller.single)
router.post('/organization/search', validate('search'), orgcontroller.search)

//SLUG ROUTER
router.get('/slug', slugcontroller.getPage)
router.post('/slug', validate('createSlug'), slugcontroller.create)
router.put('/slug', validate('updateSlug'), slugcontroller.update)
router.delete('/slug', validate('delete'), slugcontroller.delete)
router.get('/slug/single', validate('single'), slugcontroller.single)
router.get('/slug/search', validate('search'), slugcontroller.search)

//DASHBOARD ROUTER
router.get('/dashboard', dashcontroller.getDashboard)
router.get('/dashboardstepform',dashcontroller.dashboardStepForm)


//ROOM ROUTER
router.get('/room', roomcontroller.getPage)
router.get('/room/single', roomcontroller.getSingleRoom)
router.put('/room', validate('updateRoom'), roomcontroller.updateRoomById)
router.delete('/room', validate('delete'), roomcontroller.deleteRoomById)
//router.post('/room', validate('createRoom') , roomcontroller.addRoom)
router.post('/room', roomValidate, roomcontroller.addRoom)
router.get('/room/search', validate('search'), roomcontroller.searchRoom)

//ROOM TYPE ROUTER
router.get('/room/roomtype', roomtype.getPage)
router.put('/room/roomtype', validate('updateRoomType'), roomtype.update)
router.post('/room/roomtype', validate('createRoomType'), roomtype.create)
router.get('/room/roomtype/single', validate('single'), roomtype.single)
router.get('/room/roomtype/search', validate('search'), roomtype.search)
router.delete('/room/roomtype/delete', validate('delete'), roomtype.delete)


// ROOM TRANSACTION STATGE =  rtstage
router.get('/room/rtstage', rtscontroller.getPage)
router.put('/room/rtstage', validate('updateRtstage'), rtscontroller.update)
router.post('/room/rtstage', validate('createRtstage'), rtscontroller.create)
router.get('/room/rtstage/single', validate('single'), rtscontroller.single)
router.get('/room/rtstage/search', validate('search'), rtscontroller.search)
router.delete('/room/rtstage', validate('delete'), rtscontroller.delete)


// ROOM TRANSACTION TYPES =  rtypes
router.get('/room/rtypes', rtypescontroller.getPage)
router.post('/room/rtypes', validate('createRtypes'), rtypescontroller.create)
router.get('/room/rtypes/single', validate('single'), rtypescontroller.single)
router.put('/room/rtypes', validate('updateRtypes'), rtypescontroller.update)
router.delete('/room/rtypes', validate('delete'), rtypescontroller.delete)
router.get('/room/rtypes/search', validate('search'), rtypescontroller.search)

// ROOM TRANSACTION
router.get('/room/transaction', roomtransactioncontroller.getPage)
router.post('/room/transaction/single', roomtransactioncontroller.viewDetails)
router.post('/room/transaction/approve-trans', roomtransactioncontroller.approveTrans)
router.get('/room/transaction/search', validate('search'), roomtransactioncontroller.search)

//ROOM SLOTS ROUTER
router.get('/room/slots', roomslotscontroller.getPage)

//PROGRAM ROUTER
router.get('/program', programcontroller.getPage)

// PROGRAM TYPE ROUTER
router.get('/program/list', programTypeController.getProgramTypePage)
router.post('/program/programType', validate('createProgramType'), programTypeController.createProgramType)
router.put('/program/list', validate('updateProgramType'), programTypeController.updateProgramTypeById)
router.delete('/program/list', validate('delete'), programTypeController.deleteProgramTypeById)
router.get('/program/ptypes/single', programTypeController.getProgramTypeById)
router.get('/room/ptypes/search', validate('search'), programTypeController.search)


// TODOS ROUTER
router.get('/todos', todosController.getPage)
router.post('/todos/create', validate('createTodos'), todosController.createTodos)
router.get('/todos/viewsingle', todosController.viewDetails)
router.put('/todos/single', validate('updateTodos'), todosController.updateTodosById)
router.get('/todos/single', todosController.getTodosById)
router.delete('/todos/single', validate('delete'), todosController.deleteTodosById)
router.get('/todos/search', validate('search'), todosController.search)

//DIVISION ROUTER
router.get('/divisions', divisioncontroller.getPage)
router.post('/divisions', validate('createDivision'), divisioncontroller.addDivision)
router.get('/divisions/single', divisioncontroller.getDivisionById)
router.put('/divisions/single', validate('updateDivision'), divisioncontroller.updateDivisionById)
router.delete('/divisions/single', validate('delete'), divisioncontroller.deleteDivisionById)
router.get('/divisions/search', validate('search'), divisioncontroller.search)


// DIVISION BATCHES
router.get('/divisions/batches', divisionBatch.getPage)
router.post('/divisions/batches/add', validate('createDivBatch'), divisionBatch.createBatch)
router.get('/division/batches/single', divisionBatch.getBatchById)
router.put('/division/batches', validate('updateDivBatch'), divisionBatch.updateBatchById)


//INITIAL COURSE WORKLOAD
router.get('/courseWorkload', courseWorkload.getpage)


// BOOKING REJECTION REASONS
router.get('/room/bookingrejectionreasons', roomrejectioncontroller.getPage)
router.post('/room/bookingrejectionreasons', validate('createBookingRejectionReasons'), roomrejectioncontroller.create)
router.put('/room/bookingrejectionreasons', validate('updateBookingRejectionReasons'), roomrejectioncontroller.update)
router.get('/room/bookingrejectionreasons/search', validate('search'), roomrejectioncontroller.search)
router.get('/room/bookingrejectionreasons/single', roomrejectioncontroller.getById)
router.delete('/room/bookingrejectionreasons', roomrejectioncontroller.delete)


// ACADEMIC ROUTER

router.get('/academic', academiccontroller.getPage)

//ACADEMIC SESSION
router.get('/academic/session', acadsessioncontroller.getPage)
router.post('/academic/session', validate('createSession'), acadsessioncontroller.create)
router.put('/academic/session', validate('updateSession'), acadsessioncontroller.update)
router.get('/academic/session/search', validate('search'), acadsessioncontroller.search)
router.get('/academic/session/single', validate('single'), acadsessioncontroller.single)


//ACADEMIC CALENDER

router.get('/academic/calender', acadCalender.getPage)
router.get('/academic/calender/search', validate('search'), acadCalender.search)

//BOOKING CANCELLATION REASONS
router.get('/cancellationreasons', cancellationreasons.getPage)
router.post('/cancellationreasons', validate('createCancellationreasons'), cancellationreasons.create)
router.put('/cancellationreasons', validate('updateCancellationreasons'), cancellationreasons.update)
router.get('/cancellationreasons/single', validate('single'), cancellationreasons.single)
router.get('/cancellationreasons/search', validate('search'), cancellationreasons.search)
router.delete('/cancellationreasons', validate('delete'), cancellationreasons.delete)

//SLOT INTERVALS
router.get('/slotinterval', slotIntervalSetting.getMainPage)
router.get('/slotinterval/setting', slotIntervalSetting.getPage)
router.post('/slotinterval/setting', validate('createSlotIntrSetting'), slotIntervalSetting.create)
router.put('/slotinterval/setting', validate('updateSlotIntrSetting'), slotIntervalSetting.update)
router.get('/slotinterval/setting/single', validate('single'), slotIntervalSetting.single)
router.delete('/slotinterval/setting', validate('delete'), slotIntervalSetting.delete)
router.get('/slotinterval/setting/search', validate('search'), slotIntervalSetting.search)

//SLOT INTERVAL TIMING

router.get('/slotinterval/timing', slotIntervalTiming.getPage)
router.post('/slotinterval/timing', validate('createSlotIntrTime'), slotIntervalTiming.create)
router.put('/slotinterval/timing', validate('updateSlotIntrTime'), slotIntervalTiming.update)
router.get('/slotinterval/timing/single', validate('single'), slotIntervalTiming.single)
router.delete('/slotinterval/timing', validate('delete'), slotIntervalTiming.delete)
router.get('/slotinterval/timing/search', validate('search'), slotIntervalTiming.search)

//TEST ROUTE
router.post('/program/checkprogram', programcheck, programTypeController.programcheck)


module.exports = router;