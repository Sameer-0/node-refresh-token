const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const slotIntervalSetting = require("../../controllers/management/slotinterval/intervalsetting")
const slotIntervalTiming = require("../../controllers/management/slotinterval/intervaltiming")
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

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
module.exports = router;