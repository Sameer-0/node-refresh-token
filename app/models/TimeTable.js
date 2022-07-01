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

    // static getAllEvents(slug, day_lid){

    //     return poolConnection.then(pool => {
    //         let stmt;

    //         stmt= `SELECT eb.id, eb.program_lid, eb.acad_session_lid, eb.course_lid, eb.division, eb.batch, eb.day_lid, eb.room_lid, st.slot_start_lid, st.slot_end_lid, icw.module_name, p.program_name, ads.acad_session, CAST(FORMAT(CAST(sit.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as start_time , CAST(FORMAT(CAST(sit2.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as end_time, fe.faculty_lid, f.faculty_name, f.faculty_id 
    //             FROM [${slug}].event_bookings eb 
    //             LEFT JOIN [${slug}].faculty_events fe ON fe.event_bookings_lid = eb.id
    //             LEFT JOIN [${slug}].faculties f ON f.id = fe.faculty_lid
    //             INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timing_lid 
    //             INNER JOIN [${slug}].initial_course_workload icw ON icw.id = eb.course_lid
    //             INNER JOIN [${slug}].programs p ON p.id = eb.program_lid
	// 			INNER JOIN [dbo].acad_sessions ads ON ads.id = eb.acad_session_lid
	// 			INNER JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
	// 			INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
    //             INNER JOIN [${slug}].days d 
    //             ON eb.day_lid = d.id WHERE d.id = @dayLid`

    //             return pool.request() 
    //             .input('dayLid', sql.Int, day_lid)
    //             .input('programLid', sql.Int, program_lid)
    //             .input('sessionLid', sql.Int, acad_session_lid)
    //             .query(stmt);
    //     })

    // }

    static getEventsByProgramSessionDay(slug, day_lid, program_lid, acad_session_lid) {

        return poolConnection.then(pool => {
            let stmt;

            //SORT BY SLOT IS NECESSARY FOR PROPER DOM.
            if(program_lid && acad_session_lid){
                stmt= `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, e.division, e.batch_lid, e.batch, e.faculty_lid, e.event_type_lid, eb.id as event_booking_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type FROM (SELECT * FROM (SELECT room_lid, day_lid, event_lid, is_break, MIN(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS start_slot, 
                MAX(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS end_slot, 
                ROW_NUMBER() OVER(PARTITION BY room_lid, event_lid ORDER BY room_lid, slot_lid) AS row_num
                FROM [${slug}].event_booking_slots 
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)) t1
                WHERE row_num = 1) t2
                LEFT JOIN [${slug}].events e ON e.id = t2.event_lid 
                LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                WHERE (e.program_lid = @programLid and e.acad_session_lid = @sessionLid) OR t2.is_break = 1
                ORDER BY t2.start_slot, t2.end_slot`
            }
            else if(!program_lid && acad_session_lid){
                stmt= `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, e.division, e.batch_lid, e.batch, e.faculty_lid, e.event_type_lid, eb.id as event_booking_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type FROM (SELECT * FROM (SELECT room_lid, day_lid, event_lid, is_break, MIN(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS start_slot, 
                MAX(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS end_slot, 
                ROW_NUMBER() OVER(PARTITION BY room_lid, event_lid ORDER BY room_lid, slot_lid) AS row_num
                FROM [${slug}].event_booking_slots 
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)) t1
                WHERE row_num = 1) t2
                LEFT JOIN [${slug}].events e ON e.id = t2.event_lid 
                LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                WHERE (e.acad_session_lid = @sessionLid) OR t2.is_break = 1
                ORDER BY t2.start_slot, t2.end_slot`
            }
            else if(program_lid && !acad_session_lid){
             
                stmt= `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, e.division, e.batch_lid, e.batch, e.faculty_lid, e.event_type_lid, eb.id as event_booking_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type FROM (SELECT * FROM (SELECT room_lid, day_lid, event_lid, is_break,MIN(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS start_slot, 
                MAX(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS end_slot, 
                ROW_NUMBER() OVER(PARTITION BY room_lid, event_lid ORDER BY room_lid, slot_lid) AS row_num
                FROM [${slug}].event_booking_slots 
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)) t1
                WHERE row_num = 1) t2
                LEFT JOIN [${slug}].events e ON e.id = t2.event_lid 
                LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                WHERE (e.program_lid = @programLid) OR t2.is_break = 1
                ORDER BY t2.start_slot, t2.end_slot`
            }
            else{
                stmt = `SELECT  t2.room_lid, t2.day_lid, t2.is_break, t2.event_lid, t2.start_slot, t2.end_slot, e.program_lid, e.acad_session_lid, e.course_lid, e.division_lid, e.division, e.batch_lid, e.batch, e.faculty_lid, e.event_type_lid, eb.id as event_booking_lid, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, ads.acad_session, icw.module_name, et.abbr as event_type FROM (SELECT * FROM (SELECT room_lid, day_lid, event_lid, is_break, MIN(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS start_slot, 
                MAX(slot_lid) OVER(PARTITION BY room_lid, day_lid, event_lid, is_break, break_id) AS end_slot, 
                ROW_NUMBER() OVER(PARTITION BY room_lid, event_lid ORDER BY room_lid, slot_lid) AS row_num
                FROM [${slug}].event_booking_slots 
                WHERE day_lid = @dayLid AND (active = 1 OR is_break = 1)) t1
                WHERE row_num = 1) t2
                LEFT JOIN [${slug}].events e ON e.id = t2.event_lid 
                LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
                LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
                LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
                LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
                LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
                ORDER BY t2.start_slot, t2.end_slot` 
                
            }
      
            return pool.request() 
                .input('dayLid', sql.Int, day_lid)
                .input('programLid', sql.Int, program_lid)
                .input('sessionLid', sql.Int, acad_session_lid)
                .query(stmt);
            
        })
    }


    static getPendingEvents(slug, program_lid, acad_session_lid) {

        return poolConnection.then(pool => {
            let stmt;

            if(program_lid && acad_session_lid){
                console.log('im in:::', program_lid + acad_session_lid)

                stmt= `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, d.id as division_lid, db.batch, db.id as batch_lid, et.name as event_name, et.abbr as event_type_abbr, et.id as event_type_lid FROM [${slug}].pending_events pe
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				INNER JOIN [dbo].event_types et on et.id = db.event_type_lid
                WHERE pe.program_lid = @programLid AND pe.acad_session_lid = @sessionLid`
            }
            else if(!program_lid && acad_session_lid){
             
                stmt= `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, d.id as division_lid, db.batch, db.id as batch_lid, et.name as event_name, et.abbr as event_type_abbr, et.id as event_type_lid FROM [${slug}].pending_events pe
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				INNER JOIN [dbo].event_types et on et.id = db.event_type_lid
                WHERE pe.acad_session_lid = @sessionLid`
            }
            else if(program_lid && !acad_session_lid){
             
                stmt= `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, d.id as division_lid, db.batch, db.id as batch_lid, et.name as event_name, et.abbr as event_type_abbr, et.id as event_type_lid FROM [${slug}].pending_events pe
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				INNER JOIN [dbo].event_types et on et.id = db.event_type_lid
                WHERE pe.program_lid = @programLid`
            }
            else{
               
                stmt = `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, d.id as division_lid, db.batch, db.id as batch_lid, et.name as event_name, et.abbr as event_type_abbr, et.id as event_type_lid FROM [${slug}].pending_events pe
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				INNER JOIN [dbo].event_types et on et.id = db.event_type_lid` 
            }
      
            return pool.request()
                .input('programLid', sql.Int, program_lid)
                .input('sessionLid', sql.Int, acad_session_lid)
                .query(stmt);
            
        })
    }

    static getPendingEventPrograms(slug) {

        return poolConnection.then(pool => {
            let stmt;

            console.log('getPendingEventPrograms:::')

                stmt= `SELECT DISTINCT program_lid, p.program_name, p.program_id FROM [${slug}].pending_events pe 
				INNER JOIN [${slug}].programs p on p.id = pe.program_lid`
            
            return pool.request()
                .query(stmt);
            
        })
    }


    static getPendingEventSessions(slug, programLid) {
console.log('hitting pending session::::::', programLid)
        return poolConnection.then(pool => {
            let stmt;

                console.log('getPendingEventSessions:::')

                stmt= `SELECT DISTINCT acad_session_lid, ads.acad_session FROM [${slug}].pending_events pe
				INNER JOIN acad_sessions ads on ads.id = pe.acad_session_lid
				WHERE program_lid = @programLid`
            
            return pool.request()
                .input('programLid', sql.Int, programLid)
                .query(stmt);
            
        })
    }

    static dropEvent(slug, userId, eventLid){

        return poolConnection.then(pool => {
 
            return pool.request() 
            .input('event_booking_lid', sql.Int, eventLid)
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].sp_drop_events`);

        })
    }

    static scheduleEvent(slug, userId, inputJSON){
        console.log('ALLOCATED EVENT:::::::::::::::>>',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            return pool.request() 
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].sp_allocate_events`);
        })
    }

    static swapEvents(slug, userId, inputJSON){
        console.log('swap JSON::::::::::',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {

            return pool.request() 
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].sp_swap_events`);

        })
    }

    static allocateFaculties(slug, body){
        console.log('for faculty allocation',body);
        return poolConnection.then(pool => {

            return pool.request() 
            .input('last_modified_by', sql.Int, 1)
            .output('output_flag', sql.Int)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].sp_allocate_faculties`);

        })
    }

    static deallocateFaculties(slug, body){
        console.log('for faculty allocation',body);
        return poolConnection.then(pool => {

            return pool.request() 
            .query(`UPDATE [${slug}].faculty_work_events SET status = 0;UPDATE [${slug}].faculty_week_slots SET status = 0;TRUNCATE TABLE [${slug}].faculty_events`)
            
            

        })
    }


    static AllocatedEventExcel(slug) {
        return poolConnection.then(pool => {
        let request = pool.request()
          return  request.query(`SELECT  r.room_number, rt.name as room_type, d.day_name,  icw.module_name, icw.module_code, icw.module_id, p.program_name, p.program_code, p.program_id,
          ads.acad_session, CONVERT(NVARCHAR, sit.start_time, 0) as start_time , CONVERT(NVARCHAR, sit2.end_time, 0) as end_time,  et.name as event_type_name,  f.faculty_name, f.faculty_id, ft.name as faculty_type, e.division 
           FROM [${slug}].event_bookings eb
          INNER JOIN [${slug}].events e ON eb.event_lid = e.id
          INNER JOIN [${slug}].faculties f ON f.id = e.faculty_lid
          INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timining_lid 
          INNER JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
          INNER JOIN [${slug}].programs p ON p.id = e.program_lid
          INNER JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
          INNER JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
          INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
          INNER JOIN [dbo].event_types et ON et.id = e.event_type_lid
          INNER JOIN [${slug}].days d ON eb.day_lid = d.id
          INNER JOIN [dbo].rooms r ON r.id = eb.room_lid
          INNER JOIN [dbo].faculty_types ft ON ft.id =  f.faculty_type_lid
          INNER JOIN [dbo].room_types rt ON rt.id =  r.room_type_id`)
        })
    }

    static unAllocatedEventExcel(slug) {
        return poolConnection.then(pool => {
        let request = pool.request()
          return  request.query(`SELECT eb.id, d.day_name, p.program_name, p.program_code, p.program_id, ads.acad_session, icw.module_name, icw.module_code, icw.module_id, mt.name as module_type, e.division, e.batch, et.name as event_type,   CONVERT(NVARCHAR, sit.start_time, 0) AS start_time , CONVERT(NVARCHAR, sit2.end_time, 0) AS end_time, r.room_number, rt.name as room_type,  f.faculty_name, f.faculty_id, ft.name as faculty_type
          FROM [${slug}].events e
          LEFT JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
          LEFT JOIN [${slug}].faculties f ON f.id = e.faculty_lid
          LEFT JOIN [${slug}].school_timings st ON st.id = eb.school_timining_lid
          LEFT JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
          LEFT JOIN [${slug}].programs p ON p.id = e.program_lid
          LEFT JOIN [dbo].acad_sessions ads ON ads.id = e.acad_session_lid
          LEFT JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
          LEFT JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
          LEFT JOIN [dbo].event_types et ON et.id = e.event_type_lid
          LEFT JOIN rooms r ON r.id = eb.room_lid
          LEFT JOIN room_types rt ON rt.id = r.room_type_id
          LEFT JOIN [${slug}].days d ON eb.day_lid = d.id
          INNER JOIN [dbo].faculty_types ft ON ft.id =  f.faculty_type_lid
          INNER JOIN [dbo].module_types mt ON mt.id =  icw.module_type_lid
          WHERE eb.event_lid IS NULL
          `)
        })
    }
}