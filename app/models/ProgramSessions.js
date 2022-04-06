const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ps.id, p.program_name, p.program_code, adc.acad_session FROM [${slug}].program_sessions ps 
            INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
            INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
            ORDER BY ps.id DESC`)
        })
    }

    static pagination(rowcount, pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT ps.id, p.program_name, p.program_code, adc.acad_session FROM [${slug}].program_sessions ps 
                INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
                INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
                ORDER BY ps.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} ps.id, p.program_name, p.program_code, adc.acad_session FROM [${slug}].program_sessions ps 
                INNER JOIN [${slug}].programs p ON ps.program_lid = p.id
                INNER JOIN [dbo].acad_sessions adc ON adc.id = ps.acad_session_lid
                WHERE p.program_name LIKE @keyword OR adc.acad_session LIKE @keyword ORDER BY ps.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].program_sessions`)
        })
    }
}
