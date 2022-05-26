const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class TimeTable {

    static fetch(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select program_lid, acad_session_lid, course_lid, division, batch, day_lid, room_lid, school_timing_lid from [asmsoc-mum].event_bookings where day_lid = 1 AND program_lid = 1 AND acad_session_lid = 16`)
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

    static getAllocationListByDayId(slug, day_lid) {

        return poolConnection.then(pool => {

            let stmt;

            if (day_lid) {
                stmt = `SELECT program_lid, acad_session_lid, course_lid, division, batch, day_lid, room_lid, school_timing_lid from [${slug}].event_bookings WHERE day_lid = @dayLid AND program_lid = 1 AND acad_session_lid = 16`
            } else {
                stmt = `SELECT eb.program_lid, eb.acad_session_lid, eb.course_lid, eb.division, eb.batch, eb.day_lid, eb.room_lid, eb.school_timing_lid FROM [${slug}].event_bookings eb
                INNER JOIN [${slug}].days d ON eb.day_lid = d.id
                WHERE d.day_of_week = 1 AND program_lid = 1 AND acad_session_lid = 16`
            }

            return pool.request()
                .input('dayLid', sql.Int, day_lid).
            query(stmt);
            
        })
    }


}