const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
module.exports = class OrganizationTypes {
        constructor(name, description) {
            this.name = name;
            this.description = description
        }


        static fetchAll(){
            return poolConnection.then(pool => {
                return pool.request().query(`select id, name, description from [dbo].organization_type where active  = 1`)
            })
        }


}