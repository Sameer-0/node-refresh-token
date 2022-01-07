const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
module.exports = class CampusMaster {
    constructor(campus_id, campus_abbr, campus_name_40_char, campus_description) {
        this.campus_id = campus_id;
        this.campus_abbr = campus_abbr;
        this.campus_name_40_char = campus_name_40_char;
        this.campus_description = campus_description;
    }

    static fetchAll() {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().query(`select id, campus_id, campus_abbr, campus_name_40_char, campus_description from [dbo].campus_master`)
        })
    }
}