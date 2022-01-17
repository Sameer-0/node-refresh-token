const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const RoomTransactionTypes = require('../../models/RoomTransactionTypes')

module.exports = {
    getPage: (req, res) => {
        RoomTransactionTypes.fetchAll(50).then(result => {
            res.render('management/room/room_transaction_types', {
                roomTransactionTypeList: result.recordset
            })
        })
    },

    createRoomTrabsactionStages: (req, res) => {
        RoomTransactionTypes.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getRoomTrabsactionStagesById: (req, res) => {
        RoomTransactionTypes.getRTSId(req.body.rtsId).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    updateRoomTrabsactionStagesById: (req, res) => {
        RoomTransactionTypes.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    deleteRoomTrabsactionStagesById:(req, res)=>{
        RoomTransactionTypes.delete(req.body.rtsId).then(result=>{
            res.json({
                status: 200,
                message: "Success"
            })
        })
    }
}