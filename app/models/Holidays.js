const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class Holidays {
    constructor(calenderId, calenderName, campusId, campusLid, ordLid, calenderYear, hDate, Reason, holidayTypeId) {
        this.calenderId = calenderId;
        this.calenderName = calenderName;
        this.campusId = campusId;
        this.campusLid = campusLid;
        this.ordLid = ordLid;
        this.calenderYear = calenderYear;
        this.hDate = hDate;
        this.Reason = Reason;
        this.holidayTypeId = holidayTypeId;
    }


    static insert(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('calenderId', sql.Int, body.calenderId)
                .input('calenderName', sql.NVarChar(20), body.calenderName)
                .input('campusId', sql.NVarChar(15), body.campusId)
                .input('campusLid', sql.Int, body.campusLid)
                .input('ordLid', sql.Int, body.ordLid)
                .input('calenderYear', sql.SmallInt, body.calenderYear)
                .input('hDate', sql.Date, body.hDate)
                .input('Reason', sql.NVarChar(100), body.Reason)
                .input('holidayTypeId', sql.Int, body.holidayTypeId)
            let stmt = `INSERT INTO  [dbo].[holidays] (calender_id, calender_name, campus_id, campus_lid, ord_lid, calender_year, h_date, reason, holiday_type_id)  VALUES (@calenderId, @calenderName, @campusId, @campusLid, @ordLid, @calenderYear, @hDate, @Reason, @holidayTypeId)`
            return request.query(stmt)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('calenderId', sql.Int, body.calenderId)
                .input('calenderName', sql.NVarChar(20), body.calenderName)
                .input('campusId', sql.NVarChar(15), body.campusId)
                .input('campusLid', sql.Int, body.campusLid)
                .input('ordLid', sql.Int, body.ordLid)
                .input('calenderYear', sql.SmallInt, body.calenderYear)
                .input('hDate', sql.Date, body.hDate)
                .input('Reason', sql.NVarChar(100), body.Reason)
                .input('holidayTypeId', sql.Int, body.holidayTypeId)
                .input('Id', sql.Int, body.Id)
            let stmt = `INSERT INTO  [dbo].[holidays] (calender_id, calender_name, campus_id, campus_lid, ord_lid, calender_year, h_date, reason, holiday_type_id)  VALUES (@calenderId, @calenderName, @campusId, @campusLid, @ordLid, @calenderYear, @hDate, @Reason, @holidayTypeId)`
            return request.query(stmt)
        })
    }


    static delete(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.NVarChar(255), id)
            let stmt = `UPDATE [dbo].[holidays] SET active  = 0 WHERE id =  @Id`
            return request.query(stmt)
        })
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} hd.id, hd.calendar_id, hd.calendar_name, hd.campus_id, hd.campus_lid, hd.org_lid, hd.calendar_year, hd.h_date, hd.reason, hd.holiday_type_id, hd.active FROM dbo.holidays hd WHERE hd.active = 1 ORDER BY hd.id DESC`)
        })
    }

    static fetchById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('Id', sql.NVarChar(255), id)
                .request().query(`SELECT * FROM [dbo].[holidays] WHERE id = @Id`)
        })
    }

}