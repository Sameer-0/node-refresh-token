const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class ProgramTypes{
constructor(id, name, active){
    this.id = id;
    this.name = name;
    this.active = active;
}

static fetchAll() {
    return poolConnection.then(pool => {
        return pool.request().query(`SELECT id, name FROM [dbo].program_types WHERE active = 1`)
    })
}

static save(body) {
    return poolConnection.then(pool => {
        return pool.request().input('programName', sql.NVarChar(50), body.programName)
            .query(`INSERT INTO [dbo].program_types (name) VALUES (@programName)`)
    })
}

static getProgramTypeById(id){
    return poolConnection.then (pool => {
         return  pool.request().input('programId', sql.Int, id)
     .query(`SELECT id, name from [dbo].program_types WHERE id = @programId`)
  })
} 

static update(body) {
    return poolConnection.then(pool => {
        return pool.request().input('programId', sql.Int, body.id)
        .input('programName', sql.NVarChar(100), body.programName)
        .query(`UPDATE [dbo].program_types SET name = @programName WHERE id = @programId`)
    })
}

static delete(id) {
    return poolConnection.then(pool => {
        return pool.request().input('id', sql.Int, id)
            .query(`UPDATE [dbo].program_types SET active = 0  WHERE id = @id`)
    })
}

static searchProgramType(rowcount, keyword) {
    return poolConnection.then(pool => {
        return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
            .query(` SELECT TOP ${Number(rowcount)}  pt.id as id, pt.name FROM 
                        [dbo].program_types pt WHERE pt.active = 1 AND pt.name LIKE @keyword ORDER BY pt.id DESC`)
    })
}

}