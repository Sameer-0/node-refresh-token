const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')


module.exports = class RoomTypes {
    constructor(name, description) {
        this.name = namel
        this.description = description;
    }


    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`select id, name, description from [dbo].room_types where active = 1`)
        })
    }



    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Name', sql.NVarChar(100), body.name)
                .input('Description', sql.NVarChar(200), body.description)
                .query(`insert into [dbo].room_types(name, description) values(@Name,  @Description)`)
        })
    }



    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.Int, body.id)
                .input('Name', sql.NVarChar(100), body.name)
                .input('Description', sql.NVarChar(200), body.description)
                .query(`update [dbo].room_types set name = @Name, description = @Description  where id = @Id`)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.Int, body.id)
                .query(`update [dbo].room_types set active = 0  where id = @Id`)
        })
    }

}