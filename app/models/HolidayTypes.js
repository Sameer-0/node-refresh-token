const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class HolidayTypes {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    static insert(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Name', sql.NVarChar(255), body.name)
                .input('Description', sql.NVarChar(50), body.description)
            let stmt = `INSERT INTO  [dbo].[holiday_types] (name, description)  VALUES (@Name, @Description)`
            return request.query(stmt)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.NVarChar(255), body.Id)
                .input('Name', sql.NVarChar(255), body.name)
                .input('Description', sql.NVarChar(50), body.description)
            let stmt = `UPDATE [dbo].[holiday_types] SET name = @Name, description =  @Description WHERE id =  @Id`
            return request.query(stmt)
        })
    }

    static delete(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.NVarChar(255), id)
            let stmt = `UPDATE [dbo].[holiday_types] SET active  = 0 WHERE id =  @Id`
            return request.query(stmt)
        })
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, name, description FROM [dbo].[holiday_types] WHERE active  = 1 ORDER BY id DESC`)
        })
    }

    static fetchById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('Id', sql.NVarChar(255), id)
                .request().query(`SELECT id, name, description FROM [dbo].[holiday_types] WHERE id = @Id`)
        })
    }

}