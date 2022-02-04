const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class OrganizationMaster {
    constructor(orgId, orgAbbr, orgName, orgCompleteName, orgTypeId, parentId) {
        this.orgId = orgId;
        this.orgAbbr = orgAbbr;
        this.orgName = orgName;
        this.orgCompleteName = orgCompleteName;
        this.orgTypeId = orgTypeId;
        this.parentId = parentId;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name AS org_type
            FROM [dbo].organization_master om JOIN [dbo].organization_type ot ON om.org_type_id = ot.id  WHERE ot.active = 1 AND om.active = 1 ORDER BY om.id DESC`)
        })
    }

    static fetchChunkRows(pageNo){
        return poolConnection.then(pool => {
            let request =  pool.request()
            return request.input('pageNo', sql.Int, pageNo)
            .query(`SELECT om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name AS org_type
            FROM [dbo].organization_master om JOIN [dbo].organization_type ot ON om.org_type_id = ot.id  WHERE ot.active = 1 AND om.active = 1 ORDER BY om.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getOrgById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, id)
                .query(`SELECT id, org_id, org_abbr, org_name, org_complete_name, org_type_id FROM [dbo].organization_master WHERE id = @id`)
        })
    }


    static save(orgJson) {
        console.log('orgJson:::::::::>>>',orgJson)
        return poolConnection.then(pool => {
            let request = pool.request();
            // return request.input('orgId', sql.Int, body.org_id)
            //     .input('orgAbbr', sql.NVarChar(40), body.org_abbr)
            //     .input('orgName', sql.NVarChar(100), body.org_name)
            //     .input('orgCompleteName', sql.NVarChar(400), body.org_complete_name)
            //     .input('orgTypeId', sql.Int, body.org_type_id)
            //     .query(`INSERT INTO [dbo].organization_master (org_id, org_abbr, org_name, org_complete_name, org_type_id) VALUES (@orgId, @orgAbbr, @orgName,  @orgCompleteName, @orgTypeId)`)
        
        }).catch(error=>{
            throw error
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, body.id)
                .input('orgId', sql.Int, body.org_id)
                .input('orgAbbr', sql.NVarChar(40), body.org_abbr)
                .input('orgName', sql.NVarChar(100), body.org_name)
                .input('orgCompleteName', sql.NVarChar(400), body.org_complete_name)
                .input('orgTypeId', sql.Int, body.org_type_id)
                .query(`UPDATE  [dbo].organization_master SET org_id = @orgId, org_abbr = @orgAbbr, org_name = @orgName, org_complete_name = @orgCompleteName, org_type_id = @orgTypeId WHERE id = @id`)
        })
    }

    static deleteOrgById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, id)
                .query(`UPDATE  [dbo].organization_master SET active  = 0 WHERE id = @id`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].organization_master WHERE active = 1`)

        })
    }

    static searchOrg(rowcont, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcont)} om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name AS org_type
                FROM [dbo].organization_master om JOIN [dbo].organization_type ot ON om.org_type_id = ot.id  
                WHERE ot.active = 1 AND om.active = 1 and om.id like @keyword or om.org_abbr like @keyword 
                or om.org_complete_name like @keyword or ot.name like @keyword ORDER BY om.id DESC`)
        })
    }


}