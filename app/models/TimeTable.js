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

            if(program_lid && acad_session_lid){

                stmt= `SELECT eb.id, eb.program_lid, eb.acad_session_lid, eb.course_lid, eb.division, eb.batch, eb.day_lid, eb.room_lid, st.slot_start_lid, st.slot_end_lid, icw.module_name, p.program_name, ads.acad_session, CAST(FORMAT(CAST(sit.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as start_time , CAST(FORMAT(CAST(sit2.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as end_time, fe.faculty_lid, f.faculty_name, f.faculty_id 
                FROM [${slug}].event_bookings eb 
                LEFT JOIN [${slug}].faculty_events fe ON fe.event_bookings_lid = eb.id
                LEFT JOIN [${slug}].faculties f ON f.id = fe.faculty_lid
                INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timing_lid 
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = eb.course_lid
                INNER JOIN [${slug}].programs p ON p.id = eb.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = eb.acad_session_lid
				INNER JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
				INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
                INNER JOIN [${slug}].days d 
                ON eb.day_lid = d.id WHERE d.id = @dayLid AND eb.program_lid = @programLid AND eb.acad_session_lid = @sessionLid`
            }
            else if(!program_lid && acad_session_lid){
             
                stmt= `SELECT eb.id, eb.program_lid, eb.acad_session_lid, eb.course_lid, eb.division, eb.batch, eb.day_lid, eb.room_lid, st.slot_start_lid, st.slot_end_lid, icw.module_name, p.program_name, ads.acad_session, CAST(FORMAT(CAST(sit.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as start_time , CAST(FORMAT(CAST(sit2.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as end_time, fe.faculty_lid, f.faculty_name, f.faculty_id 
                FROM [${slug}].event_bookings eb 
                LEFT JOIN [${slug}].faculty_events fe ON fe.event_bookings_lid = eb.id
                LEFT JOIN [${slug}].faculties f ON f.id = fe.faculty_lid
                INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timing_lid 
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = eb.course_lid
                INNER JOIN [${slug}].programs p ON p.id = eb.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = eb.acad_session_lid
				INNER JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
				INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
                INNER JOIN [${slug}].days d  
                ON eb.day_lid = d.id WHERE d.id = @dayLid AND eb.acad_session_lid = @sessionLid`
            }
            else if(program_lid && !acad_session_lid){
             
                stmt= `SELECT eb.id, eb.program_lid, eb.acad_session_lid, eb.course_lid, eb.division, eb.batch, eb.day_lid, eb.room_lid, st.slot_start_lid, st.slot_end_lid, icw.module_name, p.program_name, ads.acad_session, CAST(FORMAT(CAST(sit.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as start_time , CAST(FORMAT(CAST(sit2.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as end_time, fe.faculty_lid, f.faculty_name, f.faculty_id 
                FROM [${slug}].event_bookings eb
                LEFT JOIN [${slug}].faculty_events fe ON fe.event_bookings_lid = eb.id
                LEFT JOIN [${slug}].faculties f ON f.id = fe.faculty_lid 
                INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timing_lid 
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = eb.course_lid
                INNER JOIN [${slug}].programs p ON p.id = eb.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = eb.acad_session_lid
				INNER JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
				INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
                INNER JOIN [${slug}].days d  
                ON eb.day_lid = d.id WHERE d.id = @dayLid AND eb.program_lid = @programLid`
            }
            else{
               
                stmt = `SELECT eb.id, eb.program_lid, eb.acad_session_lid, eb.course_lid, eb.division, eb.batch, eb.day_lid, eb.room_lid, st.slot_start_lid, st.slot_end_lid, icw.module_name, p.program_name, ads.acad_session, CAST(FORMAT(CAST(sit.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as start_time , CAST(FORMAT(CAST(sit2.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as end_time, fe.faculty_lid, f.faculty_name, f.faculty_id 
                FROM [${slug}].event_bookings eb
                LEFT JOIN [${slug}].faculty_events fe ON fe.event_bookings_lid = eb.id
                LEFT JOIN [${slug}].faculties f ON f.id = fe.faculty_lid
                INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timing_lid 
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = eb.course_lid
                INNER JOIN [${slug}].programs p ON p.id = eb.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = eb.acad_session_lid
				INNER JOIN [dbo].slot_interval_timings sit on sit.id = st.slot_start_lid
				INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = st.slot_end_lid
                INNER JOIN [${slug}].days d 
                ON eb.day_lid = d.id WHERE d.id = @dayLid` 
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

            // if(program_lid && acad_session_lid){
                console.log('im in:::', program_lid + acad_session_lid)

                stmt= `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, d.id as division_lid, db.batch, db.id as batch_lid, et.name as event_name FROM [${slug}].pending_events pe
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				INNER JOIN [dbo].event_types et on et.id = db.event_type_lid
                WHERE pe.program_lid = @programLid AND pe.acad_session_lid = @sessionLid`
            // }
            // else if(!program_lid && acad_session_lid){
             
                // stmt= `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, db.batch, et.name as event_name FROM [${slug}].pending_events pe
                // INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                // INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				// INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                // INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				// INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				// INNER JOIN [dbo].event_types et on et.id = pe.event_type_lid
                // WHERE pe.acad_session_lid = @sessionLid`
            // }
            // else if(program_lid && !acad_session_lid){
             
                // stmt= `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, db.batch, et.name as event_name FROM [${slug}].pending_events pe
                // INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                // INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				// INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                // INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				// INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				// INNER JOIN [dbo].event_types et on et.id = pe.event_type_lid
                // WHERE pe.program_lid = @programLid`
            // }
            // else{
               
                // stmt = `SELECT p.id as program_lid, p.program_id, p.program_name, ads.id as session_lid, ads.acad_session, icw.id as module_lid, icw.module_name, d.division, db.batch, et.name as event_name FROM [${slug}].pending_events pe
                // INNER JOIN [${slug}].initial_course_workload icw ON icw.id = pe.course_lid
                // INNER JOIN [${slug}].programs p ON p.id = pe.program_lid
				// INNER JOIN [dbo].acad_sessions ads ON ads.id = pe.acad_session_lid
                // INNER JOIN [${slug}].divisions d ON d.id = pe.division_lid
				// INNER JOIN [${slug}].division_batches db on db.id = pe.batch_lid
				// INNER JOIN [dbo].event_types et on et.id = pe.event_type_lid` 
            // }
      
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
}