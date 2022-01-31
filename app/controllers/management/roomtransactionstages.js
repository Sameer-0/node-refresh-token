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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        RoomTransactionStages.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getRoomTrabsactionStagesById: (req, res) => {
        RoomTransactionStages.getRTSId(req.query.rtsId).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    updateRoomTrabsactionStagesById: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        RoomTransactionStages.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    deleteRoomTrabsactionStagesById: (req, res) => {
        RoomTransactionStages.delete(req.body.rtsId).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        RoomTransactionStages.search(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Transaction Stage fetched",
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