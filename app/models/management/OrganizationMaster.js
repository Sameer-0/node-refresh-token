const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')
module.exports = class OrganizationMaster {
    constructor(org_id, org_abbr, org_name, org_complete_name, org_type_id, parent_id) {
        this.org_id = org_id;
        this.org_abbr = org_abbr;
        this.org_name = org_name;
        this.org_complete_name = org_complete_name;
        this.org_type_id = org_type_id;
        this.parent_id = parent_id;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`select top 10 om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name as org_type
            from [dbo].organization_master om join [dbo].organization_type ot on om.org_type_id = ot.id  where ot.active = 1 and om.active = 1`)
        })
    }

    static fetchAllForPagination(pageno){
        return poolConnection.then(pool => {
            let request =  pool.request()
            return request.input('pageno',sql.Int, pageno)
            .query(`select top 10 om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name as org_type
            from [dbo].organization_master om join [dbo].organization_type ot on om.org_type_id = ot.id  where ot.active = 1 and om.active = 1 order by id desc OFFSET (@pageno - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getOrgById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.Int, id)
                .query(`select id, org_id, org_abbr, org_name, org_complete_name, org_type_id from [dbo].organization_master where id = @Id`)
        })
    }


    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Org_id', sql.Int, body.org_id)
                .input('Org_abbr', sql.NVarChar(40), body.org_abbr)
                .input('Org_name', sql.NVarChar(100), body.org_name)
                .input('Org_complete_name', sql.NVarChar(400), body.org_complete_name)
                .input('Org_type_id', sql.Int, body.org_type_id)
                .query(`insert into [dbo].organization_master (org_id, org_abbr, org_name, org_complete_name, org_type_id) values(@Org_id, @Org_abbr, @Org_name,  @Org_complete_name, @Org_type_id)`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.Int, body.id)
                .input('Org_id', sql.Int, body.org_id)
                .input('Org_abbr', sql.NVarChar(40), body.org_abbr)
                .input('Org_name', sql.NVarChar(100), body.org_name)
                .input('Org_complete_name', sql.NVarChar(400), body.org_complete_name)
                .input('Org_type_id', sql.Int, body.org_type_id)
                .query(`update  [dbo].organization_master set org_id = @Org_id, org_abbr = @Org_abbr, org_name = @Org_name, org_complete_name = @Org_complete_name, org_type_id = @Org_type_id where id = @Id`)
        })
    }

    static deleteOrgById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Id', sql.Int, id)
                .query(`update  [dbo].organization_master set active  = 0 where id = @Id`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`select count(*) as count from [dbo].organization_master where active = 1`)

        })
    }


}