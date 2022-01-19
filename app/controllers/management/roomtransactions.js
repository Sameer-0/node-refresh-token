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

            res.json({
                status: 200,
                data: result.recordset
            })
        }).catch(error=>{
             res.json({status:500,data:error.originalError.info})
        })
    },


    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        RoomTransactions.search(rowcont, req.body.keyword).then(result => {
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