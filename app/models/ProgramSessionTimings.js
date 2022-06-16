const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class ProgramSessionTimings {
  

    static fetchAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT pst.id, p.program_name, ads.acad_session, CAST(FORMAT(CAST(sit.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) AS start_time, CAST(FORMAT(CAST(sit2.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) AS end_time FROM [asmsoc-mum].program_session_timings pst 
            INNER JOIN [${slug}].programs p ON p.id = pst.program_lid 
            INNER JOIN [dbo].acad_sessions ads on ads.id = pst.session_lid
            INNER JOIN [dbo].slot_interval_timings sit on sit.id = pst.start_time_lid
            INNER JOIN [dbo].slot_interval_timings sit2 on sit2.id = pst.end_time_lid`)
        })
    }

    static save(obj, slug, userId) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(obj))
            .input('last_modified_by', sql.NVarChar(sql.MAX), userId)
            .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].sp_insert_program_session_timings`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            return pool.request().input('programId', sql.Int, body.id)
                .input('programName', sql.NVarChar(100), body.programName)
                .query(`UPDATE [dbo].program_types SET name = @programName WHERE id = @programId`)
        })
    }


    static delete(ids) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`DELETE FROM [dbo].[program_types]  WHERE id = ${element.id}`)
            });
        })
    }


}