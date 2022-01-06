const {
    dbconfig
} = require("../../config/databaseConfig")
exports.module = class OrganizationMaster {
    constructor(org_id, org_abbr, org_name, org_complete_name, org_type_id,parent_id) {
        this.org_id = org_id;
        this.org_abbr = org_abbr;
        this.org_name = org_name;
        this.org_complete_name = org_complete_name;
        this.org_type_id = org_type_id;
        this.parent_id = parent_id;
    }
}