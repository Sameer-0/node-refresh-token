const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
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

    static fetchAll() {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT b.id AS building_id, b.building_name, b.building_number, b.total_floors, b.owner_id, b.handled_by, b.start_time, b.end_time, b.campus_id FROM [dbo].buildings b`)
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
}