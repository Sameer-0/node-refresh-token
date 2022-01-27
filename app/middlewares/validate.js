const {
    check,
    body
} = require('express-validator')

module.exports = function validate(method) {
    switch (method) {

        case 'createCampus': {
            return [
                check('campusId').not().isEmpty().withMessage('campusId must not be empty').isNumeric().withMessage('campusId must be number only'),
                check('campusAbbr').not().isEmpty().withMessage('campus Abbr must not be empty'),
                check('campusName').not().isEmpty().withMessage('campus Name must not be empty'),
                check('campusDesc').not().isEmpty().withMessage('Campus Description must not be empty')
            ];
        }

        case 'updateCampus': {
            return [
                check('Id').not().isEmpty().withMessage('Id must not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId must not be empty').isNumeric().withMessage('campusId must be number only'),
                check('campusAbbr').not().isEmpty().withMessage('campus Abbr must not be empty'),
                check('campusName').not().isEmpty().withMessage('campus Name must not be empty'),
                check('campusDesc').not().isEmpty().withMessage('Campus Description must not be empty'),
            ]
        }

        case 'createBuilding': {
            return [
                check('buildingName').not().isEmpty().withMessage('Building Name not be empty'),
                check('buildingNumber').not().isEmpty().withMessage('Building Number must not be empty').isNumeric().withMessage('campusId must be number only'),
                check('floors').not().isEmpty().withMessage('floors must not be empty'),
                check('ownerId').not().isEmpty().withMessage('Owner Name must not be empty'),
                check('handledById').not().isEmpty().withMessage('HandledBy  must not be empty'),
                check('startTimeId').not().isEmpty().withMessage('startTimeId  must not be empty'),
                check('endTimeId').not().isEmpty().withMessage('endTimeId  must not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId  must not be empty').isNumeric().withMessage('campusId must be number only'),
            ]
        }

        case 'updateBuilding': {
            return [
                check('buildingId').not().isEmpty().withMessage('Building Id not be empty').isNumeric().withMessage('campusId must be number only'),
                check('buildingName').not().isEmpty().withMessage('Building Name not be empty'),
                check('buildingNumber').not().isEmpty().withMessage('Building Number must not be empty').isNumeric().withMessage('campusId must be number only'),
                check('floors').not().isEmpty().withMessage('floors must not be empty'),
                check('ownerId').not().isEmpty().withMessage('Owner Name must not be empty'),
                check('handledById').not().isEmpty().withMessage('HandledBy  must not be empty'),
                check('startTimeId').not().isEmpty().withMessage('startTimeId  must not be empty'),
                check('endTimeId').not().isEmpty().withMessage('endTimeId  must not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId  must not be empty').isNumeric().withMessage('campusId must be number only'),
            ]
        }

        default: {
            return "No Validation Found"
        }


    }
}