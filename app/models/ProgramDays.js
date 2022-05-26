const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} pd.id, pd.program_lid, pd.day_lid, IIF(pd.is_lecture = 1 ,'Yes','No') as is_lecture, p.program_name, d.day_name 
            FROM [${slug}].program_days pd
            INNER JOIN [${slug}].programs p ON  pd.program_lid =  p.id  
            INNER JOIN [${slug}].days d ON pd.day_lid = d.id
            WHERE d.status = 1 ORDER BY pd.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  pd.id, pd.program_lid, pd.day_lid, IIF(pd.is_lecture = 1 ,'Yes','No') as is_lecture, p.program_name, d.day_name 
                FROM [${slug}].program_days pd
                INNER JOIN [${slug}].programs p ON  pd.program_lid =  p.id  
                INNER JOIN [${slug}].days d ON pd.day_lid = d.id
                WHERE d.status = 1
                ORDER BY pd.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }
 
    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} pd.id, pd.program_lid, pd.day_lid, IIF(pd.is_lecture = 1 ,'Yes','No') as is_lecture, p.program_name, d.day_name 
                FROM [${slug}].program_days pd
                INNER JOIN [${slug}].programs p ON  pd.program_lid =  p.id  
                INNER JOIN [${slug}].days d ON pd.day_lid = d.id
                WHERE d.status = 1 AND 
                WHERE p.program_name LIKE @keyword OR d.day_name LIKE @keyword OR is_lecture LIKE @keyword ORDER BY pd.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].program_days pd INNER JOIN
            [${slug}].days d on d.id = pd.day_lid where d.status =1`)
        })
    }

    static update(body, slug, userId) {
        console.log('slug',slug)
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.Int, body.id)
                .input('Status', sql.TinyInt, body.status)
                .input('userId', sql.TinyInt, userId)
            let stmt = `UPDATE [${slug}].program_days SET is_lecture = @Status, last_modified_by = @userId WHERE id =  @Id`
            return request.query(stmt)
        })
    }


    static refresh(slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_refresh_program_days]`)
        })
    }
}