const {
    check,
    body
} = require('express-validator')

module.exports = {

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

        case 'createAcadYear': {
            return [
                check('acadYear').not().isEmpty().withMessage('acadYear Name not be empty'),
                check('startDate').not().isEmpty().withMessage('startDate must not be empty'),
                check('endDate').not().isEmpty().withMessage('endDate  must not be empty'),
            ]
        }

        case 'createOrganization': {
            return [
                check('org_id').not().isEmpty().withMessage('Organization id not be empty').isNumeric().withMessage('campusId must be number only'),
                check('org_abbr').not().isEmpty().withMessage('Organization Abbr must not be empty'),
                check('org_name').not().isEmpty().withMessage('Organization name not be empty'),
                check('org_complete_name').not().isEmpty().withMessage('Organization complete name must not be empty'),
                check('org_type_id').not().isEmpty().withMessage('Organization  type must not be empty').isNumeric().withMessage('campusId must be number only')
            ]
        }

        case 'updateOrganization': {
            return [
                check('org_id').not().isEmpty().withMessage('Organization id not be empty').isNumeric().withMessage('campusId must be number only'),
                check('org_abbr').not().isEmpty().withMessage('Organization Abbr must not be empty'),
                check('org_name').not().isEmpty().withMessage('Organization name not be empty'),
                check('org_complete_name').not().isEmpty().withMessage('Organization complete name must not be empty'),
                check('org_type_id').not().isEmpty().withMessage('Organization  type must not be empty').isNumeric().withMessage('campusId must be number only')
            ]
        }

        case 'createSlug': {
            return [
                check('slugName').not().isEmpty().withMessage('slug name not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId must not be empty'),
                check('orgId').not().isEmpty().withMessage('Organization must not be empty'),
            ]
        }

        case 'updateSlug': {
            return [
                check('slugid').not().isEmpty().withMessage('slugid must not be empty').isNumeric().withMessage('slugid must be number only'),
                check('slugName').not().isEmpty().withMessage('slug name not be empty'),
                check('campusId').not().isEmpty().withMessage('campusId must not be empty'),
                check('orgId').not().isEmpty().withMessage('Organization must not be empty'),
            ]
        }

        case 'createCancellationreasons': {
            return [
                check('typeOfCancellation').not().isEmpty().withMessage('Type of cancellation must not be empty'),
                check('reasonText').not().isEmpty().withMessage('Reason must not be empty'),
                check('sapId').not().isEmpty().withMessage('sapId must not be empty').isNumeric().withMessage('sapId must be number only')
            ]
        }

        case 'updateCancellationreasons': {
            return [
                check('cancellationId').not().isEmpty().withMessage('Cancellation id must not be empty').isNumeric().withMessage('sapId must be number only'),
                check('typeOfCancellation').not().isEmpty().withMessage('Type of cancellation must not be empty'),
                check('reasonText').not().isEmpty().withMessage('Reason must not be empty'),
                check('sapId').not().isEmpty().withMessage('sapId must not be empty').isNumeric().withMessage('sapId must be number only')
            ]
        }

        case 'createRoomType': {
            return [
                check('roomName').not().isEmpty().withMessage('Room name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        case 'updateRoomType': {
            return [
                check('roomtypeid').not().isEmpty().withMessage('roomtypeid must not be empty'),
                check('roomName').not().isEmpty().withMessage('Room name must not be empty'),
                check('description').not().isEmpty().withMessage('Description must not be empty')
            ]
        }

        default: {
            return "No Validation Found"
        }


    }

}