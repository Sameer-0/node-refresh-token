const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const academiccontroller = require("../../controllers/management/academic")
const acadsessioncontroller = require("../../controllers/management/academicsession")
const acadCalender = require("../../controllers/management/academiccalender")
const acadYearcontroller = require('../../controllers/management/academicYear');
const validate = require('../../middlewares/validate')


//ACADEMIC YEAR ROUTER
router.get('/academic/academic-year', acadYearcontroller.getAcadYearPage)
router.post('/academic/academic-year', validate('createAcadYear'), acadYearcontroller.updateAcadYear)
router.put('/academic/academic-year', acadYearcontroller.switchAcadYear)

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

module.exports = router;