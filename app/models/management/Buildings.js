const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
const moment = require('moment');
module.exports = class Buildings {
    constructor(building_name, building_number, total_floors, owner_id, handled_by, start_time, end_time, campus_id) {
        this.building_name = building_name;
        this.building_number = building_number;
        this.total_floors = total_floors;
        this.owner_id = owner_id;
        this.handled_by = handled_by;
        this.start_time = start_time;
        this.end_time = end_time;
        this.campus_id = campus_id;
    }

    static Save(body) {

        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Building_name', sql.NVarChar(255), body.buildingName)
                .input('Building_number', sql.NVarChar(50), body.buildingNumber)
                .input('Total_floors', sql.Int, body.floors)
                .input('Owner_id', sql.Int, body.ownerId)
                .input('Handled_by', sql.Int, body.handledById)
                .input('Start_time', sql.Int, body.startTimeId)
                .input('End_time', sql.Int, body.endTimeId)
                .input('Campus_id', sql.Int, body.campusId)
            let stmt = `insert into [dbo].buildings(building_name, building_number,total_floors,owner_id,handled_by,start_time,end_time,campus_id) values (@Building_name, @Building_number,@Total_floors,@Owner_id,@Handled_by,@Start_time,@End_time,@Campus_id)`
            return request.query(stmt)
        }).catch(error => {
            throw error
        })
    }

    static fetchAll() {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().query(`select b.id as building_id, b.building_name, b.building_number,b.total_floors, b.owner_id,b.handled_by, b.start_time ,b.end_time, b.campus_id from [dbo].buildings b`)
        })
    }

    static fetchbyId(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.Int, id)
            return request.query(`select b.id, b.building_name, b.building_number,b.total_floors, b.owner_id,b.handled_by, b.start_time ,b.end_time, b.campus_id from [dbo].buildings b where id =  @Id`)
        })
    }


    static Update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('buildingid', sql.NVarChar(50), body.buildingid)
                .input('Building_name', sql.NVarChar(255), body.buildingName)
                .input('Building_number', sql.NVarChar(50), body.buildingNumber)
                .input('Total_floors', sql.Int, body.floors)
                .input('Owner_id', sql.Int, body.ownerId)
                .input('Handled_by', sql.Int, body.handledById)
                .input('Start_time', sql.Int, body.startTimeId)
                .input('End_time', sql.Int, body.endTimeId)
                .input('Campus_id', sql.Int, body.campusId)
            let stmt = `update [dbo].buildings set building_name = @Building_name, building_number = @Building_number,total_floors = @Total_floors, owner_id = @Owner_id,handled_by = @Handled_by,start_time  = @Start_time,end_time = @End_time, campus_id = @Campus_id where id = @buildingid`
            return request.query(stmt)
        }).catch(error => {
            throw error
        })
    }
}