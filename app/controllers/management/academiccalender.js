const AcademicCalender = require("../../models/AcademicCalender")

module.exports = {
    getPage: (req, res) => {
        AcademicCalender.fetchAll(10).then(result => {
            res.render('management/academic/acadCalender', {
                acadCalender: result.recordset
            })
        })
    },


    search: (req, res) => {
        //here 10is rowcount
        let rowcont  = 10;
        AcademicCalender.search(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "fetched",
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