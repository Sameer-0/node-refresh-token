const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, name, description FROM [dbo].session_types WHERE active = 1`)
        })
    }

    static save(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Name', sql.NVarChar(50), body.name)
                .input('Description', sql.NVarChar(50), body.description)
                .query(`INSERT INTO [dbo].session_types (name, description) VALUES (@Name, @Description)`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, name, description from [dbo].session_types WHERE id = @Id`)
        })
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, body.id)
                .input('Name', sql.NVarChar(50), body.name)
                .input('Description', sql.NVarChar(100), body.description)
                .query(`UPDATE [dbo].session_types SET name = @Name, description = @Description WHERE id = @Id`)
        })
    }


    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`UPDATE [dbo].session_types SET active = 0  WHERE id = ${element.id}`)
            });
        })
    }

    static deleteAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].session_types SET active = 0 WHERE active = 1`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)}  pt.id , pt.name, pt.description FROM 
                [dbo].session_types pt WHERE pt.active = 1 AND (pt.name LIKE @keyword OR pt.description LIKE @keyword) ORDER BY pt.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, name, description, active FROM [dbo].session_types WHERE active = 1 ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].session_types WHERE active = 1`)
        })
    }


}