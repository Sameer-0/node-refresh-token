const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    static fetchAll(rowcont, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} fw.id, fw.faculty_lid, fw.program_session_lid, fw.module_lid, fw.lecture_per_week, fw.practical_per_week, fw.tutorial_per_week, fw.workshop_per_week, fw.is_batch_preference_set,icw.module_name,f.faculty_id, f.faculty_name, ps.program_lid,acs.acad_session, fw.active
            FROM [${slug}].faculty_works fw 
            INNER JOIN [${slug}].[initial_course_workload] icw ON icw.module_id = fw.module_lid
            INNER JOIN [${slug}].faculties f ON f.id = fw.faculty_lid
            INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid 
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.acad_session_lid
            WHERE fw.active = 1 AND icw.active = 1 AND f.active = 1 AND acs.active = 1 AND ps.active = 1`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_works WHERE active = 1`)
        })
    }
}