const Faculties = require('../../../models/Faculties');
const FacultyDateTimes = require('../../../models/FacultyDateTimes');
const AcademicCalender  = require('../../../models/AcademicCalender');
const SlotIntervalTimings  = require('../../../models/SlotIntervalTimings');
const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

module.exports = {
    getPage: (req, res) => {

        Promise.all([FacultyDateTimes.fetchAll(10, res.locals.slug), FacultyDateTimes.getCount(res.locals.slug), Faculties.fetchAll(1000, res.locals.slug), AcademicCalender.fetchAll(1000), SlotIntervalTimings.fetchAll(1000)]).then(result => {
      
            res.render('admin/faculty/facultydatetime', {
                FacultyDateTimeList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                facultyList: result[2].recordset,
                AcademicCalenderList: result[3].recordset,
                SlotIntervalTimingsList: result[4].recordset
            })
        })

    },
}