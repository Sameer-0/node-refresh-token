const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const FacultyWorks = require('../../../models/FacultyWorks')

module.exports = {
    getPage: (req, res) => {
        Promise.all([SlotIntervalTimings.fetchAll(1000), FacultyWorks.fetchAll(10, res.locals.slug)]).then(result=>{
            res.render('admin/faculty/preference',{
                slotIntervalTimings:result[0].recordset,
                facultyWorkList:[],
                programDayList:[],
                pageCount:0
            })
        })
    }
}