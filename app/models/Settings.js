const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Settings {
    constructor(name) {
        this.name;
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('roomName', sql.NVarChar(100), body.roomName)
                .input('schemaName', sql.NVarChar(200), `[${res.locals.slug}]`)
                .input('name', sql.NVarChar(200), body.name)
                .query(`INSERT INTO @schemaName.setting (name) VALUES (@name)`)
        }).catch(error => {
            throw error
        })
    }

    static getCount(slugName) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.query(`SELECT COUNT(*) AS count FROM [dbo].settings WHERE active = 1`)
        }).catch(error => {
            throw error
        })
    }
}