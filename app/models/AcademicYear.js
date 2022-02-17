const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class AcademicYear {
    constructor(name, startDate, endDate, inputAcadYear) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.inputAcadYear = inputAcadYear;
    }


    static save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('startDate', sql.Date, body.startDate)
                .input('endDate', sql.Date, body.endDate)
                .input('acadYear', sql.Char(4), body.acadYear)
                .query(`INSERT INTO  [dbo].academic_year (start_date, end_date, input_acad_year) VALUES(@startDate ,@endDate, @acadYear)`)
        }).catch(error => {
            throw error
        })
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT ac.id, ac.name, CONVERT(NVARCHAR, ac.start_date, 23) as start_date, CONVERT(NVARCHAR, ac.end_date, 23) as end_date, TRIM(ac.input_acad_year) as input_acad_year, CONVERT(NVARCHAR(10), ac.active) AS active FROM [dbo].academic_year ac `)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('startDate', sql.Date, body.startDate)
                .input('endDate', sql.Date, body.endDate)
                .input('acadYear', sql.Char(4), body.acadYear)
                .input('id', sql.Int, body.id)
                .query(`UPDATE [dbo].academic_year SET start_date = @startDate , end_date = @endDate, input_acad_year = @acadYear  WHERE id = @id`)
        }).catch(error => {
            throw error
        })
    }

    static softDeleteById(id) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('acadYearId', sql.Int, id)
                .query(`UPDATE [dbo].academic_year SET active = 0 WHERE id = @acadYearId`)
        }).catch(error => {
            throw error
        })
    }

    static switchonOff(active) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('active', sql.Bit, active)
                .query(`UPDATE [dbo].academic_year SET active = @active`)
        }).catch(error => {
            throw error
        })
    }
}