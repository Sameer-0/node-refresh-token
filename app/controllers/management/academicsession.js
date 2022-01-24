const AcadSession = require("../../models/AcadSession")

module.exports = {
 
    getPage: (req, res) => {
        AcadSession.fetchAll(10).then(result => {
            res.render('management/academic/acadSession', {
                acadSession: result.recordset
            })
        })

    },

    search: (req, res) => {
        let rowcount = 10;
        AcadSession.search(rowcount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Academic Session fetched",
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
            console.log(error)
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    },

    create: (req, res) => {
        AcadSession.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        }).catch(error => {
            res.json({
                status: 500,
                message: "Fail",
            })
        })
    },

    single: (req, res) => {
        AcadSession.getById(req.query.id).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        })
    },

    update: (req, res) => {
        AcadSession.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        })
    },

    delele: (req, res) => {
        AcadSession.softDeleteById(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        })
    }
}