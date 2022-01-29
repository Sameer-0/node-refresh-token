const divisionModel = require('../../models/Divisions')
const divBatchModel = require('../../models/DivisionBatches')

module.exports = {
    getPage: (req, res) => {
        Promise.all([divBatchModel.fetchAll(10), divisionModel.fetchAll(50)]).then(result => {
            res.render('management/division/divisionBatches', {
                batchList: result[0].recordset,
                divisionList: result[1].recordset
            })
        })
    },

    createBatch: (req, res) => {
        divBatchModel.addBatch(req.body).then(result => {
            res.json({
                status:200,
                message: 'success',
                body: req.body
            })
        })
    },

    getBatchById: (req, res) => {
        divBatchModel.getBatch(req.query.id).then(result => {
            res.json({
                status: 200,
                batchData: result.recordset[0]
            })
        })
    },

    updateBatchById: (req, res) => {
        divBatchModel.updateBatch(req.body).then(result => {
            res.json({
                status:200
            })
        })
    }
}