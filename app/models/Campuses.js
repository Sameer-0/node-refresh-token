const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class Campuses {
    constructor(campusId, campusAbbr, campusName40Char, campusDesc) {
        this.campusId = campusId;
        this.campusAbbr = campusAbbr;
        this.campusName40Char = campusName40Char;
        this.campusDesc = campusDesc;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT TOP ${Number(rowcount)} id, campus_id, campus_abbr ,campus_abbr AS abbr, campus_name_40_char as name, campus_description AS c_desc FROM [dbo].campuses WHERE active = 1 ORDER BY id DESC`)
        })
    }

    static fetchChunkRows(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, campus_id, campus_abbr AS abbr, campus_name_40_char AS name, campus_description AS c_desc
            FROM [dbo].campuses WHERE active = 1 ORDER BY id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }



    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].campuses WHERE active = 1`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('campusId', sql.Int, body.campusId)
            request.input('campusAbbr', sql.NVarChar(40), body.campusAbbr)
            request.input('campusName40Char', sql.NVarChar(40), body.campusName)
            request.input('campusDesc', sql.NVarChar(150), body.campusDesc)
            return request.query(`INSERT INTO [dbo].campuses (campus_id, campus_abbr, campus_name_40_char, campus_description) VALUES (@campusId, @campusAbbr, @campusName40Char, @campusDesc)`);
        }).catch(error => {
            throw error
        })
    }


    static saveWithProc(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].sp_add_new_campuses`);
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT id, campus_id, campus_abbr, campus_name_40_char, campus_description, CONVERT(NVARCHAR, active) AS active FROM [dbo].campuses  WHERE id = @id`)
        }).catch(error => {
            throw error
        })
    }


    static update(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].update_campuses`);
        })
    }


    static delete(inputJSON) {
        console.log('inputJSON:::::::::::::>>>', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].delete_campuses')
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].campuses SET active = 0 WHERE active = 1`)
        })
    }

    static searchCampus(rowcont, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcont)} id, campus_id, campus_abbr AS abbr, campus_name_40_char AS name, campus_description AS c_desc 
            FROM [dbo].campuses WHERE active = 1 AND (campus_id LIKE @keyword OR campus_abbr LIKE @keyword OR campus_name_40_char LIKE @keyword OR campus_description LIKE @keyword ) ORDER BY id DESC`)
        }).catch(error => {
            throw error
        })
    }
}