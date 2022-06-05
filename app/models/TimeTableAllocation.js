const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTiming {
    
    static generateTimeTable(programLid, sessionlLid, slug) {
      
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('program_lid', sql.Int, programLid)
            .input('acad_session_lid', sql.Int, sessionlLid)
            .input('last_modified_by', sql.Int, 1)
            .output('output_flag', sql.Bit, 0)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_generate_weekly_timetable]`)
        })
    }

    static deAllocateTimeTable(programLid, sessionlLid, slug) {
      
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('program_lid', sql.Int, programLid)
            .input('acad_session_lid', sql.Int, sessionlLid)
            .input('last_modified_by', sql.Int, 1)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_deallocate_timetable]`)
        })
    }

}