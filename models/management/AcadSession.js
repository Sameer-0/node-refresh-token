const {
    dbconfig
} = require("../../config/databaseConfig")

module.exports = class AcadSession {
    constructor(acad_session) {
        this.acad_session = acad_session;
    }
}