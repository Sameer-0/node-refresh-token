const {
    dbconfig
} = require("../../config/databaseConfig")

module.exports = class AcadSession {
    constructor(acadSession) {
        this.acadSession = acadSession;
    }
}