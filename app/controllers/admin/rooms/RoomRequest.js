const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const RoomTransactionRequest = require('../../../models/RoomTransactionRequest')

module.exports = {
    getPage: (req, res) => {
        Promise.all([RoomTransactionRequest.fetchAll(10, res.locals.slug), RoomTransactionRequest.getCount(res.locals.slug)]).then(result => {
            console.log(result.recordset)
            res.render('admin/rooms/requests', {
                transactionList: result[0].recordset,
                totalentries: result[0].recordset ? result[0].recordset.length : 0,
                pageCount: result[1].recordset[0].count
            })
        })
    },

    
    search: (req, res) => {
        
        let rowcount = 10;
        RoomTransactionRequest.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.status(200).json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.status(200).json({
                    status: "200",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

       
        RoomTransactionRequest.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
         console.log(error)
        })
    },
}