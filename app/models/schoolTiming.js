const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class schoolTiming{
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
}