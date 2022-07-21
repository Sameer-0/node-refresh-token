const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class SessionCalendar {

    static fetchSessionStartEnd() {
        return poolConnection.then(pool => {
            return pool.request().query(`select  CONVERT(NVARCHAR, MIN(date), 23) as start_date , CONVERT(NVARCHAR, MAX(date), 23) as end_date from session_calendar`)
        })
    }
}