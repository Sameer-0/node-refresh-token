const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const roomModel = require('../../models/RoomData')
const building = require('../../models/Buildings')
const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const RoomTypes = require('../../models/RoomTypes')
const moment = require('moment')



module.exports = {
    getPage: (req, res, next) => {
        res.render('management/room/index')

    },

    getRoomTypePage: (req, res) => {
        RoomTypes.fetchAll(10).then(result => {
            res.render('management/room/roomtype', {
                roomTypes: result.recordset
            })
        })
    },

    createRoomType: (req, res) => {
        RoomTypes.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getRoomTypeById: (req, res) => {
        RoomTypes.getRoomTypeById(req.body.roomtypeid).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    }
}