const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const RoomTransactionStages = require('../../models/RoomTransactionStages')

module.exports = {
    getPage: (req, res) => {
        RoomTransactionStages.fetchAll(10000).then(result => {
            res.render('management/room/room_transaction_stages', {
                roomTransactionStageList: result.recordset
            })
        })
    },

    createRoomTrabsactionStages: (req, res) => {
        RoomTransactionStages.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getRoomTrabsactionStagesById: (req, res) => {
        RoomTransactionStages.getRTSId(req.body.rtsId).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    updateRoomTrabsactionStagesById: (req, res) => {
        RoomTransactionStages.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    deleteRoomTrabsactionStagesById:(req, res)=>{
        RoomTransactionStages.delete(req.body.rtsId).then(result=>{
            res.json({
                status: 200,
                message: "Success"
            })
        })
    }
}