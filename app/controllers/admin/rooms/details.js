const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomTransactionDetails = require('../../../models/RoomTransactionDetails')

module.exports = {

    findByLid: (req, res) => {
        console.log('req::::::::::::::::::::', req.query.id)
        RoomTransactionDetails.findByRoomTransactionId(req.query.id, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                data: result.recordset,
                message:'success',
                breadcrumbs: req.breadcrumbs,
            })
            console.log(result.recordset)
        })
    }

}