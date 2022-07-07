const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class TimeTable {

    static fetch(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select program_lid, acad_session_lid, course_lid, division, batch, day_lid, room_lid, school_timing_lid from [${slug}].event_bookings_bkp where day_lid = 1 AND program_lid = 1 AND acad_session_lid = 16`)
        })
    }

    static getAcadSession(slug, program_lid) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programLid', sql.Int, program_lid).
            query(`SELECT ps.acad_session_lid, ads.acad_session FROM [${slug}].program_sessions ps INNER JOIN
            [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
            WHERE ps.program_lid = @programLid`)
        })
    }


    static getEventsByProgramSessionDay(slug, day_lid, program_lid, acad_session_lid) {

        return poolConnection.then(pool => {
            let stmt;

            //SORT BY SLOT IS NECESSARY FOR PROPER DOM.
            if (program_lid && acad_session_lid) {
                stmt = `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.break_id, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, RTRIM(LTRIM(e.division)) AS division, e.batch_lid, e.batch, e.event_type_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type, fe.faculty_lid, f.faculty_name FROM (SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot
                FROM [${slug}].event_bookings
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)
                GROUP BY room_lid, day_lid, event_lid, is_break, break_id) t2
                LEFT JOIN [${slug}].tb_events e ON e.id = t2.event_lid
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                LEFT JOIN [${slug}].faculty_events fe on fe.event_lid =  e.id
                LEFT JOIN [${slug}].faculties f on f.id = fe.faculty_lid
                WHERE (e.program_lid = @programLid and e.acad_session_lid = @sessionLid) OR is_break = 1
                ORDER BY t2.start_slot, t2.end_slot`
            } else if (!program_lid && acad_session_lid) {
                stmt = `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.break_id, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, RTRIM(LTRIM(e.division)) AS division, e.batch_lid, e.batch, e.event_type_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type, fe.faculty_lid, f.faculty_name FROM (SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot
                FROM [${slug}].event_bookings
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)
                GROUP BY room_lid, day_lid, event_lid, is_break, break_id) t2
                LEFT JOIN [${slug}].tb_events e ON e.id = t2.event_lid
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                LEFT JOIN [${slug}].faculty_events fe on fe.event_lid =  e.id
                LEFT JOIN [${slug}].faculties f on f.id = fe.faculty_lid
                WHERE (e.acad_session_lid = @sessionLid OR is_break = 1)
                ORDER BY t2.start_slot, t2.end_slot`
            } else if (program_lid && !acad_session_lid) {

                stmt = `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.break_id, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, RTRIM(LTRIM(e.division)) AS division, e.batch_lid, e.batch, e.event_type_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type, fe.faculty_lid, f.faculty_name FROM (SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot
                FROM [${slug}].event_bookings
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)
                GROUP BY room_lid, day_lid, event_lid, is_break, break_id) t2
                LEFT JOIN [${slug}].tb_events e ON e.id = t2.event_lid
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                LEFT JOIN [${slug}].faculty_events fe on fe.event_lid =  e.id
                LEFT JOIN [${slug}].faculties f on f.id = fe.faculty_lid
                WHERE (e.program_lid = @programLid OR is_break = 1)
                ORDER BY t2.start_slot, t2.end_slot`
            } else {
                           
                stmt = `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.break_id, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, RTRIM(LTRIM(e.division)) AS division, e.batch_lid, e.batch, e.event_type_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type, fe.faculty_lid, f.faculty_name FROM (SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot
                FROM [${slug}].event_bookings
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)
                GROUP BY room_lid, day_lid, event_lid, is_break, break_id) t2
                LEFT JOIN [${slug}].tb_events e ON e.id = t2.event_lid
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                LEFT JOIN [${slug}].faculty_events fe on fe.event_lid =  e.id
                LEFT JOIN [${slug}].faculties f on f.id = fe.faculty_lid
                ORDER BY t2.start_slot, t2.end_slot`

            }

            return pool.request()
                .input('dayLid', sql.Int, day_lid)
                .input('programLid', sql.Int, program_lid)
                .input('sessionLid', sql.Int, acad_session_lid)
                .query(stmt);

        })
    }


    static getPendingEvents(slug) {

        return poolConnection.then(pool => {
            let stmt;

                stmt = `SELECT e.id, e.program_lid, p.program_id, p.program_name, e.acad_session_lid, ads.acad_session, e.course_lid, icw.module_code, icw.module_name, e.division_lid, e.division, e.batch_lid, e.batch, e.event_type_lid, et.name AS event_type, eb.day_lid, eb.room_lid
                FROM [${slug}].tb_events e
                LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN event_types et ON et.id = e.event_type_lid
                WHERE eb.id IS NULL`
    

            return pool.request()
                .query(stmt);

        })
    }

    static getPendingEventPrograms(slug) {

        return poolConnection.then(pool => {
            let stmt;

            console.log('getPendingEventPrograms:::')

            stmt = `SELECT t1.program_lid, p.program_name, p.program_id FROM
            (SELECT DISTINCT(te.program_lid) FROM [${slug}].tb_events te 
            LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = te.id
            WHERE eb.id IS NULL) t1
            INNER JOIN [${slug}].programs p ON p.id = t1.program_lid`

            return pool.request()
                .query(stmt);

        })
    }


    static getPendingEventSessions(slug, programLid) {
        console.log('hitting pending session::::::', programLid)
        return poolConnection.then(pool => {
            let stmt;

            console.log('getPendingEventSessions:::')

            stmt = `SELECT t1.acad_session_lid, ads.acad_session FROM(SELECT DISTINCT(te.acad_session_lid) FROM [${slug}].tb_events te 
            LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = te.id
            WHERE eb.id IS NULL and te.program_lid = @programLid) t1
            INNER JOIN acad_sessions ads ON ads.id = t1.acad_session_lid`

            return pool.request()
                .input('programLid', sql.Int, programLid)
                .query(stmt);

        })
    }

    static getPendingEventModule(slug, programLid, sessionLid) {
        console.log('hitting pending session::::::', programLid)
        return poolConnection.then(pool => {
            let stmt;

            console.log('getPendingEventSessions:::')

            stmt = `SELECT t1.course_lid, icw.module_name FROM (SELECT DISTINCT(te.course_lid) FROM [${slug}].tb_events te 
            LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = te.id
            WHERE eb.id IS NULL and te.program_lid = @programLid and te.acad_session_lid = @sessionLid) t1
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = t1.course_lid`

            return pool.request()
                .input('programLid', sql.Int, programLid)
                .input('sessionLid', sql.Int, sessionLid)
                .query(stmt);

        })
    }

    static dropEvent(slug, userId, eventLid) {

        return poolConnection.then(pool => {
            return pool.request()
                .input('event_lid', sql.Int, eventLid)
                .input('last_modified_by', sql.Int, userId)
                .output('output_flag', sql.Int)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].sp_drop_events`);
        })
    }

    static scheduleEvent(slug, userId, inputJSON) {
  
        return poolConnection.then(pool => {
            return pool.request()
                .input('event_lid', sql.Int, inputJSON.allocate_events[0].eventLid)
                .input('faculty_lid', sql.Int, inputJSON.allocate_events[0].facultyLid)
                .input('day_lid', sql.Int, inputJSON.allocate_events[0].dayLid)
                .input('room_lid', sql.Int, inputJSON.allocate_events[0].roomLid)
                .input('slot_start_lid', sql.Int, inputJSON.allocate_events[0].startSlotLid)
                .input('slot_end_lid', sql.Int, inputJSON.allocate_events[0].endSlotLid)
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .output('output_flag', sql.Int)
                .execute(`[${slug}].sp_allocate_events`);
        })
    }

    static dragDropEvent(slug, userId, inputJSON) {
  
        return poolConnection.then(pool => {
            return pool.request()
                .input('event_lid', sql.Int, inputJSON.allocate_events[0].eventLid)
                .input('day_lid', sql.Int, inputJSON.allocate_events[0].dayLid)
                .input('room_lid', sql.Int, inputJSON.allocate_events[0].roomLid)
                .input('slot_start_lid', sql.Int, inputJSON.allocate_events[0].startSlotLid)
                .input('slot_end_lid', sql.Int, inputJSON.allocate_events[0].endSlotLid)
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .output('output_flag', sql.Int)
                .execute(`[${slug}].sp_drag_event`)
        })
    }


    static swapEvents(slug, userId, inputJSON) {
        console.log('swap JSON::::::::::', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {

            return pool.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].sp_swap_events`);

        })
    }

    static allocateFaculties(slug, body) {
        console.log('for faculty allocation', body);
        return poolConnection.then(pool => {

            return pool.request()
                .input('last_modified_by', sql.Int, 1)
                .output('output_flag', sql.Int)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].sp_allocate_faculties`);

        })
    }

    static deallocateFaculties(slug, body) {
        console.log('for faculty allocation', body);
        return poolConnection.then(pool => {

            return pool.request()
                .query(`UPDATE [${slug}].faculty_work_events SET status = 0;UPDATE [${slug}].faculty_week_slots SET status = 0;TRUNCATE TABLE [${slug}].faculty_events`)



        })
    }


    static AllocatedEventExcel(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT  r.room_number, CONVERT(NVARCHAR, sit.start_time, 0) as start_time, CONVERT(NVARCHAR, _sit.end_time, 0) as end_time, rt.name as room_type, d.day_name, icw.module_name, icw.module_code, icw.module_id, RTRIM(LTRIM(e.division)) AS division, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, et.abbr as event_type_name, f.faculty_id, f.faculty_name, ft.name as faculty_type FROM (SELECT room_lid, day_lid, event_lid, is_break, break_id, MIN(slot_lid) AS start_slot, MAX(slot_lid) AS end_slot 
            FROM [asmsoc-mum].event_bookings
            WHERE  (active = 1 OR is_break = 1)
            GROUP BY room_lid, day_lid, event_lid, is_break, break_id) t2
            INNER JOIN [${slug}].tb_events e ON e.id = t2.event_lid
            INNER JOIN [${slug}].programs p ON p.id = e.program_lid
            INNER JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
            INNER JOIN [dbo].event_types et ON et.id = e.event_type_lid
            INNER JOIN [${slug}].faculty_events fe on fe.event_lid =  e.id
            INNER JOIN [${slug}].faculties f on f.id = fe.faculty_lid
            INNER JOIN [dbo].rooms r ON r.id = t2.room_lid
            INNER JOIN [dbo].room_types rt ON rt.id =  r.room_type_id
            INNER JOIN [${slug}].days d ON d.id =  t2.day_lid
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id =  t2.start_slot
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  t2.end_slot
            ORDER BY t2.start_slot, t2.end_slot`)
        })
    }

    static unAllocatedEventExcel(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT  r.room_number, rt.name AS room_type, d.day_name, p.program_id, p.program_name, p.program_code, e.acad_session_lid, ads.acad_session,  icw.module_name, icw.module_code, icw.module_id, mt.name as module_type, e.division_lid, e.division,  e.batch,  et.name AS event_type, eb.room_lid, f.faculty_name, f.faculty_id, ft.name as faculty_type
            FROM [asmsoc-mum].tb_events e
            LEFT JOIN [asmsoc-mum].event_bookings eb ON eb.event_lid = e.id
            LEFT JOIN [asmsoc-mum].programs p ON p.id = e.program_lid
            LEFT JOIN acad_sessions ads ON ads.id = e.acad_session_lid
            LEFT JOIN [asmsoc-mum].initial_course_workload icw ON icw.id = e.course_lid
            LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
            LEFT JOIN [asmsoc-mum].days d ON d.id = eb.day_lid
            LEFT JOIN [asmsoc-mum].faculty_events fe ON fe.event_lid =  e.id
            LEFT JOIN [asmsoc-mum].faculties f ON f.id =  fe.faculty_lid
            LEFT JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [dbo].module_types mt ON mt.id =  icw.module_type_lid
            LEFT JOIN rooms r ON r.id = eb.room_lid
            LEFT JOIN room_types rt ON rt.id = r.room_type_id
            WHERE eb.id IS NULL
          `)
        })
    }
}