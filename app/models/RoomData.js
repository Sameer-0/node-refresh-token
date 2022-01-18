const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

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

    static fetchAll(rowCount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowCount)} r.id as roomid, r.room_number, b.building_name AS building_name, rt.name AS room_type, r.floor_number, r.capacity,
            CONVERT(NVARCHAR, r.start_time, 100) AS start_time, CONVERT(NVARCHAR, r.end_time, 100) AS end_time,
            o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, r.is_processed  FROM [dbo].room_data r
            INNER JOIN [dbo].[buildings] b ON b.id = r.building_id
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
            INNER JOIN [dbo].organization_master o ON o.id = r.handled_by
            INNER JOIN [dbo].campus_master c ON c.id = b.campus_id WHERE r.active = 1`)

        })
    }

    static fetchRoomById(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
            .query(`SELECT r.room_number, b.building_name AS building_name, b.id AS buildingid, rt.name AS room_type, r.floor_number, r.capacity,
            CONVERT(NVARCHAR, r.start_time, 100) AS start_time, CONVERT(NVARCHAR, r.end_time, 100) AS end_time,
            o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, r.is_processed  FROM [dbo].room_data r
            INNER JOIN [dbo].[buildings] b ON b.id = r.building_id
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
            INNER JOIN [dbo].organization_master o ON o.id = r.handled_by
            INNER JOIN [dbo].campus_master c ON c.id = b.campus_id WHERE r.id = @id`)
        })
    }


    static fetchChunkRows(rowCount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request().input('pageNo', sql.Int, pageNo)
                .query(`SELECT r.room_number, b.building_name AS building_name, rt.name AS room_type, r.floor_number, r.capacity,
            st.start_time AS start_time, et.end_time AS end_time,
            o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, r.is_processed  FROM [dbo].room_data r
            INNER JOIN [dbo].[buildings] b ON b.id = r.building_id
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
            INNER JOIN [dbo].organization_master o ON o.id = r.handled_by
            INNER JOIN [dbo].slot_interval_timings st ON st.id = b.start_time 
            INNER JOIN [dbo].slot_interval_timings et ON et.id = b.end_time
            INNER JOIN [dbo].campus_master c ON c.id = b.campus_id WHERE b.active = 1 AND o.active = 1 AND r.active = 1 AND st.active = 1  ORDER BY r.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        }).catch(error => {
            throw error
        })
    }


    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) AS count FROM [dbo].room_data WHERE active = 1`)
        })
    }

    static searchRoom(rowCount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowCount)} r.room_number, b.building_name AS building_name, rt.name as room_type, r.floor_number, r.capacity,
                CONVERT(NVARCHAR, r.start_time, 100) AS start_time, CONVERT(NVARCHAR, r.end_time, 100) AS end_time,
                o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, r.is_processed  FROM [dbo].room_data r
                inner join [dbo].[buildings] b ON b.id = r.building_id
                inner join [dbo].room_types rt ON rt.id = r.room_type_id 
                inner join [dbo].organization_master o ON o.id = r.handled_by
                inner join [dbo].campus_master c ON c.id = b.campus_id WHERE r.room_number LIKE @keyword OR b.building_name LIKE @keyword OR rt.name LIKE @keyword OR r.floor_number LIKE @keyword OR r.capacity LIKE @keyword  AND r.active = 1 ORDER BY r.id DESC`)
        })
    }
}