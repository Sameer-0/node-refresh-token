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
        this.id= id,
        this.faculty_id = faculty_id;
        this.faculty_name = faculty_name;
        this.faculty_batch = batch;
       
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fb.id, fb.faculty_lid, fb.batch, f.faculty_name, f.faculty_id
            FROM [bncp-mum].faculty_batches fb
            INNER JOIN [bncp-mum].[faculties] f ON fb.faculty_lid =  f.id         
            WHERE fb.active = 1 AND f.active = 1 ORDER BY fb.id DESC`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [bncp-mum].faculty_batches WHERE active = 1`)  
        })
    }

}