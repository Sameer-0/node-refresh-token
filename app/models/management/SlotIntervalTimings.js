
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')

module.exports = class SlotIntervalTimings {
    constructor(start_time, end_time, slot_name) {
        this.start_time = start_time;
        this.end_time = end_time;
        this.slot_name = slot_name;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`select id,start_time,end_time,slot_name from [dbo].slot_interval_timings where active = 1`)
        })
    }

}