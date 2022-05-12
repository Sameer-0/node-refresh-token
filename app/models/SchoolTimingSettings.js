const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class SchoolTimingSettings {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, name, description, status FROM [${slug}].school_timing_settings WHERE active = 1`)
        })
    }

    static save(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Name', sql.NVarChar(100), body.name)
                .input('Description', sql.NVarChar(50), body.description)
                .query(`INSERT INTO [${slug}].school_timing_types (name, description) VALUES (@Name, @Description)`)
        })
    }

}