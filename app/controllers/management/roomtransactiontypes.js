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
    },

    search: (req, res) => {
        //here 10is rowcount
        console.log(req.body)
        let rowcont = 10;
        RoomTransactionTypes.search(rowcont, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Transaction Type fetched",
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
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    }
}