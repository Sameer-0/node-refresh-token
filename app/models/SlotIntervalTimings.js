const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class SlotIntervalTimings {
    constructor(startTime, endTime, slotName) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotName = slotName;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT id, CONVERT(NVARCHAR, start_time, 100) AS start_time, CONVERT(NVARCHAR, end_time, 100) AS end_time, slot_name FROM [dbo].slot_interval_timings WHERE active = 1`)
        })
    }

}