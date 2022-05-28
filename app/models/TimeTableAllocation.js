const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTiming {
    
    static generateTimeTable(programLid, sessionlLid, slug) {
      
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('programLid', sql.Int, programLid)
            .input('sessionlLid', sql.Int, sessionlLid)
            .input('last_modified_by', sql.Int, userid)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_insert_school_timings]`)
        })
    }

}