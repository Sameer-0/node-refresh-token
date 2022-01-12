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
            return pool.request().query(`SELECT id, name, description FROM [dbo].room_types WHERE active = 1`)
        })
    }



    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('name', sql.NVarChar(100), body.name)
                .input('description', sql.NVarChar(200), body.description)
                .query(`INSERT INTO [dbo].room_types (name, description) VALUES (@name,  @description)`)
        })
    }



    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, body.id)
                .input('name', sql.NVarChar(100), body.name)
                .input('description', sql.NVarChar(200), body.description)
                .query(`UPDATE [dbo].room_types SET name = @name, description = @description  WHERE id = @id`)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, body.id)
                .query(`UPDATE [dbo].room_types SET active = 0  WHERE id = @id`)
        })
    }

}