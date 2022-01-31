const {
    check,
    body
} = require('express-validator');
const { searchRoom } = require('../models/RoomData');

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

        case 'createRoom': {
            return [
               body().isArray(),
                check('*.roomNo', 'roomNo must not be empty').not().isEmpty(),
                check('*.buildingId', 'buildingId must not be empty').not().isEmpty(),
                // check('roomJson.*.roomNo').not().isEmpty().withMessage('roomNo must not be empty'),
                // check('roomJson.*.buildingId').not().isEmpty().withMessage('building name must not be empty'),
                // check('roomJson.*.roomType').not().isEmpty().withMessage('room type must not be empty'),
                // check('roomJson.*.floorNo').not().isEmpty().withMessage('floor number must not be empty').isNumeric().withMessage('floorNo must be number only'),
                // check('roomJson.*.capacity').not().isEmpty().withMessage('capacity must not be empty').isNumeric().withMessage('capacity must be number only'),
                // check('roomJson.*.handledBy').not().isEmpty().withMessage('handledBy must not be empty'),
                // check('roomJson.*.isBasement').not().isEmpty().withMessage('isBasement must not be empty'),
                // check('roomJson.*.campusId').not().isEmpty().withMessage('campus must not be empty'),
                // check('roomJson.*.startTime').not().isEmpty().withMessage('startTime must not be empty'),
                // check('roomJson.*.endTime').not().isEmpty().withMessage('endTime must not be empty')
            ]
        }

        case 'updateRoom': {
            return [
                check('roomid').not().isEmpty().withMessage('roomId must not be empty').isNumeric().withMessage('roomId must be number only'),
                check('room_number').not().isEmpty().withMessage('roomNo must not be empty'),
                check('buildingId').not().isEmpty().withMessage('building name must not be empty'),
                check('roomtypeId').not().isEmpty().withMessage('roomType must not be empty'),
                check('floor_number').not().isEmpty().withMessage('floor must not be empty').isNumeric().withMessage('floorNo must be number only'),
                check('capacity').not().isEmpty().withMessage('capacity must not be empty').isNumeric().withMessage('capacity must not be empty'),
                check('handledBy').not().isEmpty().withMessage('handledBy must not be empty'),
                check('is_basement').not().isEmpty().withMessage('isBasement must not be empty'),
                check('campusId').not().isEmpty().withMessage('campus must not be empty'),
                check('start_time').not().isEmpty().withMessage('startTime must not be empty'),
                check('end_time').not().isEmpty().withMessage('endTime must not be empty')
           ]
        }

       case 'search': {
           return [
               check('keyword').exists().trim().escape().withMessage('Invalid Keyword')
           ]
       }

       case 'delete': {
           return [
               check('id').not().isEmpty().withMessage('Id must not be empty').isNumeric().withMessage('Id must be an integer')
           ]
       }


       case 'createRoomTransStage':{
           return[
            check('rtsName').not().isEmpty().withMessage('Room transaction must not be empty'),
            check('description').not().isEmpty().withMessage('Description must not be empty')
           ]
       }

       case 'updateRoomTransStage': {
           return[
               check('rtsId').not().isEmpty().withMessage('Room Transaction Id must not be empty'),
               check('rtsName').not().isEmpty().withMessage('Transaction Name must not be empty'),
               check('description').not().isEmpty().withMessage('Description must not be empty')
           ]
       }

       case 'search': {
           return[
               check('keyword').exists().trim().escape().withMessage('Invalid Keyword')
           ]
       }
       
       case 'createRoomTransType': {
           return[
               check('rtsName').not().isEmpty().withMessage('Room Transaction Type must not be empty'),
               check('description').not().isEmpty().withMessage('Description must not be empty')
           ]
       }

       case 'updateRoomTransType': {
           return[
               check('rtsId').not().isEmpty().withMessage('roomTransactionTypeId must not be empty'),
               check('rtsName').not().isEmpty().withMessage('Room Transaction type must not be empty'),
               check('description').not().isEmpty().withMessage('Description must not be empty')

           ]
       }

       case 'createDivision': {
           return[
               check('courseId').not.isEmpty().withMessage('Course must not be empty'),
               check('division').not().isEmpty().withMessage('Division must not be empty'),
               check('divisionNum').not().isEmpty().withMessage('division number must not be empty').isNumeric().withMessage('DivisionNum must be an integer'),
               check('divisionCount').not().isEmpty().withMessage('Division Count must not be empty').isNumeric().withMessage('DivisionCount must be an integer'),
               check('countTheoryBatch').not().isEmpty().withMessage('countTheoryBatch must not be empty').isNumeric().withMessage('countTheoryBatch must be an integer'),
               check('countPracticalBatch').not().isEmpty().withMessage('countPracticalBatch must not be empty').isNumeric().withMessage('countPracticalBatch must be number'),
               check('countTutorialBatch').not().isEmpty().withMessage('countTutorialBatch must not be empty').isNumeric().withMessage('countTutorialBatch must be an integer'),
               check('countWorkshopBatch').not().isEmpty().withMessage('countWorkshopBatch must not be an empty').isNumeric().withMessage('countWorkshopBatch must not be an integer'),
               
           ]
       }
       

        default: {
            return "No Validation Found"
        }


    }
}