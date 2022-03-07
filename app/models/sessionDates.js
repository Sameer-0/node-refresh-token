const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {
    constructor(program_session_lid, session_type_lid, start_date_id, end_date_id) {
        this.program_session_lid = program_session_lid;
        this.session_type_lid = session_type_lid;
        this.start_date_id = start_date_id;
        this.end_date_id = end_date_id;
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, program_session_lid, session_type_lid, start_date_id, end_date_id FROM [${slug}].session_dates WHERE active = 1`)
        })
    }

    static save(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Program Session', sql.Int, body.programSession)
                .input('Session Type', sql.Int, body.sessionType)
                .input('Start Date', sql.Int, body.startDate)
                .input('End Date', sql.Int, body.endDate)
                .query(`INSERT INTO [${slug}].session_dates (program_session_lid, session_type_lid, start_date_id, end_date_id) VALUES (@Program Session, @Session Type, @Start Date, @End Date)`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, name, description from [${slug}].session_types WHERE id = @Id`)
        })
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, body.id)
                .input('Name', sql.NVarChar(50), body.name)
                .input('Description', sql.NVarChar(100), body.description)
                .query(`UPDATE [${slug}].session_types SET name = @Name, description = @Description WHERE id = @Id`)
        })
    }


    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`UPDATE [${slug}].session_types SET active = 0  WHERE id = ${element.id}`)
            });
        })
    }

    static deleteAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [${slug}].session_types SET active = 0 WHERE active = 1`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(` SELECT TOP ${Number(rowcount)}  pt.id , pt.name, pt.description FROM 
                [${slug}].session_types pt WHERE pt.active = 1 AND (pt.name LIKE @keyword OR pt.description LIKE @keyword) ORDER BY pt.id DESC`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT id, name, description, active FROM [${slug}].session_types WHERE active = 1 ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].session_types WHERE active = 1`)
        })
    }


}