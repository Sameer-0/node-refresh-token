const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class DboDays {

    constructor(dayOfWeek, dayName, isLecture) {
        this.dayOfWeek = dayOfWeek;
        this.dayName = dayName;
        this.isLecture = isLecture;
    }

    static fetchAll(rowcont, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcont)} id, day_name, day_of_week, active as status FROM [dbo].[days] where active = 1  ORDER BY id ASC`)
        })
    }


}