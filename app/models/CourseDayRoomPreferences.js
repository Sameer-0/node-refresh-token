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
                .query(`SELECT TOP ${Number(rowcount)} cdrp.id, p.program_name, p.abbr as program_abbr, icw.module_name, icw.module_code, div.division, div.division_num, dbatch.batch, dbatch.batch_count, d.day_name, acads.acad_session, r.capacity, r.room_number, r.floor_number, r.id as room_id FROM [${slug}].course_day_room_preferences cdrp
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

    static getAcadSession(program_lid, slug){
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('program_lid', sql.Int, program_lid).query(
                `SELECT   p.id, p.program_name, ps.acad_session_lid, acs.acad_session FROM [asmsoc-mum].program_sessions ps 
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid
                WHERE p.id = @program_lid;
                `
            )
        })
    }

    static getDayName(program_lid, slug){
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('program_lid', sql.Int, program_lid).query(
                `SELECT d.id as day_lid, pd.program_lid, d.day_name FROM [${slug}].program_days pd 
                INNER JOIN [${slug}].days d ON d.id = pd.day_lid 
                WHERE pd.is_lecture = 1 AND pd.program_lid = @program_lid;
                `
            )
        })
    }

    static getCourseList(body, slug){
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('program_lid', sql.Int, body.program_lid).
            input('acad_session_lid', sql.Int, body.acad_session_lid)
            .query(
                `SELECT icw.id, icw.module_name, icw.program_id, p.id as program_lid FROM [asmsoc-mum].initial_course_workload icw
                INNER JOIN [${slug}].programs p ON p.program_id = icw.program_id
                WHERE p.id = @program_lid AND acad_session_lid = @acad_session_lid;
                `
            )
        })
    }

    static getDivList(body, slug){
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('course_lid', sql.Int, body.course_lid)
            .query(
                `SELECT  db.id as batch_lid, db.division_lid, d.division FROM [${slug}].division_batches db
                INNER JOIN [${slug}].divisions d ON d.id = db.division_lid 
                WHERE d.course_lid = @course_lid;
                `
            )
        })
    }

    static refresh(slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_refresh_course_day_room_preferences]`)
        })
    }


    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_faculties]`)
        })
    }
}