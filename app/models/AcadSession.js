const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class AcadSession {

    constructor(acadSession) {
        this.acadSession = acadSession;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} as.id as acadSessionId, as.acad_session FROM [dbo].acad_sessions ac WHERE as.active = 1`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('acadSession', sql.NVarChar(100), body.acadSession)
                .query(`INSERT INTO [dbo].acad_sessions (acad_session) VALUES (@acadSession)`)
        }).catch(error => {
            throw error
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('acadSessionId', sql.Int, body.acadSessionId)
                .input('acadSession', sql.NVarChar(100), body.acadSession)
                .query(`UPDATE [dbo].acad_sessions SET acad_session = @acadSession WHERE id = @acadSessionId`)
        }).catch(error => {
            throw error
        })
    }

    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('acadSessionId', sql.Int, id)
                .query(`UPDATE [dbo].acad_sessions SET active = 0 WHERE id = @acadSessionId`)
        }).catch(error => {
            throw error
        })
    }
}