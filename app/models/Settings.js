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

    static getCount(slugName) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.query(`SELECT id, name, type, CAST(is_submitted as Varchar(10)) as is_submitted  FROM [${slugName}].settings WHERE  active = 1 AND type = 'STEPFORM'`)
        }).catch(error => {
            throw error
        })
    }




    static fetchStepForm(slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.query(`SELECT id, name, type, CAST(active as Varchar(10)) as active   FROM [${slug}].settings WHERE active = 0 AND type = 'STEPFORM'`)
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