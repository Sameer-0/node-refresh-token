const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const moment = require('moment');
module.exports = class Buildings {
    constructor(buildingName, buildingNumber, totalFloors, ownerId, handledBy, startTime, endTime, campusId) {
        this.buildingName = buildingName;
        this.buildingNumber = buildingNumber;
        this.totalFloors = totalFloors;
        this.ownerId = ownerId;
        this.handledBy = handledBy;
        this.startTime = startTime;
        this.endTime = endTime;
        this.campusId = campusId;
    }

    static save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('buildingName', sql.NVarChar(255), body.buildingName)
                .input('buildingNumber', sql.NVarChar(50), body.buildingNumber)
                .input('totalFloors', sql.Int, body.floors)
                .input('ownerId', sql.Int, body.ownerId)
                .input('handledBy', sql.Int, body.handledById)
                .input('startTime', sql.Int, body.startTimeId)
                .input('endTime', sql.Int, body.endTimeId)
                .input('campusId', sql.Int, body.campusId)

            let stmt = `INSERT INTO [dbo].buildings (building_name, building_number, total_floors, owner_id, handled_by, start_time, end_time, campus_id) VALUES (@buildingName, @buildingNumber, @totalFloors, @ownerId, @handledBy, @startTime, @endTime, @campusId)`
            return request.query(stmt)
        }).catch(error => {
            throw error
        })
    }

    static fetchAll(rowcount) {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} b.id AS building_id, b.building_name, b.building_number, b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr handled_by, st.start_time AS start_time, et.end_time AS end_time, c.campus_abbr FROM dbo.buildings b INNER JOIN dbo.organization_master org_o ON org_o.id = b.owner_id INNER JOIN dbo.organization_master org_h ON org_h.id = b.handled_by INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time INNER JOIN dbo.campus_master c ON c.id = b.campus_id WHERE b.active = 1 AND st.active = 1 AND org_h.active = 1 ORDER BY b.id DESC`)
        })
    }

    static fetchById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT b.id, b.building_name, b.building_number, b.total_floors, b.owner_id, b.handled_by, b.start_time, b.end_time, b.campus_id FROM [dbo].buildings b WHERE id =  @id`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();

            request.input('buildingId', sql.NVarChar(50), body.buildingId)
                .input('buildingName', sql.NVarChar(255), body.buildingName)
                .input('buildingNumber', sql.NVarChar(50), body.buildingNumber)
                .input('totalFloors', sql.Int, body.floors)
                .input('ownerId', sql.Int, body.ownerId)
                .input('handledBy', sql.Int, body.handledById)
                .input('startTime', sql.Int, body.startTimeId)
                .input('endTime', sql.Int, body.endTimeId)
                .input('campusId', sql.Int, body.campusId)

            let stmt = `UPDATE [dbo].buildings SET building_name = @buildingName, building_number = @buildingNumber, total_floors = @totalFloors, owner_id = @ownerId, handled_by = @handledBy, start_time  = @startTime, end_time = @endTime, campus_id = @campusId WHERE id = @buildingId`
            return request.query(stmt)
        }).catch(error => {
            throw error
        })
    }

    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('buildingId', sql.Int, id)
                .query(`UPDATE [dbo].buildings SET active = 0 WHERE id = @buildingId`)
        }).catch(error => {
            throw error
        })
    }


    static fetchChunkRows(rowcount, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT b.id AS building_id, b.building_name, b.building_number, b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr handled_by, st.start_time AS start_time, et.end_time AS end_time, c.campus_abbr FROM dbo.buildings b INNER JOIN dbo.organization_master org_o ON org_o.id = b.owner_id INNER JOIN dbo.organization_master org_h ON org_h.id = b.handled_by INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time INNER JOIN dbo.campus_master c ON c.id = b.campus_id WHERE b.active = 1 AND st.active = 1 AND org_h.active = 1 ORDER BY b.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        }).catch(error=>{
            throw error
        })
    }

    static getCount(){
                return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].buildings WHERE active = 1`)
        })
    }

}