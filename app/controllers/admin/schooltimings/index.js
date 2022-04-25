const {
    promiseImpl
} = require("ejs")
const schoolTiming = require("../../../models/schoolTiming")

module.exports = {
    getPage: (req, res) => {

        Promise.all([schoolTiming.fetchAll(10, res.locals.slug)]).then(result => {
            console.log(result[0].recordset)
            res.render("admin/schooltimings/index",{
                schoolTimingList: result[0].recordset,
                pageCount: 0
            })
        })
    }
}