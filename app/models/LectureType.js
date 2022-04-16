const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db');


module.exports = class LectureType{
    static fetchAll(rowcount, slug){
        return poolConnection.then (pool => {
        return pool.request().query(`select * from [dbo].types order by id DESC`);        
        })
    }
}

