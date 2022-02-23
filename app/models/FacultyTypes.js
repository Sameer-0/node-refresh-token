const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class FacultyTypes {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    static insert(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Name', sql.NVarChar(255), body.name)
                .input('Description', sql.NVarChar(50), body.description)
            let stmt = `INSERT INTO  [dbo].[faculty_types] (name, description)  VALUES (@Name, @Description)`
            return request.query(stmt)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.NVarChar(255), body.id)
                .input('Name', sql.NVarChar(255), body.name)
                .input('Description', sql.NVarChar(50), body.description)
            let stmt = `UPDATE [dbo].[faculty_types] SET name = @Name, description =  @Description WHERE id =  @Id`
            return request.query(stmt)
        })
    }
    static delete(ids) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`UPDATE [dbo].[faculty_types] SET active = 0  WHERE id = ${element.id}`)
            });
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].[faculty_types] SET active = 0 WHERE active = 1`)
        })
    }

    static fetchAll(rowcont) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} id, name, description FROM [dbo].[faculty_types] WHERE active  = 1 ORDER BY id DESC`)
        })
    }

    static fetchById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('Id', sql.NVarChar(255), id)
                .request().query(`SELECT id, name, description FROM [dbo].[faculty_types] WHERE id = @Id`)
        })
    }


    static findOne(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT id, name, description FROM  [dbo].[faculty_types]  WHERE id = @id`)
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  id , name, description FROM [dbo].[faculty_types]  WHERE active = 1 AND (name LIKE @keyword OR description LIKE @keyword) ORDER BY id DESC`)
        })
    }


}