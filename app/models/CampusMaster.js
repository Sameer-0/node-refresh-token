const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class CampusMaster {
    constructor(campusId, campusAbbr, campusName40Char, campusDesc) {
        this.campusId = campusId;
        this.campusAbbr = campusAbbr;
        this.campusName40Char = campusName40Char;
        this.campusDesc = campusDesc;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            let request = pool.request()
          return  request.query(`SELECT TOP 10 id, campus_id, campus_abbr , campus_name_40_char as name, campus_description AS c_desc FROM [dbo].campus_master WHERE active = 1 ORDER BY id DESC`)
        })
    }

    static fetchChunkRows(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, campus_id, campus_abbr AS abbr, campus_name_40_char AS name, campus_description AS c_desc
            FROM [dbo].campus_master WHERE active = 1 ORDER BY id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }



    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].campus_master WHERE active = 1`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('campusId', sql.Int, body.campusId)
            request.input('campusAbbr', sql.NVarChar(40), body.campusAbbr)
            request.input('campusName40Char', sql.NVarChar(40), body.campusName)
            request.input('campusDesc', sql.NVarChar(150), body.campusDesc)
            return request.query(`INSERT INTO [dbo].campus_master (campus_id, campus_abbr, campus_name_40_char, campus_description) VALUES (@campusId, @campusAbbr, @campusName40Char, @campusDesc)`);
        })
    }

    static getCampusById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT id, campus_id, campus_abbr, campus_name_40_char, campus_description FROM [dbo].campus_master  WHERE id = @id`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, body.Id)
            request.input('campusId', sql.Int, body.campusId)
            request.input('campusAbbr', sql.NVarChar(40), body.campusAbbr)
            request.input('campusName40Char', sql.NVarChar(40), body.campusName)
            request.input('campusDesc', sql.NVarChar(150), body.campusDesc)
            return request.query(`UPDATE [dbo].campus_master SET campus_id = @campusId, campus_abbr = @campusAbbr, campus_name_40_char = @campusName40Char, campus_description = @campusDesc WHERE id = @id`);
        })
    }


    static deleteById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`UPDATE [dbo].campus_master SET active = 0 WHERE id = @id`);
        })
    }

    static searchCampus(keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP 10 id, campus_id, campus_abbr AS abbr, campus_name_40_char AS name, campus_description AS c_desc 
            FROM [dbo].campus_master WHERE campus_id LIKE @keyword OR campus_abbr LIKE @keyword OR campus_name_40_char LIKE @keyword OR campus_description LIKE @keyword AND active = 1`)
        })
    }
}