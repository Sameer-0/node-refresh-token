const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTiming {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} st.id, st.name,  st.type_lid, st.slot_start_lid, st.slot_end_lid, CONVERT(NVARCHAR, sit.start_time, 100) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 100) AS end_time, st.day_lid, d.day_name,
            p.program_name, p.abbr as program_abbr, stt.name as schooltimetype, acs.acad_session, p.program_id
           FROM [${slug}].school_timings st
           INNER JOIN [dbo].slot_interval_timings sit ON st.slot_start_lid =  sit.id
           INNER JOIN [dbo].slot_interval_timings _sit ON st.slot_end_lid = _sit.id
           INNER JOIN [${slug}].days d ON d.id =  st.day_lid
           INNER JOIN [${slug}].programs p ON p.id = st.program_lid
           INNER JOIN [${slug}].school_timing_types stt ON stt.id = st.type_lid
           INNER JOIN [dbo].acad_sessions acs ON acs.id = st.id
           ORDER BY st.id DESC`)
        })
    }

    static save(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_faculties]`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT st.id, st.name,  st.type_lid, st.slot_start_lid, st.slot_end_lid, CONVERT(NVARCHAR, sit.start_time, 100) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 100) AS end_time, st.day_lid, d.day_name,
                p.program_name, p.abbr as program_abbr, stt.name as schooltimetype, acs.acad_session, p.program_id
               FROM [${slug}].school_timings st
               INNER JOIN [dbo].slot_interval_timings sit ON st.slot_start_lid =  sit.id
               INNER JOIN [dbo].slot_interval_timings _sit ON st.slot_end_lid = _sit.id
               INNER JOIN [${slug}].days d ON d.id =  st.day_lid
               INNER JOIN [${slug}].programs p ON p.id = st.program_lid
               INNER JOIN [${slug}].school_timing_types stt ON stt.id = st.type_lid
               INNER JOIN [dbo].acad_sessions acs ON acs.id = st.id
               ORDER BY st.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} st.id, st.name,  st.type_lid, st.slot_start_lid, st.slot_end_lid, CONVERT(NVARCHAR, sit.start_time, 100) AS start_time, CONVERT(NVARCHAR, _sit.end_time, 100) AS end_time, st.day_lid, d.day_name,
                p.program_name, p.abbr as program_abbr, stt.name as schooltimetype, acs.acad_session, p.program_id
               FROM [${slug}].school_timings st
               INNER JOIN [dbo].slot_interval_timings sit ON st.slot_start_lid =  sit.id
               INNER JOIN [dbo].slot_interval_timings _sit ON st.slot_end_lid = _sit.id
               INNER JOIN [${slug}].days d ON d.id =  st.day_lid
               INNER JOIN [${slug}].programs p ON p.id = st.program_lid
               INNER JOIN [${slug}].school_timing_types stt ON stt.id = st.type_lid
               INNER JOIN [dbo].acad_sessions acs ON acs.id = st.id
               WHERE st.name LIKE @keyword OR sit.start_time LIKE @keyword OR _sit.end_time LIKE @keyword OR d.day_name LIKE @keyword OR p.program_name LIKE @keyword OR p.abbr LIKE @keyword OR stt.name LIKE @keyword OR acs.acad_session LIKE @keyword OR p.program_id LIKE @keyword
               ORDER BY st.id DESC`)
        })
    }

    static getTimeTableSimulationSlots(slug){
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.
            query(`SELECT sct.id, sct.slot_start_lid, sct.slot_end_lid, CAST(FORMAT(CAST(st.start_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as start_time, CAST(FORMAT(CAST(et.end_time AS DATETIME2),'hh:mm tt') AS NVARCHAR(50)) as end_time FROM [${slug}].school_timings sct 
            INNER JOIN slot_interval_timings st ON st.id = sct.slot_start_lid
            INNER JOIN slot_interval_timings et ON et.id = sct.slot_end_lid
            WHERE program_lid = 1 AND acad_session_lid = 16 AND day_lid = 1`)
        })
    }

}