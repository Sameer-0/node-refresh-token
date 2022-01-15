const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTypes {
    constructor(name, description) {
        this.name = namel
        this.description = description;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)}  rt.id as roomtypeid, rt.name, rt.description FROM [dbo].room_types rt WHERE rt.active = 1 ORDER BY rt.id DESC`)
        })
    }



    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('roomName', sql.NVarChar(100), body.roomName)
                .input('description', sql.NVarChar(200), body.description)
                .query(`INSERT INTO [dbo].room_types (name, description) VALUES (@roomName,  @description)`)
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

    static getRoomTypeById(id){
          return poolConnection.then(pool => {
              let request =  pool.request()
            return   request.input('roomTypeId', sql.Int, id)
           .query(`SELECT  rt.id as roomtypeid, rt.name, rt.description FROM [dbo].room_types rt WHERE rt.id  =  @roomTypeId`)
        })
    }

}