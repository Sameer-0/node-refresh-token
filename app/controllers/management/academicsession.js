const AcadSession = require("../../models/AcadSession")

module.exports = {
    getPage: (req, res) => {
        res.render('management/academic/index')
    },

    acadSessionPage: (req, res) => {
        AcadSession.fetchAll(10).then(result => {
            res.render('management/academic/acadSession', {
                acadSession: result.recordset
            })
        })

    },

    acadSessionSearch: (req, res) => {
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

    addAcadSession: (req, res) => {
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

    getSingleAcadSession: (req, res) => {
        AcadSession.getById(req.query.id).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        })
    },

    updateAcadSession: (req, res) => {
        AcadSession.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        })
    },

    deleteAcadSession: (req, res) => {
        AcadSession.softDeleteById(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success",
            })
        })
    }
}