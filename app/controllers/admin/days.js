const Days = require('../../models/Days')
const {
    validationResult
} = require('express-validator');

module.exports = {

    getPage: (req, res) => {
        Days.fetchAll(10, res.locals.slug).then(result => {
            res.render('admin/days/index', {
                dayList: result.recordset
            })
        })
    },

    changeStatus: (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        Days.update(req.body, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            console.log(error)
            res.status(500).json(error.originalError.info.message)
        })
    },

}