const Holidays = require('../../models/Holidays')

module.exports = {
    getPage: (req, res) => {
        Promise.all([Holidays.fetchAll(10)]).then(result => {
            res.render('management/holiday/index', {
                holidayList: result[0].recordset
            })
        })
    }
}