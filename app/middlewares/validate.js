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

        default: {
            return "No Validation Found"
        }


    }
}