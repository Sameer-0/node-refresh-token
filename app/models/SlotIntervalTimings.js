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

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, CONVERT(NVARCHAR, start_time, 0) AS start_time, CONVERT(NVARCHAR,end_time,0) AS end_time, slot_name FROM [dbo].slot_interval_timings ORDER BY id ASC`)
        }).catch(error => {
            throw error
        })
    }

    static single(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`SELECT  id, CONVERT(char(5), start_time, 108) AS start_time, CONVERT(char(5), end_time, 108) AS end_time, slot_name FROM [dbo].slot_interval_timings WHERE id = @Id`)
        }).catch(error => {
            throw error
        })
    }

    static create(body) {
  
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('slotName', sql.NVarChar(20), body.slotName)
                .input('startTime', sql.NVarChar(10), body.startTime)
                .input('endTime', sql.NVarChar(10), body.endTime)
                .query(`INSERT INTO [dbo].slot_interval_timings (slot_name, start_time, end_time) VALUES (@slotName, @startTime, @endTime)`)
        }).catch(error => {
            throw error
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('slotName', sql.NVarChar(20), body.slotName)
            .input('startTime', sql.NVarChar(10), body.startTime)
            .input('endTime', sql.NVarChar(10), body.endTime)
                .input('Id', sql.Int, body.id)
                .query(`UPDATE [dbo].slot_interval_timings SET slot_name = @slotName, start_time = @startTime, end_time = @endTime WHERE id = @Id`)
        }).catch(error => {
            throw error
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, id)
                .query(`DELETE FROM [dbo].slot_interval_timings  WHERE id = @Id`)
        }).catch(error => {
            throw error
        })
    }


    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} id, slot_name, CONVERT(NVARCHAR, start_time, 0) AS start_time, CONVERT(NVARCHAR, end_time, 0) AS end_time FROM  [dbo].slot_interval_timings WHERE slot_name LIKE @keyword  OR end_time LIKE @keyword OR  end_time LIKE @keyword ORDER BY id DESC`)
        }).catch(error => {
            throw error
        })
    }


    static count() {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [dbo].slot_interval_timings`)
        }).catch(error => {
            throw error
        })
    }

}