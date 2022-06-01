const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class FacultyWorkTimePreferences {
    static save(inputJSON, slug, userid) {
        console.log('inputJSON:::::::', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_work_time_preferences]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id, 
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
            f.faculty_name, f.faculty_id, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code,p.abbr as program_abbr, d.day_name, icw.module_name
            FROM [${slug}].faculty_work_time_preferences fwtp
            INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
            INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
            INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
            INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid 
            INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
            INNER JOIN [${slug}].days d ON d.id = pd.day_lid
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            ORDER BY fwtp.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_work_time_preferences`)
        })
    }


    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id, 
                CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
                f.faculty_name, f.faculty_id, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code, p.abbr as program_abbr, d.day_name, icw.module_name
                FROM [${slug}].faculty_work_time_preferences fwtp
                INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
                INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
                INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid 
                INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
                INNER JOIN [${slug}].days d ON d.id = pd.day_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
                WHERE sit.start_time LIKE @keyword OR _sit.end_time LIKE @keyword OR RTRIM(p.program_name) LIKE @keyword OR p.program_id LIKE @keyword OR p.program_code LIKE @keyword OR d.day_name LIKE @keyword  OR f.faculty_name LIKE @keyword OR f.faculty_id LIKE @keyword OR CONVERT(NVARCHAR, sit.start_time, 0) LIKE @keyword OR CONVERT(NVARCHAR, _sit.end_time, 0) LIKE @keyword
                ORDER BY fwtp.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id, 
                CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time,
                f.faculty_name, f.faculty_id, RTRIM(LTRIM(p.program_name)) AS program_name, p.program_id, p.program_code,p.abbr as program_abbr, d.day_name, icw.module_name
                FROM [${slug}].faculty_work_time_preferences fwtp
                INNER JOIN [${slug}].faculty_works fw ON fwtp.faculty_work_lid = fw.id
                INNER JOIN [${slug}].program_days pd ON fwtp.p_day_lid =  pd.id
                INNER JOIN [dbo].slot_interval_timings sit ON fwtp.start_time_id = sit.id
                INNER JOIN [dbo].slot_interval_timings _sit ON fwtp.end_time_id = _sit.id
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid 
                INNER JOIN [${slug}].programs p ON p.id =  pd.program_lid
                INNER JOIN [${slug}].days d ON d.id = pd.day_lid
                INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
                ORDER BY fwtp.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_work_time_preferences]`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_work_time_pref_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_work_time_preference]`)
        })
    }


    static facultyPrefList(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT f.faculty_name, f.faculty_id, fw.faculty_lid,  f.faculty_dbo_lid FROM [${slug}].faculty_works fw
            INNER JOIN [${slug}].faculties f ON f.id =  fw.faculty_lid`)
        })
    }

    static programByFacultyId(facultyId, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('facultyId', sql.Int, facultyId).query(`select p.id, p.program_name from [${slug}].faculty_works fw
            INNER JOIN [${slug}].program_sessions ps ON ps.id =  fw.program_session_lid
            INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
            where fw.faculty_lid = @facultyId`)
        })
    }


    static moduleByprogramAndSessionId(body, slug) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('programId', sql.Int, body.programId)
            .input('sessionId', sql.Int, body.sessionId)
            .query(`SELECT DISTINCT fw.module_lid, icw.module_name FROM [${slug}].faculty_works fw
            INNER JOIN [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid
            WHERE ps.program_lid = @programId AND ps.acad_session_lid = @sessionId`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT fwtp.id, fwtp.faculty_work_lid, fwtp.p_day_lid, fwtp.start_time_id, fwtp.end_time_id,
                fw.faculty_lid, fw.module_lid, ps.program_lid, ps.acad_session_lid,
                f.faculty_dbo_lid
                from [${slug}].faculty_work_time_preferences fwtp
                INNER JOIN [${slug}].faculty_works  fw ON fw.id = fwtp.faculty_work_lid
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
                WHERE fwtp.id = @Id`)
        })
    }
}