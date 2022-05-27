const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');

module.exports = class FacultyPool {

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT fp.faculty_id, fp.faculty_name, camp.campus_abbr, org.org_abbr, ft.name AS faculty_type, CONVERT(NVARCHAR, sit.start_time, 0) AS start_time,
            CONVERT(NVARCHAR, _sit.end_time, 0) AS end_time from [dbo].faculty_pools fp
            INNER JOIN [dbo].slot_interval_timings sit ON fp.start_time_id = sit.id -- start time
            INNER JOIN [dbo].slot_interval_timings _sit ON fp.end_time_id = _sit.id -- end time
            INNER JOIN [dbo].campuses camp ON fp.campus_lid =  camp.id
            INNER JOIN [dbo].organizations org ON fp.org_lid = org.id
            INNER JOIN [dbo].faculty_types  ft ON fp.faculty_type_lid = ft.id`)
        })
    }

    static refresh(userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_refresh_faculties]`)
        })
    }

}