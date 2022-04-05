const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');

module.exports = class FacultyDbo {
    constructor(facultyId, facultyName, startTimeId, endTimeId, campusId, orgId) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.startTimeId = startTimeId;
        this.endTimeId = endTimeId;
        this.campusId = campusId;
        this.orgId = orgId;
    }

    static save(inputJSON) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_add_new_faculties]`)
        })
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fs.id, fs.faculty_id, fs.faculty_name,camp.campus_abbr, org.org_abbr, CONVERT(NVARCHAR, sit.start_time, 100) as start_time, CONVERT(NVARCHAR,sit.end_time,100) as end_time, fs.is_processed, IIF(fs.is_processed = 1, 'Yes','No') as is_processed_status FROM [dbo].faculties fs
            INNER JOIN [dbo].campuses camp ON camp.id = fs.campus_lid
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fs.start_time_id
            INNER JOIN [dbo].organizations org ON org.id =  fs.org_lid `)
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT b.id, b.building_name, b.building_number, b.total_floors, b.owner_id, b.handled_by, b.start_time_id, b.end_time_id, b.campus_lid, CONVERT(NVARCHAR, b.active) AS active FROM [dbo].buildings b WHERE  id =  @id`)
        })
    }


    static update(inputJSON) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_update_buildings]`)
        })
    }

    static delete(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[delete_buildings]')
        })
    }



    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].faculties`)
        })
    }

    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} fs.id, fs.faculty_id, fs.faculty_name, camp.campus_abbr, org.org_abbr, 
                CONVERT(NVARCHAR, sit.start_time, 100) as start_time, 
                CONVERT(NVARCHAR, sit.end_time,100) as end_time, fs.is_processed, 
                IIF(fs.is_processed = 1, 'Yes','No') as is_processed_status FROM [dbo].faculties fs
                INNER JOIN [dbo].campuses camp ON camp.id = fs.campus_lid
                INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fs.start_time_id
                INNER JOIN [dbo].organizations org ON org.id =  fs.org_lid 
                WHERE fs.faculty_id LIKE @keyword OR fs.faculty_name LIKE @keyword OR camp.campus_abbr LIKE @keyword OR org.org_abbr LIKE @keyword OR sit.start_time LIKE @keyword OR sit.end_time LIKE @keyword ORDER BY fs.id DESC`)
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].buildings SET active = 0 WHERE active = 1`)
        })
    }

    static processing(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.Int, body.id)
                .input('Status', sql.TinyInt, body.status)
            let stmt = `UPDATE [dbo].[faculties] SET is_processed = @Status WHERE id =  @Id`
            return request.query(stmt)
        })
    }


    static pegination(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  fs.id, fs.faculty_id, fs.faculty_name,camp.campus_abbr, org.org_abbr, CONVERT(NVARCHAR, sit.start_time, 100) as start_time, CONVERT(NVARCHAR,sit.end_time,100) as end_time, fs.is_processed, IIF(fs.is_processed = 1, 'Yes','No') as is_processed_status FROM [dbo].faculties fs
                INNER JOIN [dbo].campuses camp ON camp.id = fs.campus_lid
                INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fs.start_time_id
                INNER JOIN [dbo].organizations org ON org.id =  fs.org_lid ORDER BY fs.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }
}