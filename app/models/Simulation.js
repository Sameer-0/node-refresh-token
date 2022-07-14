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

    static semesterDates(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT dateString, dateNameString, status FROM [${slug}].timesheet07042020`)
        })
    }

    static rescheduleFlag(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, name, denoted_by as denotedBy FROM [dbo].reschedule_flags WHERE active = 1`)
        })
    }

    static slotData(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select len(sit.slot_name),  sit.slot_name, sit.start_time as starttime, _sit.end_time as  endtime from [${slug}].school_timings st 
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = st.slot_start_lid
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  st.slot_end_lid 
            ORDER BY len(sit.slot_name), sit.slot_name`)
        })
    }

    static programList(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT p.id, p.program_id, p.program_name as programName from [${slug}].faculty_timetable ft INNER JOIN [${slug}].programs p ON p.id = ft.program_lid WHERE ft.active = 1`)
        })
    }

    static roomList(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT roomno, roomtype, room_uid FROM [${slug}].room_data WHERE active = 'Y'`)
        })
    }

    static userProgramId(slug, username) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT programId FROM [${slug}].users WHERE username = '${username}'`)
        })
    }

    static facultyLecture(slug, body) {
        return poolConnection.then(pool => {
            let lecStmt;
            if (!body.facultyId) {
                lecStmt = `SELECT * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC  OFFSET (@pageNo - 1) * 50 ROWS FETCH NEXT 50 ROWS ONLY`
            } else {
                lecStmt = `SELECT * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND faculty_id = @facultyId AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC  OFFSET (@pageNo - 1) * 50 ROWS FETCH NEXT 50 ROWS ONLY`
            }
            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('facultyId', sql.Int, body.facultyId)
                .input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyLectureCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .query(`SELECT COUNT(*) as count FROM [${slug}].faculty_timetable WHERE active = 1 AND (sap_flag <> 'E' OR is_new_ec <> 1)`)
        })
    }

    static facultyLectureLimit(slug, body) {
        return poolConnection.then(pool => {
            let lecStmt;
            if (!body.facultyId) {
                lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC;`
            } else {
                lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND faculty_id = @facultyId AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC;`
            }
            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('facultyId', sql.Int, body.facultyId)
                .input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyByModuleProgramId(slug, body){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .query(`SELECT facultyId, facultyName, type FROM [${slug}].facultyWorkloadStatus WHERE active = 'Y' AND moduleId = @programId AND programId = @moduleId`)
        })
    }

    static facultyByModuleProgramSapDivisionId(slug, body){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('sapEventId', sql.NVarChar(20), body.sapEventId)
                .input('fromFacultyId', sql.NVarChar(20), body.fromFacultyId)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .input('division', sql.NVarChar(20), body.division)
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .query(`SELECT * FROM [${slug}].faculty_timetable WHERE sap_event_id = @sapEventId AND active = 1 AND faculty_id = @fromFacultyId AND program_id = @programId AND module_id = @moduleId AND div = @division AND (CONVERT(DATE, date_str, 103) BETWEEN @fromDate AND @toDate) ORDER BY CONVERT(DATE, date_str, 103), slot_no`)
        })
    }

    static facultyDateRange(slug, body){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .query(`SELECT DISTINCT faculty_id, faculty_name FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103)`)
        })
    }

    static newExtraLecture(slug, body){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('sapEventId', sql.NVarChar(20), body.sapEventId)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .input('division', sql.NVarChar(20), body.division)
                .input('facultyId', sql.NVarChar(20), body.facultyId)
                .query(`SELECT * FROM [${slug}].faculty_timetable WHERE active = 1 AND sap_flag = 'E' AND is_new_ec = 1 AND is_adjusted_cancel = 0 AND sap_event_id = @sapEventId AND program_id = @programId AND module_id = @moduleId AND div = @division AND faculty_id = @facultyId`)
        })
    }

    static extraClassFaculties(slug, body){
        console.log('extraClassFaculties Body:::::::::>>>',body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('dateStr', sql.NVarChar(20), body.dateStr)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .input('slotName', sql.NVarChar(20), body.slotName)
                .input('facultyId', sql.NVarChar(20), body.facultyId)
                .query(`SELECT fw.* FROM (SELECT id, facultyId, facultyName FROM [${slug}].facultyWorkloadStatus WHERE active = 'Y' AND moduleId = @moduleId AND programId = @programId) fw LEFT JOIN (SELECT faculty_id, faculty_name FROM faculty_timetable WHERE active = 1 AND date_str = @dateStr AND slot_name = @slotName' AND program_id = @programId AND module_id = @moduleId) f ON f.faculty_id = fw.facultyId WHERE f.faculty_id IS NULL`)
        })
    }


    static getLectures(slug, body){
        console.log('getLectures Body:::::::::>>>',body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('acadSession', sql.NVarChar(20), body.acadSession)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('division', sql.NVarChar(20), body.division)
                .query(`SELECT DISTINCT Stuff((SELECT N'-' + part FROM fn_SplitString1(event_name, '-') WHERE id = 1 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'') AS event_name, event_abbr, sap_event_id, module_id, acad_year, event_type, unique_id_for_sap FROM [${slug}].faculty_timetable  WHERE active = 1 AND program_id = @programId AND acad_session = @acadSession AND div = @division`)
        })
    }

    static findByFacultyTimeTableByProgramId(program_lid, slug){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), program_lid)
                .query(`SELECT * FROM [${slug}].faculty_timetable WHERE active = 1 AND program_lid = @program_lid AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC`)
        })
    }
}