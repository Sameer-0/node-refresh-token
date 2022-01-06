const {dbconfig} = require("../../config/databaseConfig")
module.exports = class OrganizationTypes {
        constructor(name, description) {
            this.name = name;
            this.description = description
        }
}