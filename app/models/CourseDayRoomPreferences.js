const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class CourseDayRoomPreferences {
    static fetchAll(rowcont, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} cdrp.id, p.program_name, p.abbr as program_abbr, icw.module_name, icw.module_code, div.division, div.division_num, dbatch.batch, dbatch.batch_count, d.day_name, acads.acad_session, r.capacity, r.room_number, r.floor_number, r.id as room_id FROM [${slug}].course_day_room_preferences cdrp
            INNER JOIN [${slug}].programs p ON cdrp.program_lid = p.id
            INNER JOIN [${slug}].initial_course_workload icw ON cdrp.course_lid = icw.id
            INNER JOIN [${slug}].divisions div ON cdrp.division_lid = div.id
            INNER JOIN [${slug}].division_batches dbatch ON cdrp.batch_lid = dbatch.id
            INNER JOIN [${slug}].days d ON cdrp.day_lid =  d.id
            INNER JOIN [dbo].acad_sessions acads ON cdrp.acad_session_lid = acads.id
            INNER JOIN [dbo].rooms r ON cdrp.room_lid = r.id
            ORDER BY cdrp.id DESC`)
        })
    }

    static getCount(slug){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].course_day_room_preferences`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT cdrp.id, p.program_name, p.abbr as program_abbr, icw.module_name, icw.module_code, div.division, div.division_num, dbatch.batch, dbatch.batch_count, d.day_name, acads.acad_session, r.capacity, r.room_number, r.floor_number, r.id as room_id FROM [${slug}].course_day_room_preferences cdrp
                INNER JOIN [${slug}].programs p ON cdrp.program_lid = p.id
                INNER JOIN [${slug}].initial_course_workload icw ON cdrp.course_lid = icw.id
                INNER JOIN [${slug}].divisions div ON cdrp.division_lid = div.id
                INNER JOIN [${slug}].division_batches dbatch ON cdrp.batch_lid = dbatch.id
                INNER JOIN [${slug}].days d ON cdrp.day_lid =  d.id
                INNER JOIN [dbo].acad_sessions acads ON cdrp.acad_session_lid = acads.id
                INNER JOIN [dbo].rooms r ON cdrp.room_lid = r.id
                ORDER BY cdrp.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcont)} cdrp.id, p.program_name, p.abbr as program_abbr, icw.module_name, icw.module_code, div.division, div.division_num, dbatch.batch, dbatch.batch_count, d.day_name, acads.acad_session, r.capacity, r.room_number, r.floor_number, r.id as room_id FROM [${slug}].course_day_room_preferences cdrp
                INNER JOIN [${slug}].programs p ON cdrp.program_lid = p.id
                INNER JOIN [${slug}].initial_course_workload icw ON cdrp.course_lid = icw.id
                INNER JOIN [${slug}].divisions div ON cdrp.division_lid = div.id
                INNER JOIN [${slug}].division_batches dbatch ON cdrp.batch_lid = dbatch.id
                INNER JOIN [${slug}].days d ON cdrp.day_lid =  d.id
                INNER JOIN [dbo].acad_sessions acads ON cdrp.acad_session_lid = acads.id
                INNER JOIN [dbo].rooms r ON cdrp.room_lid = r.id
                WHERE p.program_name LIKE @keyword OR p.abbr LIKE @keyword OR icw.module_name LIKE @keyword OR icw.module_code LIKE @keyword OR div.division LIKE @keyword OR div.division_num LIKE @keyword OR dbatch.batch LIKE @keyword OR dbatch.batch_count LIKE @keyword OR  acads.acad_session LIKE @keyword OR r.capacity LIKE @keyword OR r.room_number LIKE @keyword OR r.floor_number LIKE @keyword OR r.id LIKE @keyword
                ORDER BY cdrp.id DESC`)
        })
    }


    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_date_times]`)
        })
    }
}