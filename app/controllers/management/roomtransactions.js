const RoomTransactions = require("../../models/RoomTransactions")

module.exports = {
    getPage: (req, res) => {
        RoomTransactions.fetchAll(100).then(result => {
  
            res.render('management/room/room_transactions', {
                transactionList: result.recordset
            })
        })
    },

    viewDetails: (req, res) => {
        RoomTransactions.viewTransactionUuId(50, req.body.transid).then(result => {
        
            res.json({
                status: 200,
                data: result.recordset
            })
        })
    },

    approveTrans: (req, res) => {
        RoomTransactions.approveTransactionByUuId(req.body.transid).then(result => {
            console.log('Resulr:::::::::::::::::>', result.recordset)
            res.json({
                status: 200,
                data: result.recordset
            })
        }).catch(error=>{
            console.log('Resulr:::::::::::::::::>', error.originalError.info)
             res.json({status:500,data:error.originalError.info})
        })
    }
}