const RoomTransactions =  require('../../../models/RoomTransactions')


module.exports = {
    ApproveRequest: (req, res) => {
        RoomTransactions.approveRoom(res.locals.slug, req.body).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    }
}