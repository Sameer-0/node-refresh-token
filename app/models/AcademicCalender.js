const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class AcademicCalender {


    constructor(dateStr, date, day, dayName, week, isoWeek, dateOfWeek, month, monthName, quater, year, dayOfYear) {
        this.dateStr = dateStr;
        this.date = date;
        this.day = day;
        this.dayName = dayName;
        this.week = week;
        this.isoWeek = isoWeek;
        this.dateOfWeek = dateOfWeek;
        this.month = month;
        this.monthName = monthName;
        this.quater = quater;
        this.year = year;
        this.dayOfYear = dayOfYear;
    }


    static save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('dateStr', sql.NVarChar(12), body.dateStr)
                .input('date', sql.Date, body.date)
                .input('day', sql.Int, body.day)
                .input('dayName', sql.NVarChar(20), body.dayName)
                .input('week', sql.Int, body.week)
                .input('isoWeek', sql.Int, body.isoWeek)
                .input('dayOfWeek', sql.Int, body.dayOfWeek)
                .input('month', sql.Int, body.month)
                .input('monthName', sql.NVarChar(20), body.monthName)
                .input('quarter', sql.Int, body.quarter)
                .input('year', sql.SmallInt, body.year)
                .input('dayOfYear', sql.Int, body.dayOfYear)
                .query(`INSERT INTO [dbo].academic_calender (date_str, date, day, day_name, week, iso_week, day_of_week, month, month_name, quarter, year, day_of_year) VALUES (@dateStr, @date, @day, @dayName, @week, @isoWeek, @dayOfWeek, @month, @monthName, @quarter, @year, @dayOfYear)`)
        }).catch(error => {
            throw error
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request
                .input('dateStr', sql.NVarChar(12), body.dateStr)
                .input('date', sql.Date, body.date)
                .input('day', sql.Int, body.day)
                .input('dayName', sql.NVarChar(20), body.dayName)
                .input('week', sql.Int, body.week)
                .input('isoWeek', sql.Int, body.isoWeek)
                .input('dayOfWeek', sql.Int, body.dayOfWeek)
                .input('month', sql.Int, body.month)
                .input('monthName', sql.NVarChar(20), body.monthName)
                .input('quarter', sql.Int, body.quarter)
                .input('year', sql.SmallInt, body.year)
                .input('dayOfYear', sql.Int, body.dayOfYear)
                .input('acadCalId', sql.Int, body.acadCalId) // id of academic_calender table
                .query(`UPDATE [dbo].academic_calender SET date_str = @dateStr, date = @date, day = @day, day_name = @dayName, week = @week, iso_week =  @isoWeek, day_of_week = @dayOfWeek, month = @month, month_name = @monthName, quarter = @quarter, year = @year, day_of_year = @dayOfYear WHERE id = @acadCalId`)
        }).catch(error => {
            throw error
        })
    }



    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ac.id, ac.date_str, ac.date, ac.day, ac.day_name, ac.week, ac.iso_week, ac.day_of_week, ac.month, ac.month_name, ac.quarter,ac.year, ac.day_of_year FROM [dbo].academic_calendar ac WHERE ac.active = 1`)
        })
    }


    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('acadCalId', sql.Int, id)
                .query(`UPDATE [dbo].academic_calendar SET active = 0 WHERE id = @acadCalId`)
        }).catch(error => {
            throw error
        })
    }



}