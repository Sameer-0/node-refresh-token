const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {

    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), inputJSON)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_works`)
        })
    }
    
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




    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
                f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, sit.end_time, 0) AS end_time
                FROM [${slug}].faculty_date_times fdt 
                INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
                INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
                INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id
                WHERE fdt.id LIKE @keyword OR f.faculty_name LIKE @keyword OR  ac.date LIKE @keyword OR ac1.date LIKE @keyword           
                ORDER BY fdt.id DESC`)
        })
    }

    static pegination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT TOP ${Number(rowcount)} fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
                f.faculty_name, f.faculty_id, CONVERT(NVARCHAR, ac.date, 103) as start_date, CONVERT(NVARCHAR, ac1.date, 103) as end_date, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, sit.end_time, 0) AS end_time
                FROM [${slug}].faculty_date_times fdt 
                INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
                INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
                INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id           
                ORDER BY fdt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }
}