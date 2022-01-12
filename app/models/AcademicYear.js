const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
module.exports = class AcademicYear {
    constructor(name, startDate, endDate, inputAcadYear) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.inputAcadYear = inputAcadYear;
    }

    static fetchAll() {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT ac.id, ac.name, ac.start_date, ac.end_date, ac.input_acad_year FROM [dbo].academic_year ac WHERE ac.active  = 1`)
        })
    }

    static save(body) {
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
}