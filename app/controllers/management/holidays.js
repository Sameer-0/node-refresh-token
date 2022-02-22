const Holidays = require('../../models/Holidays')
const Campuses = require('../../models/Campuses')
const Organizations = require('../../models/Organizations')
const HolidayTypes = require('../../models/HolidayTypes')
module.exports = {
    getPage: (req, res) => {
        Promise.all([Holidays.fetchAll(10), Campuses.fetchAll(100), Organizations.fetchAll(100),HolidayTypes.fetchAll(100)]).then(result => {
            console.log('List:::::::::::::::::>',result[2].recordset)
            res.render('management/holiday/index', {
                holidayList: result[0].recordset,
                campusList: result[1].recordset,
                orgList: result[2].recordset,
                holidayTypeList:result[3].recordset
            })
        })
    }
}