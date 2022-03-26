const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
module.exports = {
    getPage: (req, res) => {
        Promise.all([SlotIntervalTimings.fetchAll(1000)]).then(result=>{
            res.render('admin/faculty/preference',{
                slotIntervalTimings:result[0].recordset,
                facultyWorkList:[],
                programDayList:[],
                pageCount:0
            })
        })
       

    }
}