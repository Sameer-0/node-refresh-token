const RoomTransactionRequest = require('../../models/RoomTransactionRequest')
module.exports = {
    getPage: (req, res) => {
        RoomTransactionRequest.fetchAll(10, res.locals.slug).then(result => {
            console.log(result.recordset)
            res.render('management/room/requests',{
                transactionList: result.recordset
            })
        })

    }
}