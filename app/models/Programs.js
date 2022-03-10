const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    constructor(program_id, program_name, program_type_lid, abbr) {
        this.program_id = program_id;
        this.program_name = program_name;
        this.program_type_lid = program_type_lid;
        this.abbr = abbr
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} p.id, p.program_id, p.program_name, p.abbr, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id WHERE p.active = 1 AND pt.active = 1 ORDER BY id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].programs WHERE active = 1`)
        })
    }


    static pegination(rowcount, pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT TOP ${Number(rowcount)} p.id, p.program_id, p.program_name, p.abbr, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id WHERE p.active = 1 AND pt.active = 1 ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} p.id, p.program_id, p.program_name, p.abbr, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id WHERE p.active = 1 AND pt.active = 1 AND (p.program_name LIKE @keyword OR p.abbr LIKE @keyword OR pt.name LIKE @keyword) ORDER BY p.id DESC`)
        })
    }


}