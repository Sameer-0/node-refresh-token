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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, 
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, 
            CONVERT(NVARCHAR, ac.date, 103) AS start_date,
            CONVERT(NVARCHAR, _ac.date, 103) AS end_date, fdt.start_time_id, fdt.end_time_id, 
            fdt.start_date_id, fdt.end_date_id, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [${slug}].faculty_date_times fdt ON  f.id = fdt.faculty_lid
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fdt.start_time_id -- starttime
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id = fdt.end_time_id -- endttime
            INNER JOIN [dbo].[academic_calendar] ac ON ac.id =  fdt.start_date_id  -- startdate
            INNER JOIN [dbo].academic_calendar _ac ON _ac.id = fdt.end_date_id -- endtdate
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            ORDER BY id DESC`)
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
                .query(`SELECT f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, 
                CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
                CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, 
                CONVERT(NVARCHAR, ac.date, 103) AS start_date,
                CONVERT(NVARCHAR, _ac.date, 103) AS end_date, fdt.start_time_id, fdt.end_time_id, 
                fdt.start_date_id, fdt.end_date_id, ft.name AS faculty_type, f.faculty_type_lid
                FROM [${slug}].faculties f 
                INNER JOIN [${slug}].faculty_date_times fdt ON  f.id = fdt.faculty_lid
                INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fdt.start_time_id -- starttime
                INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id = fdt.end_time_id -- endttime
                INNER JOIN [dbo].[academic_calendar] ac ON ac.id =  fdt.start_date_id  -- startdate
                INNER JOIN [dbo].academic_calendar _ac ON _ac.id = fdt.end_date_id -- endtdate
                INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
                ORDER BY id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, CONVERT(NVARCHAR, ac.date, 103) AS start_date,
                CONVERT(NVARCHAR, _ac.date, 103) AS end_date
                FROM [${slug}].faculties f 
                INNER JOIN [${slug}].faculty_date_times fdt ON  f.id = fdt.faculty_lid
                INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fdt.start_time_id -- starttime
                INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id = fdt.end_time_id -- endttime
                INNER JOIN [dbo].[academic_calendar] ac ON ac.id =  fdt.start_date_id  -- startdate
                INNER JOIN [dbo].academic_calendar _ac ON _ac.id = fdt.end_date_id -- endtdate
                WHERE f.faculty_id LIKE @keyword OR f.faculty_name LIKE @keyword OR sit.start_time LIKE @keyword OR _sit.end_time LIKE @keyword OR ac.date LIKE @keyword OR _ac.date LIKE @keyword
                ORDER BY id DESC`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            request.input('Id', sql.Int, id)
            return request.query(`SELECT f.id, f.faculty_id, f.faculty_name, f.faculty_dbo_lid, 
            CONVERT(NVARCHAR, sit.start_time, 0) AS start_time, 
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time, 
            CONVERT(NVARCHAR, ac.date, 103) AS start_date,
            CONVERT(NVARCHAR, _ac.date, 103) AS end_date, fdt.start_time_id, fdt.end_time_id, 
            fdt.start_date_id, fdt.end_date_id, ft.name AS faculty_type, f.faculty_type_lid
            FROM [${slug}].faculties f 
            INNER JOIN [${slug}].faculty_date_times fdt ON  f.id = fdt.faculty_lid
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fdt.start_time_id -- starttime
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id = fdt.end_time_id -- endttime
            INNER JOIN [dbo].[academic_calendar] ac ON ac.id =  fdt.start_date_id  -- startdate
            INNER JOIN [dbo].academic_calendar _ac ON _ac.id = fdt.end_date_id -- endtdate
            INNER JOIN [dbo].faculty_types ft ON ft.id = f.faculty_type_lid
            WHERE f.id = @Id`)
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

}