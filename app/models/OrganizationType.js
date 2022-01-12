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
                return pool.request().query(`SELECT id, name, description FROM [dbo].organization_type WHERE active  = 1`)
            })
        }


}