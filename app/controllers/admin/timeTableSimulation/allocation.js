const ProgramSessions = require('../../../models/ProgramSessions');
const TimeTableAllocation = require('../../../models/TimeTableAllocation')


module.exports = {

    getPage:(req, res)=>{

        Promise.all([
            ProgramSessions.getUnlockedProgram(res.locals.slug),
            
        ])
        .then(result => {

            console.log('allocationlist:::', result[0].recordset);

            res.render('admin/timeTableSimulation/allocation', {
                programList: result[0].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
       
    },

    generateTimeTable:(req, res) => {

        TimeTableAllocation.generateTimeTable(programLid, sessionLid, res.locals.slug)
        .then(result => {})
        .catch(err => { console.log(err)})
    }
} 