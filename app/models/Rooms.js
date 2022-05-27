const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Rooms {
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
            return pool.request().query(`SELECT TOP ${Number(rowCount)} r.id, r.id as roomid,  r.room_number, b.building_name AS building_name, rt.name AS room_type, r.floor_number, r.capacity,
            CONVERT(NVARCHAR, st.start_time, 100) AS start_time, CONVERT(NVARCHAR, et.end_time, 100) AS end_time,
            o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, CONVERT(NVARCHAR, r.is_processed) AS is_processed  FROM [dbo].rooms r
            INNER JOIN [dbo].[buildings] b ON b.id = r.building_lid
            INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
            INNER JOIN [dbo].organizations o ON o.id = r.handled_by
            INNER JOIN [dbo].slot_interval_timings st ON st.id = r.start_time_id
            INNER JOIN [dbo].slot_interval_timings et ON et.id = r.end_time_id
            INNER JOIN [dbo].campuses c ON c.id = b.campus_lid ORDER BY r.id DESC`)
        })
    }

    static findOne(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
                .query(`SELECT r.id as roomid, r.room_number, b.building_name AS building_name, b.id AS building_lid, rt.name AS room_type, rt.id AS room_type_id, r.floor_number, r.capacity,
                CONVERT(NVARCHAR, r.start_time_id, 100) AS start_time_id, CONVERT(NVARCHAR, r.end_time_id, 100) AS end_time_id,
                o.id AS handled_by, CONVERT(NVARCHAR, r.is_basement) AS is_basement, CONVERT(NVARCHAR, r.is_processed) AS is_processed  FROM [dbo].rooms r
                INNER JOIN [dbo].[buildings] b ON b.id = r.building_lid
                INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
                INNER JOIN [dbo].organizations o ON o.id = r.handled_by WHERE r.id = @id`)
        })
    }

    static update(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_update_rooms]')
        })
    }


    static fetchChunkRows(rowCount, pageNo) {
        return poolConnection.then(pool => {
            return pool.request().input('pageNo', sql.Int, pageNo)
                .query(`SELECT  r.id as roomid, r.room_number, b.building_name AS building_name, rt.name AS room_type, r.floor_number, r.capacity,
                CONVERT(NVARCHAR, st.start_time, 100) AS start_time, CONVERT(NVARCHAR, et.end_time, 100) AS end_time,
                o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, CONVERT(NVARCHAR, r.is_processed) AS is_processed  FROM [dbo].rooms r
                INNER JOIN [dbo].[buildings] b ON b.id = r.building_lid
                INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
                INNER JOIN [dbo].organizations o ON o.id = r.handled_by
                INNER JOIN [dbo].slot_interval_timings st ON st.id = r.start_time_id
                INNER JOIN [dbo].slot_interval_timings et ON et.id = r.end_time_id
                INNER JOIN [dbo].campuses c ON c.id = b.campus_lid ORDER BY r.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static getCount() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) AS count FROM [dbo].rooms`)
        })
    }

    static searchRoom(rowCount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowCount)} r.id as roomid, r.room_number, b.building_name AS building_name, rt.name AS room_type, r.floor_number, r.capacity,
                CONVERT(NVARCHAR, st.start_time, 100) AS start_time, CONVERT(NVARCHAR, et.end_time, 100) AS end_time,
                o.org_abbr AS handled_by, c.campus_abbr AS campus, r.is_basement, CONVERT(NVARCHAR, r.is_processed) AS is_processed  FROM [dbo].rooms r
                INNER JOIN [dbo].[buildings] b ON b.id = r.building_lid
                INNER JOIN [dbo].room_types rt ON rt.id = r.room_type_id 
                INNER JOIN [dbo].organizations o ON o.id = r.handled_by
                INNER JOIN [dbo].slot_interval_timings st ON st.id = r.start_time_id
                INNER JOIN [dbo].slot_interval_timings et ON et.id = r.end_time_id
                INNER JOIN [dbo].campuses c ON c.id = b.campus_lid WHERE r.room_number 
                LIKE @keyword OR b.building_name LIKE @keyword OR rt.name LIKE @keyword OR r.floor_number LIKE @keyword OR r.capacity LIKE @keyword OR o.org_abbr LIKE @keyword ORDER BY r.id DESC`)
        })
    }


    static delete(id, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_room_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[dbo].[sp_delete_rooms]`)
        })
    }


    static save(inputJSON, userId) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_add_new_rooms]')
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`DELETE FROM [dbo].rooms`)
        })
    }

    static isProcessed(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_add_new_rooms]')
        })
    }

    static getBuildingByCampusId(campus_lid) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('campusLid', sql.Int, campus_lid)
                .query(`SELECT id, building_name, building_number, total_floors, owner_id, handled_by, start_time_id, end_time_id FROM [dbo].buildings
            WHERE campus_lid = @campusLid`)
        })
    }

    static RoomRequest(slug, body) {
        console.log('Body:::::::::::::::::>>>', slug, body)
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('room_transaction_lid', sql.Int, body.input_room_request_lid)
                .input('input_json', sql.TinyInt, body.approval_flag)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[request_for_room_bookings]`)
        })
    }

    static roomsbybuildingid(building_lid) {
        return poolConnection.then(pool => {
            return pool.request().input('building_lid', sql.Int, building_lid)
                .query(`SELECT * FROM [dbo].rooms WHERE building_lid = @building_lid`)
        })
    }


    static fetchBookedRooms() {
        return poolConnection.then(pool => {
            return pool.request()
                .query(`SELECT r.id, r.room_number, r.room_type_id FROM (SELECT DISTINCT room_lid FROM room_slots WHERE alloted_to = 24) t1
                INNER JOIN rooms r ON t1.room_lid = r.id
                ORDER BY r.room_number`)

    static bookedRooms(slug) {

        return poolConnection.then(pool => {
            return pool.request().query(`SELECT DISTINCT r.id, r.room_number,r.floor_number, r.capacity, b.building_name FROM [${slug}].room_transactions rt INNER JOIN
            room_transaction_stages rts ON rts.id = rt.stage_lid AND rts.name = 'accepted' INNER JOIN 
            [${slug}].room_transaction_details rtd ON rtd.room_transaction_lid = rt.id
            INNER JOIN [dbo].rooms r ON r.id =  rtd.room_lid
            INNER JOIN [dbo].buildings b ON b.id = r.building_lid`)

        })
    }
}