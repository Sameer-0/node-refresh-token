const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class OrganizationSlug {

    constructor () {
        
    }

    static fetchAll () {
        return poolConnection.then(conn => {
            return conn.request().query(`SELECT s.slug_name, o.org_abbr, o.org_name FROM slug_table s INNER JOIN organization_master o ON o.id = s.org_id`)
        })
    }
}