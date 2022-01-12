const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')

module.exports = class RoomData {
    constructor(room_number, building_id, room_type_id, floor_number, capacity, start_time, end_time, handled_by, is_basement, is_processed) {
        this.room_number = room_number;
        this.building_id = building_id;
        this.room_type_id = room_type_id;
        this.floor_number = floor_number;
        this.capacity = capacity;
        this.start_time = start_time;
        this.end_time = end_time;
        this.handled_by = handled_by;
        this.is_basement = is_basement;
        this.is_processed = is_processed;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`select top 10 r.room_number, r.building_id, r.room_type_id, r.floor_number, r.capacity, r.start_time, r.end_time, r.handled_by,
            r.is_basement, r.is_processed from [dbo].room_data r where active = 1 order by id desc`)

        })
    }
}

