const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class Days {

    constructor(dayOfWeek, dayName, isLecture) {
        this.dayOfWeek = dayOfWeek;
        this.dayName = dayName;
        this.isLecture = isLecture;
    }

    static update(body, slug) {
        return poolConnection.then(pool => {
            const request = pool.request();
            request.input('Id', sql.NVarChar(255), body.id)
                .input('Status', sql.NVarChar(255), body.status)
            let stmt = `UPDATE [${slug}].[days] SET is_lecture = @Status WHERE id =  @Id`
            return request.query(stmt)
        })
    }


    static fetchAll(rowcont, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} id, day_of_week, day_name, IIF(is_lecture = 1,'Yes','No') as is_lecture, is_lecture as is_lecture_status  FROM [${slug}].[days] WHERE active  = 1 ORDER BY id ASC`)
        })
    }


}