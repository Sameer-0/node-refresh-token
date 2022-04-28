const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const slug = require('../controllers/management/slug');

module.exports = class FacultyBatch {

    constructor(faculty_id, faculty_name, batch) {
        this.id = id;
        this.faculty_id = faculty_id;
        this.faculty_name = faculty_name;
        this.faculty_batch = batch;
    }

    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_batches]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fb.id, fb.faculty_lid, fb.batch, f.faculty_name, f.faculty_id
            FROM [${slug}].faculty_batches fb
            INNER JOIN [${slug}].[faculties] f ON fb.faculty_lid =  f.id         
            ORDER BY fb.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_batches`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} fb.id, fb.faculty_lid, fb.batch, f.faculty_name, f.faculty_id
                FROM [${slug}].faculty_batches fb
                INNER JOIN [${slug}].[faculties] f ON fb.faculty_lid =  f.id 
                WHERE  f.faculty_name LIKE @keyword OR  f.faculty_id LIKE @keyword OR fb.batch LIKE @keyword
                ORDER BY fb.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  fb.id, fb.faculty_lid, fb.batch, f.faculty_name, f.faculty_id
                FROM [${slug}].faculty_batches fb
                INNER JOIN [${slug}].[faculties] f ON fb.faculty_lid =  f.id         
                ORDER BY fb.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_batches]`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_request_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_batch]`)
        })
    }

}