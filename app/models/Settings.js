const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Settings {
    constructor(name, type) {
        this.name;
        this.type = type;
    }

    static save(slug, body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('roomName', sql.NVarChar(100), body.roomName)
                .input('name', sql.NVarChar(200), body.name)
                .query(`INSERT INTO  [${slug}].settings (name) VALUES (@name)`)
        }).catch(error => {
            throw error
        })
    }

    static fetchStepForm(slugName) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.query(`SELECT TOP 1 id, name, type, CAST(is_submitted as Varchar(10)) as is_submitted, active  FROM [${slugName}].settings WHERE is_submitted = 0 AND active = 1 AND type = 'STEPFORM' ORDER BY id ASC`)
        }).catch(error => {
            throw error
        })
    }


    static updateByName(slug,settingName) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Name', sql.NVarChar(100), settingName)
                .query(`UPDATE  [${slug}].settings set is_submitted = 1 WHERE name = @Name`)
        }).catch(error => {
            throw error
        })
    }
}