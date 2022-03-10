const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    constructor(program_name, acad_session) {
        this.program_name = program_name;
        this.acad_session = acad_session;
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ps.id, ps.program_lid, ps.acad_session_lid, p.program_name,acs.acad_session, ps.active FROM 
            [${slug}].program_sessions ps INNER JOIN [${slug}].programs p ON p.id = ps.program_lid 
            INNER JOIN [dbo].acad_sessions acs ON ps.acad_session_lid = acs.id
            WHERE ps.active = 1 AND acs.active = 1 AND p.active = 1`)
        })
    }
}

