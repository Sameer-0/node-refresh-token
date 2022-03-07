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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.active = 1 and ht.active = 1 ORDER BY h.id DESC`)
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

    static delete(inputJSON, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[delete_buildings]`)
        })
    }




    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].holidays WHERE active = 1`)
        })
    }


    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.active = 1 and ht.active = 1 AND (h.calendar_year LIKE @keyword OR h_date LIKE @keyword OR h.reason LIKE @keyword OR ht.name LIKE @keyword) ORDER by h.id DESC`)
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].buildings SET active = 0 WHERE active = 1`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT h.id, h.calendar_year, CONVERT(NVARCHAR,h.h_date,105) as h_date, h.reason, ht.name as holiday_type, h.holiday_type_lid FROM [${slug}].holidays h INNER JOIN [dbo].holiday_types ht ON  ht.id = h.holiday_type_lid AND h.active = 1 and ht.active = 1 ORDER BY h.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        }).catch(error => {
            throw error
        })
    }

}