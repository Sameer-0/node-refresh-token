const ProgramSessions = require('../../../models/ProgramSessions');
const Days = require('../../../models/Days');
const CancellationReasons = require('../../../models/CancellationReasons')
const RescheduleFlags = require('../../../models/RescheduleFlags')
const AcademicCalender = require('../../../models/AcademicCalender')
const Simulation = require('../../../models/Simulation')


module.exports = {
  getPage: (req, res) => {
    let slug = res.locals.slug;
    Promise.all([Simulation.dateRange(slug), Simulation.semesterDates(slug), CancellationReasons.fetchAll(50), Simulation.rescheduleFlag(slug), Simulation.slotData(slug), Simulation.programList(slug), Days.fetchActiveDay(res.locals.slug), Simulation.facultyLectureCount(res.locals.slug)]).then(result => {
      console.log('result[3].recordset', result[2].recordset)
      res.render('admin/rescheduling/index', {
        dateRange: result[0].recordset[0],
        semesterDates: result[1].recordset,
        cancellationReasons: result[2].recordset,
        rescheduleFlag: result[3].recordset,
        slotData: result[4].recordset,
        programList: result[5].recordset,
        dayList: result[6].recordset,
        pageCount: result[7].recordset[0].count,
        breadcrumbs: req.breadcrumbs,
        Url: req.originalUrl
      })
    })
  },

  startSimulation: function (req, res, next) {

    console.log('Clicked-------->')
    let request = req.app.locals.db.request()

    async function execFreezeTimesheet() {

      let generateTimesheet = await new Promise((resolve) => {
        console.log("=====>>>>>>>>> GENERATING TIME SHEET");

        request.output('output', sql.Int)
        request.execute('[' + res.locals.slug + '].generateTimesheet07042020', async function (err, result) {
          if (err) {
            console.log(err);
          } else {
            let answers = await result
            let outputVal = answers.output.output;
            console.log(" outputVal =====>>>>>>>>> ", outputVal);
            if (outputVal == 1) {
              return resolve(answers)
            } else {
              res.json({
                status: "Failed",
                message: "Timesheet generation failed.",
                data: answers
              })
            }
          }
        })
      })

      let facultyTimesheet = await new Promise((resolve) => {
        console.log("=====>>>>>>>>> GENERATING FACULTY TIME SHEET");
        request.output('output', sql.Int)
        request.execute('[' + res.locals.slug + '].facultyTimesheet20042020', async function (err, result) {
          console.log("FACULTY TIMESHEET EXECUTING")
          if (err) throw err;
          let outputVal = await result.output.output
          console.log("FACULTY TIMESHEET EXECUTED")
          console.log("outputVal =====>>>>>>>>> ", outputVal);

          if (outputVal == 1) {
            console.log("NEXT PROMISE EXECUTING")
            return resolve(1)
          } else {
            console.log("EXEC STOPPED")
            res.json({
              status: "Failed",
              message: "Timesheet generation failed.",
              data: outputVal
            })
          }

        })
      })

      console.log(" TO UPDATE STATUS =====>>>>>>>>> ");

      let updateStatus = await new Promise((resolve) => {
        console.log("=====>>>>>>>>>UPDATEING STATUS");
        let stmt = "IF NOT EXISTS (SELECT * FROM [" + res.locals.slug + "].statusTable WHERE title = 'isFreezed') INSERT INTO [" + res.locals.slug + "].statusTable (title, status, timesUpdated) VALUES('isFreezed', 'Y', 1) ELSE UPDATE [" + res.locals.slug + "].statusTable SET status='Y', timesUpdated = (SELECT timesUpdated FROM [" + res.locals.slug + "].statusTable WHERE title='isFreezed') + 1 WHERE title = 'isFreezed'"
        request.query(stmt, async function (err, result) {
          if (err) {
            res.json({
              status: "Failed",
              message: "Freezed status could not be updated.",
              data: generateTimesheet
            })
          }

          res.json({
            status: "ok",
            message: "simulated data",
            data: generateTimesheet
          })

        })
      })

    }

    execFreezeTimesheet()


    // try {
    //   let request = req.app.locals.db.request()
    //   request.output('output', sql.Int)
    //   request.execute('[' + res.locals.slug + '].generateTimesheet07042020', async function (err, result) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       let answers = await result
    //       let isFreezed = answers.output.output;
    //       console.log("isFreezed", isFreezed);
    //       console.log('answer---------------------------->', answers);

    //       if (isFreezed === 1) {
    //         let stmt = "IF NOT EXISTS (SELECT * FROM [" + res.locals.slug + "].statusTable WHERE title = 'isFreezed') INSERT INTO [" + res.locals.slug + "].statusTable (title, status, timesUpdated) VALUES('isFreezed', 'Y', 1) ELSE UPDATE [" + res.locals.slug + "].statusTable SET status='Y', timesUpdated = (SELECT timesUpdated FROM [" + res.locals.slug + "].statusTable WHERE title='isFreezed') + 1 WHERE title = 'isFreezed'"
    //         request.query(stmt, async function (err, result) {
    //           if (err) {
    //             console.log(err)
    //             res.json({
    //               status: "Failed",
    //               message: "simulated data failed",
    //               data: answers
    //             })
    //           } else {
    //             let fetchResult = await result
    //             let outputVal = result.output.output

    //             console.log("Result ====>>>>", fetchResult)
    //             console.log("Output Value ====>>>>", outputVal)


    //             if (outputVal == 1) {
    //               res.json({
    //                 status: "ok",
    //                 message: "simulated data",
    //                 data: answers
    //               })
    //             }

    //           }
    //         })
    //       }
    //     }
    //   })

    //   // ... error checks

    // } catch (e) {
    //   console.log(e);
    // }
  },

  getSimulatedData: function (req, res, next) {

    let request = req.app.locals.db.request()
    let date = sanitizer.value(req.body.selectedDate, String)
    //let sqlstmt = "SELECT * FROM [" + res.locals.slug + "].timesheet07042020 WHERE DateString = CONVERT(VARCHAR(10), CAST('" + date + "' AS DATETIME), 103)"

    let sqlstmt = `SELECT 
    id,
    room_no AS roomno,
    room_uid,
    slot_no AS slotno, 
    start_time AS 
    starttime, 
    end_time AS endtime, 
    'Y' AS isBooked, 
    program_id AS bookedProgramId, 
    acad_year AS bookedAcadYear,
    acad_session AS bookedAcadSession,
    div AS bookedDiv,
    event_name AS eventName,
    event_id AS eventId,
    sap_event_id AS sapEventId,
    created_type AS createdType,
    uuid,
    faculty_id AS facultyId,
    event_type AS eventType,
    unique_id_for_sap AS uniqueIdForSAP,
    sap_flag AS sapFlag,
    sap_remark AS remark,
    sap_remark AS remarkType,
    date_str,
    day_str,
    is_adjusted_cancel,
    IIF(sap_flag = 'E' AND is_new_ec = 1, 1, 0) AS is_new_ec
    FROM faculty_timetable WHERE date_str = CONVERT(VARCHAR(10), CAST('${date}' AS DATETIME), 103) AND active = 1`

    console.log('sqlstmt: ', sqlstmt)

    request.query(sqlstmt, async function (err, result) {
      if (err) {
        throw err;
      } else {
        let response = await result;
        let row = null;

        if (response.recordset.length > 0) {
          row = response.recordset[0];
          res.json({
            status: "200",
            message: "Data fetched",
            date: row.date_str,
            dayName: row.day_str,
            data: response.recordset
          })
        } else {
          res.json({
            status: "200",
            message: "Data not available",
            data: row
          })
        }
      }
    })
  },

  getDroppedSlots: function (req, res, next) {
    let request = req.app.locals.db.request()
    let sqlstmt = `SELECT slotAllotedFor, moduleId, programId, campusId, uuid, transactionId, selectedRFlags, (SELECT denotedBy FROM dbo.rescheduleFlags WHERE id = selectedRFlags) AS flag FROM [${res.locals.slug}].droppedSlotsAfterEvents WHERE active = 'Y'`
    request.query(sqlstmt, async function (err, result) {
      if (err) throw err;
      let data = await result.recordset

      res.json({
        status: "200",
        message: "Dropped evented slots fetched",
        data: data
      })
    })
  },

  getDroppedSlotsReallocation: (req, res, next) => {
    let request = req.app.locals.db.request()
    // const ps = new sql.PreparedStatement(req.app.locals.db);
    // ps.input('slug', sql.NVarChar)
    // ps.input('flag', sql.Int);
    let sqlstmt;

    if (req.body.allocationFlag == 2) {
      sqlstmt = `SELECT slotAllotedFor, moduleId, programId, campusId, uuid, transactionId, selectedRFlags, (SELECT denotedBy FROM dbo.rescheduleFlags WHERE id = selectedRFlags) AS flag FROM [${res.locals.slug}].droppedSlotsAfterEvents WHERE active = 'Y' AND selectedRFlags = 2`
    } else if (req.body.allocationFlag == 3) {
      sqlstmt = `SELECT slotAllotedFor, moduleId, programId, campusId, uuid, transactionId, selectedRFlags, (SELECT denotedBy FROM dbo.rescheduleFlags WHERE id = selectedRFlags) AS flag FROM [${res.locals.slug}].droppedSlotsAfterEvents WHERE active = 'Y' AND selectedRFlags = 3`
    } else if (req.body.allocationFlag == 4) {
      sqlstmt = `SELECT slotAllotedFor, moduleId, programId, campusId, uuid, transactionId, selectedRFlags, (SELECT denotedBy FROM dbo.rescheduleFlags WHERE id = selectedRFlags) AS flag FROM [${res.locals.slug}].droppedSlotsAfterEvents WHERE active = 'Y' AND (selectedRFlags = 1 OR selectedRFlags = 5)`
    }

    request.query(sqlstmt, async function (err, result) {
      if (err) throw err;
      let data = await result.recordset

      console.log("data==>> ", data)

      res.json({
        status: "200",
        message: "Dropped evented slots fetched",
        data: data
      })
    })

    // ps.prepare(sqlstmt, err => {
    //   ps.execute({
    //     slug: res.locals.slug,
    //     flag: req.body.allocationFlag
    //   }, (err, result) => {
    //     console.log("Fetched Data===>> ", result)
    //     ps.unprepare(err => {
    //       console.log("Fetched Data===>> ", result)
    //     })
    //   })
    // })
  },

  getFacultyList: function (req, res, next) {
    console.log("Get Faculty List")

    let request = req.app.locals.db.request()

    let programId = sanitizer.value(req.body.programId, String);
    let slotName = sanitizer.value(req.body.slotName, String);
    let campusId = sanitizer.value(req.body.campusId, String);
    let inputDate = sanitizer.value(req.body.inputDate, String);
    let moduleId = sanitizer.value(req.body.moduleId, String);
    let transactionId = sanitizer.value(req.body.transactionId, String);

    console.log("programId===>> ", programId)
    console.log("slotName===>> ", slotName)
    console.log("campusId===>> ", campusId)
    console.log("inputDate===>> ", inputDate)
    console.log("moduleId===>> ", moduleId)
    console.log("transactionId===>> ", transactionId)

    request.input('moduleId', sql.NVarChar(20), moduleId);
    request.input('programId', sql.Int, programId);
    request.input('slotname', sql.NVarChar(20), slotName);
    request.input('dateString', sql.NVarChar(20), inputDate);
    request.input('campusId', sql.NVarChar(20), campusId);
    request.input('transactionId', sql.NVarChar(100), transactionId);
    request.output('output', sql.Int);

    async function execGetFacultyList() {

      let facultyAvailable = await new Promise(resolve => {
        request.execute('[' + res.locals.slug + '].facultyAvailableGlobalDateWise', async function (err, result) {
          if (err) throw err;
          console.log(result)
          let outputValue = await result;
          console.log("Output Value: ", outputValue);
          return resolve(1)
        })
      })

      let facultyList = await new Promise(resolve => {
        request.query(`SELECT facultyId, facultyName, programId, campusId FROM [${res.locals.slug}].facultyAvailableListDateWise`, async (err, result) => {
          if (err) throw err;
          let list = await result.recordset;
          console.log("Faculty List ====>>>", list)
          res.json({
            status: "200",
            message: "Faculty list fetched.",
            facultyList: list
          })
        })
      })

    }
    execGetFacultyList()
  },

  checkDaysLecture: async (req, res, next) => {
    let request = req.app.locals.db.request();

    console.log('req.body.monthInt: ', req.body.monthInt)
    let stmt = `SELECT CONVERT(NVARCHAR, CONVERT(DATE, date_str, 103), 23) AS dateStr FROM faculty_timetable WHERE active = 1 AND date_str IN (SELECT date_str FROM [${res.locals.slug}].timesheet07042020 WHERE month_int = ${req.body.monthInt})
    GROUP BY date_str`;

    console.log('stmt: ', stmt)

    let result = await request.query(stmt);
    let bookedDates = result.recordset;

    console.log(bookedDates)

    res.json({
      status: 200,
      dateList: bookedDates
    })

  },

  getResFaculties: async (req, res, next) => {
    let request = req.app.locals.db.request();

    let stmt = `SELECT facultyId, facultyName FROM [${res.locals.slug}].faculty_work WHERE active = 'Y' AND moduleId = '${req.body.moduleId}' AND programId = ${req.body.programId}`;

    console.log('facultyStmt: ', stmt)

    let result = await request.query(stmt);
    let facultyList = result.recordset;

    console.log(facultyList)

    res.json({
      status: 200,
      facultyList: facultyList
    })

  },

  getResSlots: async (req, res, next) => {
    let request = req.app.locals.db.request();

    console.log('req.body.facultyId: ', req.body.facultyId)
    console.log('req.body.dateStr: ', req.body.dateStr)

    let stmt = `SELECT DISTINCT slotName, starttime, endtime, sapStartTime, sapEndTime FROM [${res.locals.slug}].school_timing WHERE slotName NOT IN (SELECT DISTINCT slot_name FROM faculty_timetable WHERE active = 1 AND faculty_id = '${req.body.facultyId}' AND date_str = '${req.body.dateStr}')`;

    console.log('slotStmt: ', stmt)

    let result = await request.query(stmt);
    let slotList = result.recordset;

    console.log(slotList)

    res.json({
      status: 200,
      slotList: slotList
    })

  },

  getResRooms: async (req, res, next) => {
    let request = req.app.locals.db.request();

    let stmt = `SELECT DISTINCT room_no FROM (SELECT rs.room_no, rs.slot_name FROM [${res.locals.slug}].all_room_slots rs
      LEFT JOIN (SELECT DISTINCT room_no, slot_name FROM faculty_timetable WHERE date_str = '${req.body.dateStr}' AND active = 1) ft
      ON ft.room_no = rs.room_no AND ft.slot_name = rs.slot_name WHERE ft.slot_name IS NULL) rooms 
      WHERE slot_name = '${req.body.slotName}'`;

    console.log('roomStmt: ', stmt)


    let result = await request.query(stmt);
    let roomList = result.recordset;

    console.log(roomList)

    res.json({
      status: 200,
      roomList: roomList
    })

  },

  getResFacultiesRooms: async (req, res, next) => {

    console.log('>>>>>>>>MODIFY<<<<<<<<<')
    let request = req.app.locals.db.request();


    let facultyStmt = ` SELECT fw.* FROM (SELECT facultyId, facultyName FROM [${res.locals.slug}].faculty_work WHERE active = 'Y' AND moduleId = '${req.body.moduleId}' AND programId = ${req.body.programId}) fw LEFT JOIN (SELECT faculty_id, faculty_name FROM faculty_timetable WHERE active = 1 AND date_str = '${req.body.dateStr}' AND slot_name = '${req.body.slotName}' AND program_id = '${req.body.programId}' AND module_id = '${req.body.moduleId}' AND room_no <> '${req.body.roomNo}') f ON f.faculty_id = fw.facultyId WHERE f.faculty_id IS NULL`;

    let roomStmt = `SELECT DISTINCT room_no FROM (SELECT rs.room_no, rs.slot_name FROM [${res.locals.slug}].all_room_slots rs LEFT JOIN (SELECT DISTINCT room_no, slot_name FROM faculty_timetable WHERE date_str = '${req.body.dateStr}' AND active = 1) ft ON ft.room_no = rs.room_no AND ft.slot_name = rs.slot_name WHERE ft.slot_name IS NULL) rooms WHERE slot_name = '${req.body.slotName}' OR room_no = '${req.body.roomNo}'`;


    console.log('facultyStmt: ', facultyStmt)
    console.log('roomStmt: ', roomStmt)

    Promise.all([request.query(facultyStmt), request.query(roomStmt)]).then(result => {

      console.log('After promise>>>>>>>>>>>>>>>>>>')
      console.log(result)

      res.json({
        status: 200,
        facultyList: result[0].recordset,
        roomList: result[1].recordset
      })
    })

  },

  getCancelledLectures: async (req, res, next) => {

    console.log('>>>>>>>>MODIFY<<<<<<<<<')
    let request = req.app.locals.db.request();


    let facultyStmt = `WITH cte AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY unx_lid ORDER BY id DESC) AS row_num FROM reschedule_transaction WHERE trans_status = 'success')
    SELECT id, transaction_id, z_flag, event_name, event_type, program_id, module_id, division, acad_session, faculty_id, date_str, room_no, acad_year, slot_name, (SELECT sapStartTime FROM [${res.locals.slug}].school_timing WHERE active = 'Y' AND dayId = 1 AND slotName = slot_name) AS start_time, (SELECT sapEndTime FROM [${res.locals.slug}].school_timing WHERE active = 'Y' AND dayId = 1 AND slotName = slot_name) AS end_time, reason_id, sap_event_id, unx_lid FROM cte WHERE row_num = 1 AND z_flag = 'C'`;

    console.log('facultyStmt: ', facultyStmt)
    //console.log('roomStmt: ', roomStmt)

    Promise.all([request.query(facultyStmt)]).then(result => {

      console.log('After promise>>>>>>>>>>>>>>>>>>')
      console.log(result[0].recordset)

      res.json({
        status: 200,
        lectureList: result[0].recordset
      })
    })

  },

  getAcadSessions: async (req, res, next) => {

    console.log('>>>>>>>>GET ACAD SESSIONS<<<<<<<<<')
    let db = req.app.locals.db.request();

    db.query(`SELECT DISTINCT acad_session FROM faculty_timetable WHERE active = 1 AND program_id = '${req.body.programId}' ORDER BY acad_session`).then(result => {
      res.json({
        status: 200,
        sessionList: result.recordset
      })
    })
  },

  getDivisions: async (req, res, next) => {

    console.log('>>>>>>>>GET DIVISIONS<<<<<<<<<')
    let db = req.app.locals.db.request();

    db.query(`SELECT DISTINCT div FROM faculty_timetable WHERE active = 1 AND program_id = '${req.body.programId}' AND acad_session = '${req.body.acadSession}'  ORDER BY div`).then(result => {
      res.json({
        status: 200,
        divisionList: result.recordset
      })
    })
  },

  getLectures: async (req, res, next) => {

    console.log('>>>>>>>>GET LECTURES<<<<<<<<<')
    Simulation.getLectures(res.locals.slug, req.body).then(result => {
      res.json({
        status: 200,
        lectureList: result.recordset
      })
    })
  },

  getExtraClassFaculties: async (req, res, next) => {
    console.log('>>>>>>>>EXTRA CLASS FACULTIES<<<<<<<<<')
    Promise.all([Simulation.extraClassFaculties(res.locals.slug, req.body)]).then(result => {
      console.log('After promise>>>>>>>>>>>>>>>>>>')
      console.log(result)
      res.json({
        status: 200,
        facultyList: result[0].recordset
      })
    })

  },


  getNewExtraLectures: async (req, res, next) => {
    console.log('>>>>>>>getNewExtraLectures<<<<<<<<<')
    console.log(req.body)
    Promise.all([Simulation.newExtraLecture(res.locals.slug, req.body)]).then(result => {
      console.log('After promise>>>>>>>>>>>>>>>>>>')
      console.log(result[0].recordset)
      res.json({
        status: 200,
        lectureList: result[0].recordset
      })
    }).catch(err => {
      console.log(err)
    })
  },

  facultiesDateRange: async (req, res, next) => {
    console.log('>>>>>>>get faculties date range<<<<<<<<<')
    console.log(req.body)
    Promise.all([Simulation.facultyDateRange(res.locals.slug, req.body)]).then(result => {
      console.log('After promise>>>>>>>>>>>>>>>>>>')
      console.log(result[0].recordset)
      res.json({
        status: 200,
        facultyList: result[0].recordset
      })
    }).catch(err => {
      console.log(err)
    })
  },

  fetchBulkCancel: async (req, res, next) => {
    console.log('>>>>>>>fetchBulkCancel<<<<<<<<<')
    Promise.all([Simulation.facultyLecture(res.locals.slug, req.body),
      Simulation.facultyLectureCount(res.locals.slug)
    ]).then(result => {
      res.json({
        status: 200,
        lectureList: result[0].recordset,
        dataLength: result[1].recordset[0].count
      })
    }).catch(err => {
      console.log(err)
    })
  },

  fetchBulkCancelPagination: async (req, res, next) => {
    console.log('>>>>>>>fetchBulkCancelPagination<<<<<<<<<')
    console.log(req.body)
    Simulation.facultyLecture(res.locals.slug, req.body).then(result => {
      res.json({
        status: 200,
        lectureList: result.recordset
      })
    }).catch(err => {
      console.log(err)
    })
  },

  showEntries: async (req, res, next) => {
    console.log('>>>>>>>showEntries<<<<<<<<<')
    Simulation.facultyLectureLimit(res.locals.slug, req.body).then(result => {
      res.json({
        status: 200,
        lectureList: result.recordset,
      })
    }).catch(err => {
      console.log(err)
    })
  },

  getReplacingFaculties: async (req, res, next) => {
    console.log('>>>>>>>getReplacingFaculties<<<<<<<<<')
    console.log(req.body)
    let lectureListStmt =
      console.log(lectureListStmt)
    Promise.all([Simulation.facultyByModuleProgramId(res.locals.slug, req.body),
      Simulation.facultyByModuleProgramSapDivisionId(res.locals.slug, req.body)
    ]).then(result => {
      console.log('After promise>>>>>>>>>>>>>>>>>>')
      console.log(result[1].recordset)
      res.json({
        status: 200,
        facultyList: result[0].recordset,
        lectureList: result[1].recordset
      })
    })
  },
}