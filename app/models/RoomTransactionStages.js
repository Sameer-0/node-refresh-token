const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTransactionStages {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)}  rts.id as rtsid, rts.name, rts.description FROM [dbo].room_transaction_stages rts WHERE rts.active = 1 ORDER BY rts.id DESC`)
        })
    }


    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('rtsName', sql.NVarChar(50), body.rtsName)
                .input('description', sql.NVarChar(100), body.description)
                .query(`INSERT INTO [dbo].room_transaction_stages (name, description) VALUES (@rtsName,  @description)`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('rtsId', sql.Int, body.rtsId)
                .input('rtsName', sql.NVarChar(100), body.rtsName)
                .input('description', sql.NVarChar(200), body.description)
                .query(`UPDATE [dbo].room_transaction_stages SET name = @rtsName, description = @description  WHERE id = @rtsId`)
        })
    }


    
    static delete(id) {
        console.log(id)
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('rtsId', sql.Int, id)
                .query(`UPDATE [dbo].room_transaction_stages SET active = 0  WHERE id = @rtsId`)
        })
    }


    static getRTSId(id){
        return poolConnection.then(pool => {
            let request =  pool.request()
          return   request.input('rtsId', sql.Int, id)
         .query(`SELECT  rts.id as rtsid, rts.name as rtsName, rts.description FROM [dbo].room_transaction_stages rts WHERE rts.id  =  @rtsId`)
      })
  }



  static getRTSCount(){
    return poolConnection.then(pool => {
        let request =  pool.request()
      return   request.input('rtsId', sql.Int, id)
     .query(`SELECT  COUNT(*) as count FROM [dbo].room_transaction_stages rts WHERE rts.active = 1`)
  })
}


}