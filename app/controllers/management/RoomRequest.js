const RoomTransactionRequest = require('../../models/RoomTransactionRequest')

module.exports = {
    getPage: (req, res) => {
        Promise.all([RoomTransactionRequest.fetchAll(10, res.locals.slug), RoomTransactionRequest.getCount(res.locals.slug)]).then(result => {
            console.log(result.recordset)
            res.render('management/room/requests', {
                transactionList: result[0].recordset,
                pageCount: result[1].recordset[0].count
            })
        })
    }
}