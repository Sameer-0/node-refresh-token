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
            return request.input('roomTypeId', sql.Int, body.roomtypeid)
                .input('roomName', sql.NVarChar(100), body.roomName)
                .input('description', sql.NVarChar(200), body.description)
                .query(`UPDATE [dbo].room_types SET name = @roomName, description = @description  WHERE id = @roomTypeId`)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, id)
                .query(`UPDATE [dbo].room_types SET active = 0  WHERE id = @id`)
        })
    }

    static getRoomTypeById(id){
          return poolConnection.then(pool => {
              let request =  pool.request()
            return   request.input('roomTypeId', sql.Int, id)
           .query(`SELECT  rt.id as roomtypeid, rt.name as roomName, rt.description FROM [dbo].room_types rt WHERE rt.id  =  @roomTypeId`)
        })
    }

    static searchRoomType(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  rt.id as roomtypeid, rt.name, rt.description FROM 
                [dbo].room_types rt WHERE rt.active = 1 AND rt.name LIKE @keyword OR rt.description  LIKE @keyword  ORDER BY rt.id DESC`)
        })
    }

}