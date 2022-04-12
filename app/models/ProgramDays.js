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
            ORDER BY pd.id DESC`)
        })
    }

    static pagination(rowcount, pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT TOP ${Number(rowcount)} pd.id, pd.program_lid, pd.day_lid, IIF(pd.is_lecture = 1 ,'Yes','No') as is_lecture, p.program_name, d.day_name 
                FROM [${slug}].program_days pd
                INNER JOIN [${slug}].programs p ON  pd.program_lid =  p.id  
                INNER JOIN [${slug}].days d ON pd.day_lid = d.id
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
                WHERE p.program_name LIKE @keyword OR d.day_name LIKE @keyword OR is_lecture LIKE @keyword ORDER BY pd.id DESC`)
        })
    }


    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].program_days`)
        })
    }
}