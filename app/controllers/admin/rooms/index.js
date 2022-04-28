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
const Rooms = require('../../../models/Rooms')
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const AcademicCalender = require('../../../models/AcademicCalender')
const User = require('../../../models/User')
const Settings = require('../../../models/Settings');


module.exports = {
    getPage: (req, res) => {
        Promise.all([RoomTransactions.fetchAll(10, res.locals.slug), RoomTransactions.getCount(res.locals.slug), RoomTransactionTypes.fetchAll(100), Organizations.fetchAll(100), Campuses.fetchAll(100), Rooms.fetchAll(1000), SlotIntervalTimings.fetchAll(1000), AcademicCalender.fetchAll(1000)]).then(result => {
            console.log('Rooms:::::::::::::::::', result[2].recordset)
            res.render('admin/rooms/index', {
                transactionList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                transactionTypes: result[2].recordset,
                orgnizations: result[3].recordset,
                campuses: result[4].recordset,
                roomList: result[5].recordset,
                slotIntervalTimings: result[6].recordset,
                academicCalender: result[7].recordset,
                totalentries: result[0].recordset.length ? result[0].recordset.length : 0
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
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        RoomTransactions.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
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
            res.status(500).json(error.originalError.info.message)
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
            throw error
        })
    },

    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>',req.body.id)
        RoomTransactions.delete(req.body.id, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

}