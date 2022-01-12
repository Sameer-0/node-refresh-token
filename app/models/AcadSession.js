const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class AcadSession {
    constructor(acadSession) {
        this.acadSession = acadSession;
    }
}