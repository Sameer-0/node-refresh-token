const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class TimeTableGeneration{

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} p.id, p.program_id, RTRIM(LTRIM(p.program_name)) as program_name, p.abbr, IIF(p.program_code IS NULL, 'NA', p.program_code) AS program_code, pt.name as program_type, p.program_type_lid  FROM [${slug}].programs p INNER JOIN [dbo].program_types pt ON p.program_type_lid = pt.id ORDER BY id DESC`)
        })
    }

    static getAcadSession(slug, program_lid) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('programLid', sql.Int, program_lid).
            query(`SELECT ps.acad_session_lid, ads.acad_session FROM [${slug}].program_sessions ps INNER JOIN
            [dbo].acad_sessions ads ON ads.id = ps.acad_session_lid
            WHERE ps.program_lid = @programLid`)
        })
    }

}