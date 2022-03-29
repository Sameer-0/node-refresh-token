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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fs.id, fs.faculty_id, fs.faculty_name,camp.campus_abbr, org.org_abbr, CONVERT(NVARCHAR, sit.start_time, 100) as start_time, CONVERT(NVARCHAR,sit.end_time,100) as end_time, fs.is_processed FROM [dbo].faculties fs
            INNER JOIN [dbo].campuses camp ON camp.id = fs.campus_lid
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id = fs.start_time_id
            INNER JOIN [dbo].organizations org ON org.id =  fs.org_lid WHERE sit.active = 1  AND camp.active = 1 AND org.active = 1`)
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT b.id, b.building_name, b.building_number, b.total_floors, b.owner_id, b.handled_by, b.start_time_id, b.end_time_id, b.campus_lid, CONVERT(NVARCHAR, b.active) AS active FROM [dbo].buildings b WHERE  b.active = 1 AND id =  @id`)
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

    static fetchChunkRows(rowcount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT b.id AS building_id, b.building_name, b.building_number, b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr handled_by, CONVERT(NVARCHAR, st.start_time, 100) AS start_time, CONVERT(NVARCHAR, et.end_time, 100) AS end_time, c.campus_abbr FROM dbo.buildings b INNER JOIN dbo.organizations org_o ON org_o.id = b.owner_id INNER JOIN dbo.organizations org_h ON org_h.id = b.handled_by INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time_id INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time_id INNER JOIN dbo.campuses c ON c.id = b.campus_lid WHERE b.active = 1 AND st.active = 1 AND org_h.active = 1 ORDER BY b.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        }).catch(error => {
            throw error
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].buildings WHERE active = 1`)
        })
    }

    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} b.id AS building_id, b.building_name, b.building_number, 
                b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr AS handled_by, CONVERT(NVARCHAR, st.start_time, 100) AS start_time, 
                CONVERT(NVARCHAR, et.end_time, 100) AS end_time, c.campus_abbr FROM dbo.buildings b 
                INNER JOIN dbo.organizations org_o ON org_o.id = b.owner_id 
                INNER JOIN dbo.organizations org_h ON org_h.id = b.handled_by 
                INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time_id 
                INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time_id 
                INNER JOIN dbo.campuses c ON c.id = b.campus_lid WHERE b.active = 1 
                AND st.active = 1 AND org_h.active = 1 and b.building_name like @keyword or  b.building_number like @keyword 
                or b.total_floors like @keyword or org_o.org_abbr like @keyword or org_h.org_abbr like @keyword or  st.start_time like @keyword or
                et.end_time like @keyword or c.campus_abbr like @keyword
                ORDER BY b.id DESC`)
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].buildings SET active = 0 WHERE active = 1`)
        })
    }
}