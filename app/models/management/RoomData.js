const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')

module.exports = class RoomData {
    constructor(roomNumber, buildingId, roomTypeId, floorNumber, capacity, startTime, endTime, handledBy, isBasement, isProcessed) {
        this.roomNumber = roomNumber;
        this.buildingId = buildingId;
        this.roomTypeId = roomTypeId;
        this.floorNumber = floorNumber;
        this.capacity = capacity;
        this.startTime = startTime;
        this.endTime = endTime;
        this.handledBy = handledBy;
        this.isBasement = isBasement;
        this.isProcessed = isProcessed;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP 10 r.room_number, r.building_id, r.room_type_id, r.floor_number, r.capacity, r.start_time, r.end_time, r.handled_by,
            r.is_basement, r.is_processed FROM [dbo].room_data r WHERE active = 1 ORDER BY id DESC`)

        })
    }
}

