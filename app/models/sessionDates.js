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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, st.name as session_type, acs.acad_session
            FROM [${slug}].session_dates sd 
            INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
            INNER JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
            INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
            INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.program_lid
            WHERE sd.active = 1 AND ac.active = 1 AND ac1.active = 1 AND st.active = 1 AND ps.active = 1 AND acs.active = 1 ORDER BY sd.id DESC`)
        })
    }

    static save(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('ProgramSession', sql.Int, body.acadSession)
                .input('SessionType', sql.Int, body.sessionType)
                .input('StartDate', sql.Int, body.startDate)
                .input('EndDate', sql.Int, body.endDate)
                .query(`INSERT INTO [${slug}].session_dates (program_session_lid, session_type_lid, start_date_id, end_date_id) VALUES (@ProgramSession, @SessionType, @StartDate, @EndDate)`)
        })
    }

    static findById(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, id)
                .query(`SELECT id, program_session_lid, session_type_lid, start_date_id, end_date_id FROM [${slug}].session_dates WHERE id = @Id`)
        })
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('Id', sql.Int, body.id)
                .input('AcadSessionLid', sql.Int, body.acadSession)
                .input('SessionTypeLid', sql.Int, body.sessionType)
                .input('StartDateId', sql.Int, body.startDate)
                .input('EndDateId', sql.Int, body.endDate)
                .query(`UPDATE [${slug}].session_dates SET program_session_lid = @AcadSessionLid, session_type_lid = @SessionTypeLid, start_date_id = @StartDateId, end_date_id = @EndDateId  WHERE id = @Id`)
        })
    }


    static delete(ids, slug) {
        return poolConnection.then(pool => {
            let request = pool.request();
            JSON.parse(ids).forEach(element => {
                return request.query(`UPDATE [${slug}].session_dates SET active = 0  WHERE id = ${element.id}`)
            });
        })
    }

    static deleteAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [${slug}].session_dates SET active = 0 WHERE active = 1`)
        })
    }

    static search(rowcount, keyword, slug) {
        console.log(rowcount, keyword, slug)
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, st.name as session_type, acs.acad_session
                FROM [${slug}].session_dates sd 
                INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
                INNER JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
                INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.program_lid
                WHERE sd.active = 1 AND ac.active = 1 AND ac1.active = 1 AND st.active = 1 AND ps.active = 1 AND acs.active = 1 AND (ac.date LIKE @keyword OR ac1.date LIKE @keyword OR st.name LIKE @keyword OR acs.acad_session LIKE @keyword) 
				ORDER BY sd.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT sd.id, sd.program_session_lid, sd.session_type_lid, sd.start_date_id, sd.end_date_id, CONVERT(NVARCHAR, ac.date, 105) as startDate ,  CONVERT(NVARCHAR, ac1.date, 105) as endDate, st.name as session_type, acs.acad_session
                FROM [${slug}].session_dates sd 
                INNER JOIN [dbo].[academic_calendar] ac ON sd.start_date_id =  ac.id
                INNER JOIN [dbo].[academic_calendar] ac1 ON sd.end_date_id =  ac1.id
                INNER JOIN [dbo].[session_types] st ON st.id = sd.session_type_lid
                INNER JOIN [${slug}].[program_sessions] ps ON ps.id =  sd.program_session_lid
                INNER JOIN [dbo].acad_sessions acs ON acs.id = ps.program_lid
                WHERE sd.active = 1 AND ac.active = 1 AND ac1.active = 1 AND st.active = 1 AND ps.active = 1 AND acs.active = 1 ORDER BY sd.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].session_dates WHERE active = 1`)
        })
    }


}