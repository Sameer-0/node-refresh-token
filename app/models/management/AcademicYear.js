const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
module.exports = class AcademicYear {
    constructor(name, start_date, end_date, input_acad_year) {
        this.name = name;
        this.start_date = start_date;
        this.end_date = end_date;
        this.input_acad_year = input_acad_year;
    }

    static fetchAll() {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().query(`select ac.id, ac.name, ac.start_date, ac.end_date,ac.input_acad_year from [dbo].academic_year ac where ac.active  = 1`)
        })
    }

    static Save(body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('StartDate', sql.Date, body.startDate)
                .input('EndDate', sql.Date, body.endDate)
                .input('AcadYear', sql.Char(4), body.acadYear)
                .input('Id', sql.Int, body.id)
            let stmt = `update [dbo].academic_year set start_date = @StartDate , end_date = @EndDate, input_acad_year = @AcadYear  where id  = @Id`
            return request.query(stmt)
        }).catch(error => {
            throw error
        })
    }
}