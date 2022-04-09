const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
const FacultyWorks = require('../../../models/FacultyWorks')
const ProgramDays =  require('../../../models/ProgramDays')
module.exports = {
    getPage: (req, res) => {
        Promise.all([SlotIntervalTimings.fetchAll(1000), FacultyWorks.fetchAll(10, res.locals.slug), ProgramDays.fetchAll(1000, res.locals.slug)]).then(result=>{
         console.log('result[2].recordset:::::::::::::::::::::::',result[2].recordset)
            res.render('admin/faculty/preference',{
                slotIntervalTimings:result[0].recordset,
                facultyWorkList:[],
                programDayList:result[2].recordset,
                pageCount:0
            })
        })
    }
}