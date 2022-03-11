const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const {
    body,
    Result
} = require('express-validator');

module.exports = class Divisions {

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} d.id, d.division, d.division_num, d.division_count, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name, CONVERT(NVARCHAR, d.active) as active, IIF(d.active = 1 ,'Yes', 'No') as status
            FROM [${slug}].divisions d INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid WHERE  icw.active = 1 ORDER BY d.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].divisions WHERE active = 1`)
        })
    }


    static pegination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT d.id, d.division, d.division_num, d.division_count, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name, CONVERT(NVARCHAR, d.active) as active, IIF(d.active = 1 ,'Yes', 'No') as status
                FROM [${slug}].divisions d INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid WHERE  icw.active = 1 ORDER BY d.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} d.id, d.division, d.division_num, d.division_count, IIF(d.count_for_theory_batch IS NULL , 0, d.count_for_theory_batch) AS count_for_theory_batch, IIF(d.count_for_practical_batch IS NULL , 0 , d.count_for_practical_batch) AS count_for_practical_batch, IIF(d.count_for_tutorial_batch IS NULL ,0, d.count_for_tutorial_batch) AS count_for_tutorial_batch, IIF(d.count_for_workshop_batch IS NULL ,0 , d.count_for_workshop_batch) AS count_for_workshop_batch, icw.module_name, CONVERT(NVARCHAR, d.active) as active, IIF(d.active = 1 ,'Yes', 'No') as status
                FROM [${slug}].divisions d INNER JOIN [${slug}].initial_course_workload icw ON icw.id = d.course_lid WHERE  icw.active = 1 AND (d.division LIKE @keyword OR d.division_count LIKE @keyword OR d.division_num LIKE @keyword OR d.count_for_theory_batch LIKE @keyword OR d.count_for_tutorial_batch LIKE @keyword OR d.count_for_workshop_batch LIKE @keyword OR icw.module_name LIKE @keyword) ORDER BY d.id DESC`)
        })
    }


    static changeStatus(body, slug) {
        console.log(body, slug)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, body.id)
            .input('Status', sql.TinyInt, body.status)
            .query(`UPDATE [${slug}].divisions SET active = @Status WHERE id = @Id`)
        })
    }



}