const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Simulation {

    static dateRange(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT CONVERT(NVARCHAR, MIN(CONVERT(DATE, date_str, 103)), 23) AS minDate, CONVERT(NVARCHAR, DATEADD(DAY, 1, MAX(CONVERT(DATE, date_str, 103))), 23) AS maxDate FROM [${slug}].timesheet`)
        })
    }

    static semesterDates(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT date_str as dateString, day_name as dateNameString, active FROM [${slug}].timesheet`)
        })
    }

    static rescheduleFlag(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, name, LTRIM(RTRIM(denoted_by)) as denotedBy FROM [dbo].reschedule_flags WHERE active = 1`)
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
            return pool.request().query(`SELECT DISTINCT p.id, p.program_id, p.program_name as programName from [${slug}].timesheet ft INNER JOIN [${slug}].programs p ON p.id = ft.program_lid WHERE ft.active = 1`)
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

    static getAvailableRoomForTimeRange(slug, dayLid, startSlot, endSlot) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('dayLid', sql.Int, dayLid)
            .input('startSlot', sql.Int, startSlot)
            .input('endSlot', sql.Int, endSlot)
            .query(`SELECT DISTINCT eb.room_lid, r.room_number  FROM [${slug}].event_bookings  eb
            INNER JOIN rooms r ON r.id = eb.room_lid
            WHERE day_lid = @dayLid AND slot_lid BETWEEN @startSlot and @endSlot AND event_lid IS NULL`)
        })
    }

    static LectureByDateRange(slug, body) {
        console.log('body:::::::::',body)
        return poolConnection.then(pool => {
            let lecStmt = `SELECT * FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND program_lid = @program_lid AND  division_lid = @division_lid AND module_lid = @module_lid AND acad_session_lid = @acad_session_lid AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC  OFFSET (@pageNo - 1) * 50 ROWS FETCH NEXT 50 ROWS ONLY`;
           
            console.log('lecStmt:::::::::::::',lecStmt)

            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('facultyId', sql.Int, body.facultyId)
                .input('program_lid', sql.Int, body.program_lid)
                .input('division_lid', sql.Int, body.division_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyLectureCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .query(`SELECT COUNT(*) as count FROM [${slug}].timesheet WHERE active = 1 AND (sap_flag <> 'E' OR is_new_ec <> 1)`)
        })
    }

    static facultyLectureLimit(slug, body) {
        return poolConnection.then(pool => {

            // if (!body.facultyId) {
            //     lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC;`
            // } else if(!body.fromDate && !body.toDate){
            //     lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].faculty_timetable WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND faculty_id = @facultyId AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC;`
            // }else{

            // }

            let lecStmt = `SELECT TOP ${Number(body.rowcount)} * FROM [${slug}].timesheet WHERE active = 1 ORDER BY id ASC;`
            let request = pool.request()
            return request
                // .input('fromDate', sql.NVarChar(20), body.fromDate)
                // .input('toDate', sql.NVarChar(20), body.toDate)
                // .input('facultyId', sql.Int, body.facultyId)
                //.input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyByModuleProgramId(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .query(`SELECT facultyId, facultyName, type FROM [${slug}].facultyWorkloadStatus WHERE active = 'Y' AND moduleId = @programId AND programId = @moduleId`)
        })
    }

    static facultyByModuleProgramSapDivisionId(slug, body) {
        console.log('facilty_lis:::', body)
        return poolConnection.then(pool => {
            let lecStmt = `SELECT DISTINCT faculty_lid, faculty_id, faculty_name FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE,date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103) AND  program_lid = @program_lid AND  division_lid = @division_lid AND module_lid = @module_lid AND acad_session_lid = @acad_session_lid  AND (sap_flag <> 'E' OR is_new_ec <> 1)`;
           
            console.log('lecStmt:::::::::::::',lecStmt)

            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('facultyId', sql.Int, body.facultyId)
                .input('program_lid', sql.Int, body.program_lid)
                .input('division_lid', sql.Int, body.division_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .input('facultyLid', sql.Int, body.facultyLid)
                // .input('pageNo', sql.Int, body.pageNo)
                .query(lecStmt)
        })
    }

    static facultyDateRange(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .input('toDate', sql.NVarChar(20), body.toDate)
                .query(`SELECT DISTINCT faculty_id, faculty_name FROM [${slug}].timesheet WHERE active = 1 AND CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103)`)
        })
    }

    static newExtraLecture(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('sapEventId', sql.NVarChar(20), body.sapEventId)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .input('division', sql.NVarChar(20), body.division)
                .input('facultyId', sql.NVarChar(20), body.facultyId)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND sap_flag = 'E' AND is_new_ec = 1 AND is_adjusted_cancel = 0 AND sap_event_id = @sapEventId AND program_id = @programId AND module_id = @moduleId AND division = @division AND faculty_id = @facultyId`)
        })
    }

    static extraClassFaculties(slug, body) {
        console.log('extraClassFaculties Body:::::::::>>>', body)
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


    static getLectures(slug, body) {
        console.log('getLectures Body:::::::::>>>', body)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('acadSession', sql.NVarChar(20), body.acadSession)
                .input('programId', sql.NVarChar(20), body.programId)
                .input('division', sql.NVarChar(20), body.division)
                .query(`SELECT DISTINCT Stuff((SELECT N'-' + part FROM fn_SplitString1(event_name, '-') WHERE id = 1 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'') AS event_name, event_abbr, sap_event_id, module_id, acad_year, event_type, unique_id_for_sap FROM [${slug}].faculty_timetable  WHERE active = 1 AND program_id = @programId AND acad_session = @acadSession AND division = @division`)
        })
    }

    static findByFacultyTimeTableByProgramId(program_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), program_lid)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND program_lid = @program_lid AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC`)
        })
    }

    static findByFacultyTimeTableByProgramSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('acad_session', sql.NVarChar(20), body.acad_session)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND program_lid = @program_lid AND acad_session = @acad_session AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC`)
        })
    }

    static semesterByProgramId(program_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, program_lid)
                .query(`SELECT DISTINCT acad_session_lid, acad_session FROM [${slug}].timesheet WHERE program_lid = @program_lid`)
        })
    }

    static divisionByProgramSessionId(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('acad_session', sql.Int, body.acad_session)
                .query(`SELECT DISTINCT division as div FROM [${slug}].timesheet WHERE program_lid = @program_lid AND acad_session_lid = @acad_session`)
        })
    }

    static findBySchelDivisionByProgramSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.NVarChar(20), body.program_lid)
                .input('acad_session', sql.NVarChar(20), body.acad_session)
                .input('division', sql.NVarChar(20), body.division)
                .query(`SELECT * FROM [${slug}].timesheet WHERE active = 1 AND program_lid = @program_lid AND acad_session = @acad_session AND division = @division AND (sap_flag <> 'E' OR is_new_ec <> 1) ORDER BY id ASC`)
        })
    }



    static divisionByProgramAcadSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('programId', sql.NVarChar(20), body.programId)
                .input('acadSession', sql.NVarChar(20), body.acadSession)
                .query(`SELECT DISTINCT division as div FROM [${slug}].timesheet WHERE active = 1 AND program_id = @programId AND acad_session = @acadSession  ORDER BY division`)
        })
    }

    static CancelledLectures(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`WITH cte AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY unx_lid ORDER BY id DESC) AS row_num FROM reschedule_transaction WHERE trans_status = 'success')
                SELECT id, transaction_id, z_flag, event_name, event_type, program_id, module_id, division, acad_session, faculty_id, date_str, room_no, acad_year, slot_name, (SELECT sapStartTime FROM [${slug}].school_timing WHERE active = 'Y' AND dayId = 1 AND slotName = slot_name) AS start_time, (SELECT sapEndTime FROM [${slug}].school_timing WHERE active = 'Y' AND dayId = 1 AND slotName = slot_name) AS end_time, reason_id, sap_event_id, unx_lid FROM cte WHERE row_num = 1 AND z_flag = 'C'`)
        })
    }

    static getResFaculties(slug, body) {
        return poolConnection.then(pool => {
            // SELECT facultyId, facultyName FROM [asmsoc_quality].[asmsoc-mum].faculty_work WHERE active = 'Y' AND moduleId = '${req.body.moduleId}' AND programId = ${req.body.programId}

            let request = pool.request()
            return request
                .input('moduleId', sql.NVarChar(20), body.moduleId)
                .input('programId', sql.NVarChar(20), body.programId)
                .query(`SELECT f.faculty_id as facultyId,  f.faculty_name as facultyName FROM [${slug}].faculty_works fw
                INNER JOIN [${slug}].program_sessions ps
                ON ps.id =  fw.program_session_lid
                INNER JOIN [${slug}].faculties f
                ON f.id =  fw.faculty_lid
                where fw.module_lid = @moduleId and ps.program_lid = @programId`)
        })
    }


    static getResSlots(slug, body) {
        return poolConnection.then(pool => {
            // SELECT DISTINCT slotName, starttime, endtime, sapStartTime, sapEndTime FROM [${res.locals.slug}].school_timing WHERE slotName NOT IN (SELECT DISTINCT slot_name FROM faculty_timetable WHERE active = 1 AND faculty_id = '${req.body.facultyId}' AND date_str = '${req.body.dateStr}')
            let request = pool.request()
            return request
                .input('facultyId', sql.NVarChar(20), body.facultyId)
                .input('dateStr', sql.NVarChar(20), body.dateStr)
                .query(`select start_time,  end_time,  sap_start_time  from [${slug}].timesheet WHERE faculty_id = @facultyId  AND date_str = @dateStr`)
        })
    }

    static uniqueFacultyByDate(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('toDate', sql.NVarChar(20), body.toDate)
                .input('fromDate', sql.NVarChar(20), body.fromDate)
                .query(`select DISTINCT faculty_id, faculty_name, faculty_lid 
                from [asmsoc-mum].timesheet WHERE 
                CONVERT(DATE, date_str, 103) BETWEEN CONVERT(DATE, @fromDate, 103) AND CONVERT(DATE, @toDate, 103)`)
        })
    }

    static timeSheetRoomByDate(slug, date_str) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('dateStr', sql.NVarChar(20), date_str)
                .query(`select * from [${slug}].timesheet WHERE date_str = @dateStr`)
        })
    }


    static getResRooms(slug, date_str) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('dateStr', sql.NVarChar(20), date_str)
                .query(`select DISTINCT room_no from [${slug}].timesheet WHERE date_str = @dateStr`)
        })
    }

    static findModuleByProgramSession(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, body.program_lid)
                .input('acad_session', sql.Int, body.acad_session)
                .query(`SELECT DISTINCT module_lid, module_name from [${slug}].timesheet where program_lid = @program_lid and acad_session_lid = @acad_session`)
        })
    }

    static getDivisionByProgramSessionModule(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
                .input('program_lid', sql.Int, body.program_lid)
                .input('acad_session_lid', sql.Int, body.acad_session_lid)
                .input('module_lid', sql.Int, body.module_lid)
                .query(`SELECT DISTINCT division_lid,division from [${slug}].timesheet where program_lid = @program_lid and acad_session_lid = @acad_session_lid and module_lid = @module_lid`)
        })
    }
}