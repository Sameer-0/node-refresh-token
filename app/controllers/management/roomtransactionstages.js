const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const RoomTransactionStages = require('../../models/RoomTransactionStages')

module.exports = {
    getPage: (req, res) => {

        RoomTransactionStages.fetchAll(10000).then(result=>{
            console.log(result)
            res.render('management/room/room_transaction_stages',{
                roomTransactionStageList:result.recordset
            })
        })
        
    }
}