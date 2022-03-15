const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    static fetchForCourseWorkload(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Slug', sql.NVarChar(200), slug)
                .query(`select t.id, camp.campus_id, camp.campus_id_str, org.org_id, org.org_id_str  from [dbo].tenants t 
                INNER JOIN [dbo].campuses camp ON t.campus_lid = camp.id   
                INNER JOIN [dbo].organizations org ON t.org_lid =  org.id
                where t.slug_name = @Slug`)
        })
    }
}