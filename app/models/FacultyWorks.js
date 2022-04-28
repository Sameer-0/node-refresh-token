const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {

    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_works]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, fw.practical_per_week, fw.tutorial_per_week, fw.workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid, acs.acad_session
            FROM [${slug}].faculty_works fw 
            INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid ORDER BY fw.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_works`)
        })
    }




    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, fw.practical_per_week, fw.tutorial_per_week, fw.workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid, acs.acad_session
                FROM [${slug}].faculty_works fw 
                INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid WHERE fw.id LIKE @keyword OR  fw.lecture_per_week LIKE @keyword OR fw.practical_per_week LIKE @keyword OR icw.module_name LIKE @keyword OR f.faculty_id LIKE @keyword OR f.faculty_name LIKE @keyword  ORDER BY fw.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, fw.practical_per_week, fw.tutorial_per_week, fw.workshop_per_week, CONVERT(NVARCHAR, fw.is_batch_preference_set) AS is_batch_preference_set, IIF(fw.is_batch_preference_set = 1 ,'Yes','No') as is_batch_preference_set_status, icw.module_name, f.faculty_id, f.faculty_name, ps.program_lid,acs.acad_session
                FROM [${slug}].faculty_works fw 
                INNER JOIN [${slug}].[initial_course_workload] icw ON icw.id = fw.module_lid
                INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid ORDER BY fw.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static update(inputJSON, slug, userid) {
        console.log('JSON:::::::::::::::::',JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_works]`)
        })
    }


    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_request_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_works]`)
        })
    }
}