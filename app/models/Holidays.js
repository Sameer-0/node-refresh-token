//Holiday for schema level
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class {
    constructor(calenderYear, hDate, Reason, holidayTypeId) {
        this.calenderYear = calenderYear;
        this.hDate = hDate;
        this.Reason = Reason;
        this.holidayTypeId = holidayTypeId;
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.active = 1 and ht.active = 1`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            return pool.query(`SELECT COUNT(*) as count FROM [${slug}].holidays WHERE active = 1`)
        })
    }


    static save(inputJSON, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[add_holidays]`)
        })
    }

    static findOne(id, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT h.id, h.calendar_year, CONVERT(NVARCHAR, h.h_date, 120) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid, CONVERT(NVARCHAR, h.active) AS active FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.active = 1 and ht.active = 1 AND h.id = @Id`)
        })
    }


    static update(inputJSON, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_holidays]`)
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

    static pegination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.active = 1 and ht.active = 1 ORDER BY h.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
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