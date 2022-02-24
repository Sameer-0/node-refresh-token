const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class Organizations {
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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} org.id, org.org_id, org.org_abbr, org.org_name, org.org_complete_name, org.org_type_id , ot.name AS org_type,
            camp.campus_abbr
            FROM [dbo].organizations org 
            INNER JOIN [dbo].organization_types ot ON org.org_type_id = ot.id
            INNER JOIN [dbo].campuses camp ON camp.id = org.campus_lid
            WHERE ot.active = 1 AND org.active = 1 AND camp.active = 1 ORDER BY org.id DESC`)
        })
    }

    static fetchChunkRows(pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name AS org_type
            FROM [dbo].organizations om JOIN [dbo].organization_types ot ON om.org_type_id = ot.id  WHERE ot.active = 1 AND om.active = 1 ORDER BY om.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static getOrgById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('id', sql.Int, id)
                .query(`SELECT id, org_id, org_abbr, org_name, org_complete_name, org_type_id FROM [dbo].organizations WHERE id = @id`)
        })
    }


    static save(inputJSON) {
        console.log('inputJSON:::::::::::::>>>', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_add_new_organizations]')
        })
    }

    static update(inputJSON) {
        console.log('INPUT JSON:::::::::::::>>', inputJSON)
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[sp_update_organizations]')
        })
    }

    static delete(inputJSON) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[dbo].[delete_organizations]')
        })
    }

    static deleteAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`UPDATE [dbo].organizations SET active = 0 WHERE active = 1`)
        })
    }

    static getCount() {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT COUNT(*) AS count FROM [dbo].organizations WHERE active = 1`)
        })
    }

    static searchOrg(rowcont, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcont)} om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name AS org_type
                FROM [dbo].organizations om JOIN [dbo].organization_types ot ON om.org_type_id = ot.id  
                WHERE ot.active = 1 AND om.active = 1 and (om.id like @keyword or om.org_abbr like @keyword 
                    or om.org_complete_name like @keyword or ot.name like @keyword) ORDER BY om.id DESC`)
        })
    }



}