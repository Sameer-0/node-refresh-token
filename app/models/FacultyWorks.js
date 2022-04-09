const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, fw.practical_per_week, fw.tutorial_per_week, fw.workshop_per_week, fw.is_batch_preference_set,icw.module_name,f.faculty_id, f.faculty_name, ps.program_lid,acs.acad_session
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

    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), inputJSON)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_work_time_preferences]`)
        })
    }
}