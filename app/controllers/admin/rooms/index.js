const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTransactions = require('../../../models/RoomTransactions')
const RoomTransactionTypes = require('../../../models/RoomTransactionTypes')
const RoomTransactionStage = require('../../../models/RoomTransactionStages')
const Organizations = require('../../../models/Organizations')
const Campuses = require('../../../models/Campuses')
const Buildings = require('../../../models/Buildings')
const Rooms = require('../../../models/Rooms')
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const AcademicCalender = require('../../../models/AcademicCalender')
const User = require('../../../models/User')
const Settings = require('../../../models/Settings')
const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {
        Promise.all([Rooms.bookedRooms(res.locals.slug, 10), Rooms.bookedRoomsCount(res.locals.slug)]).then(result => {
            console.log('organization:::::::::::::::::', result[1].recordset[0].count)
            res.render('admin/rooms/index', {
                bookedRoomList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                totalentries: result[1].recordset[0] ? result[1].recordset[0].count : 0,
                breadcrumbs: req.breadcrumbs,
            })
        }) 
    }, 

    getBookingPage: (req, res) => {
        Promise.all([RoomTransactions.fetchAll(10, res.locals.slug), RoomTransactions.getCount(res.locals.slug), RoomTransactionTypes.fetchAll(100), Organizations.getChildByParentId(res.locals.organizationId), Campuses.fetchAll(100), Rooms.fetchAll(1000), SlotIntervalTimings.forRoomBooking(1000), AcademicCalender.fetchAll(1000),Buildings.fetchAll(50)]).then(result => {
            console.log('Rooms:::::::::::::::::', result[2].recordset)
            res.render('admin/rooms/booking', {
                transactionList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                transactionTypes: JSON.stringify(result[2].recordset),
                orgList: result[3].recordset, 
                campusList: result[4].recordset,
                roomList: result[5].recordset,
                slotIntervalTimings: JSON.stringify(result[6].recordset),
                academicCalender: JSON.stringify(result[7].recordset),
                buildingList: result[8].recordset,
                totalentries: result[0].recordset.length ? result[0].recordset.length : 0,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    create: (req, res) => {

        let object = {
            new_room_transactions: JSON.parse(req.body.inputJSON)
        }
     
        RoomTransactions.save(res.locals.slug, object, res.locals.userId).then(result => {
            //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
            if (req.body.settingName) {
                Settings.updateByName(res.locals.slug, req.body.settingName)
            }
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        RoomTransactions.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                console.log('searched items::', result.recordset)
                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } 
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTransactions.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>',req.body.id)
        RoomTransactions.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    getroomsbybuildingid: (req, res, next) => {
        Rooms.roomsbybuildingid(req.body.building_lid).then(result => {
            console.log('result:::::::::::::',result.recordset)
            res.json({
                status: 200,
                roomList: result.recordset
            })
        })
    },

    roomSlotByRoomId: (req, res, next) => {
        SlotIntervalTimings.roomSlotByRoomId(req.body.roomLid).then(result => {
            res.json({
                status: 200,
                roomslot: result.recordset
            })
        })
    },

    searchForBookedRooms: (req, res) => {
        let rowcount = 10;
        RoomTransactions.searchForBookedRooms(rowcount, req.body.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                console.log('searched items::', result.recordset)
                res.json({
                    status: "200",
                    message: "Booked Room Fetched fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } 
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },


    bookedRoompagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        console.log('HITTING PAGINATION::::::::::::::',req.body.pageNo)

        Rooms.bookedRoomsPagination(res.locals.slug, req.body.pageNo).then(result => {
            console.log('PAGINATION RESULT ::::::::::::::',result.recordset)
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log('PAGINATION error ::::::::::::::',error)
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },
}