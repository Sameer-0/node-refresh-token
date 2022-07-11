const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Simulation {

    static dateRange(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT CONVERT(NVARCHAR, MIN(CONVERT(DATE, dateString, 103)), 23) AS minDate, CONVERT(NVARCHAR, DATEADD(DAY, 1, MAX(CONVERT(DATE, dateString, 103))), 23) AS maxDate FROM [${slug}].timesheet07042020`)
        })
    }

    static semesterDates(slug){
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT dateString, dateNameString, status FROM [${slug}].timesheet07042020`)
        })
    }

    static rescheduleFlag(slug){
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, name, denoted_by as denotedBy FROM [dbo].reschedule_flags WHERE active = 1`)
        })
    }

    static slotData(slug){
        return poolConnection.then(pool => {
            //`SELECT DISTINCT len(slotName), slotName, starttime, endtime FROM [${slug}].school_timing WHERE active = 'Y' ORDER BY len(slotName), slotName`
            return pool.request().query(`select len(sit.slot_name),  sit.slot_name, sit.start_time as starttime, _sit.end_time as  endtime from [${slug}].school_timings st 
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = st.slot_start_lid
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  st.slot_end_lid 
            ORDER BY len(sit.slot_name), sit.slot_name`)
        })
    }

    static programList(slug){
        // `SELECT e.program_id, p.programName FROM (SELECT DISTINCT program_id FROM [${slug}].faculty_timetable WHERE active = 1) e
        // INNER JOIN [${slug}].programName p ON p.programId = e.program_id`
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT e.program_id, p.program_name as programName FROM (SELECT DISTINCT program_id FROM [asmsoc_quality].[dbo].faculty_timetable WHERE active = 1) e INNER JOIN [${slug}].programs p ON p.program_id = e.program_id`)
        })
    }

    static roomList(slug){
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT roomno, roomtype, room_uid FROM [${slug}].room_data WHERE active = 'Y'`)
        })
    }

    static userProgramId(slug, username){
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT programId FROM [${slug}].users WHERE username = '${username}'`)
        })
    }
}