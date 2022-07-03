const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const slug = require('../controllers/management/slug');

module.exports = class Faculties {
    constructor(facultyId, facultyName, startTimeId, endTimeId, campusId, orgId) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
    }

    static save(inputJSON, slug, userid) {
        console.log(JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_faculties]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            ORDER BY f.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculties`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
                FROM [${slug}].faculties f 
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
                ORDER BY f.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + body.keyword + '%')
                .input('pageNo', sql.Int, body.pageNo)
                .query(`SELECT f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
                FROM [${slug}].faculties f 
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
                WHERE f.faculty_id LIKE @keyword OR f.faculty_name LIKE @keyword OR ft.name LIKE @keyword
                ORDER BY f.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            request.input('Id', sql.Int, id)
            return request.query(`SELECT f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            WHERE f.id = @Id`)
        })
    }

    static update(inputJSON, slug, userid) {
        console.log('Update faculty json', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculties]`)
        })
    }




    static delete(id, slug, userid) {
        console.log('id:::::::', id)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[delete_faculties]`)
        })
    }


    static isBatchPrefSet(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            INNER JOIN [${slug}].faculty_works fw ON fw.faculty_lid = f.id
            WHERE fw.is_batch_preference_set = 1
            ORDER BY f.id DESC`)
        })
    }


    static downloadExcel(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  f.faculty_id, f.faculty_name,  ft.name AS faculty_type
            FROM [${slug}].faculties f 
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            ORDER BY f.id DESC`)
        })
    }

    static allocationStatus(slug, facultyId) {
        return poolConnection.then(pool => {
            return pool.request().input('facultyId', sql.Int, facultyId).query(`SELECT p.program_name, p.program_code, icw.module_name, icw.module_code, ads.acad_session,sit.start_time, _sit.end_time, d.day_name FROM [asmsoc-mum].events e
INNER JOIN [${slug}].event_bookings eb ON eb.event_lid = e.id
INNER JOIN [${slug}].school_timings st ON st.id = eb.school_timining_lid
INNER JOIN [dbo].slot_interval_timings sit ON sit.id =  st.slot_start_lid
INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id = st.slot_end_lid
INNER JOIN [${slug}].days d ON d.id =  eb.day_lid
INNER JOIN [${slug}].programs p ON p.id =  e.program_lid
INNER JOIN [${slug}].initial_course_workload icw ON icw.id = e.course_lid
INNER JOIN [dbo].acad_sessions ads ON ads.id =  e.acad_session_lid
WHERE e.faculty_lid = @facultyId`)
        })
    }

}