const ProgramSessions = require('../../../models/ProgramSessions');
const Days = require('../../../models/Days');
const CancellationReasons = require('../../../models/CancellationReasons')
const RescheduleFlags = require('../../../models/RescheduleFlags')
const AcademicCalender = require('../../../models/AcademicCalender')
const Simulation = require('../../../models/Simulation')
module.exports = {
  // getPage: (req, res) => {
  //     Promise.all([ProgramSessions.getLockedProgram(res.locals.slug), Days.fetchActiveDay(res.locals.slug), CancellationReasons.fetchAll(100), RescheduleFlags.fetchAll(), AcademicCalender.fetchAll(1000)]).then(result => {
  //         res.render('admin/rescheduling/index', {
  //             programList: result[0].recordset,
  //             dayList: result[1].recordset,
  //             cancelationList: result[2].recordset,
  //             rescheduleFlags : result[3].recordset,
  //             acadCalender: result[4].recordset,
  //             breadcrumbs: req.breadcrumbs,
  //             Url: req.originalUrl
  //         })
  //     }).catch(error => {
  //         console.log('error', error)
  //     })
  // }

  getPage: (req, res) => {

    let slug = res.locals.slug;

    Promise.all([Simulation.dateRange(slug), Simulation.semesterDates(slug), CancellationReasons.fetchAll(50), Simulation.rescheduleFlag(slug), Simulation.slotData(slug), Simulation.programList(slug), Days.fetchActiveDay(res.locals.slug), ]).then(result => {
console.log('result[3].recordset', result[2].recordset)
      res.render('admin/rescheduling/index', {
        dateRange: result[0].recordset[0],
        semesterDates: result[1].recordset,
        cancellationReasons: result[2].recordset,
        rescheduleFlag: result[3].recordset,
        slotData: result[4].recordset,
        programList: result[5].recordset,
        dayList: result[6].recordset,
        breadcrumbs: req.breadcrumbs,
        Url: req.originalUrl
      })

    })
  }
}