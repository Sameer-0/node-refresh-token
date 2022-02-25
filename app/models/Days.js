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


}