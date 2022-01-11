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

    static fetchAll(limit,offset) {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
         //  let request = pool.request();
        //  return  request.input('OFFSETCOUNT',sql.Int,limit)
        //    .input('NEXTOFFSETCOUNT',sql.Int,offset)
       return pool.request().query(`select id, campus_id, campus_abbr as abbr, campus_name_40_char as name, campus_description as c_desc from [dbo].campus_master where active = 1 order by id desc`)
        //   .query(`select om.id, om.org_id, om.org_abbr, om.org_name, om.org_complete_name, om.org_type_id , ot.name as org_type
        //    from [dbo].organization_master om join  [dbo].organization_type ot on om.org_type_id = ot.id  where ot.active = 1 and om.active = 1
        //    ORDER BY om.id DESC OFFSET @OFFSETCOUNT ROWS FETCH NEXT @NEXTOFFSETCOUNT ROWS ONLY`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('Campus_id', sql.Int, body.campusId)
            request.input('Campus_abbr', sql.NVarChar(40), body.campusAbbr)
            request.input('Campus_name_40_char', sql.NVarChar(40), body.campusName)
            request.input('campus_description', sql.NVarChar(150), body.campusDesc)
            return request.query(`insert into [dbo].campus_master (campus_id, campus_abbr, campus_name_40_char, campus_description) values(@Campus_id, @Campus_abbr, @Campus_name_40_char,@campus_description)`);
        })
    }

    static getCampusById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`select id, campus_id, campus_abbr, campus_name_40_char, campus_description from [dbo].campus_master  where id = @id`)
        })
    }


    static update(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('Id', sql.Int, body.Id)
            request.input('Campus_id', sql.Int, body.campusId)
            request.input('Campus_abbr', sql.NVarChar(40), body.campusAbbr)
            request.input('Campus_name_40_char', sql.NVarChar(40), body.campusName)
            request.input('campus_description', sql.NVarChar(150), body.campusDesc)
            return request.query(`update [dbo].campus_master set campus_id = @Campus_id, campus_abbr = @Campus_abbr, campus_name_40_char = @Campus_name_40_char, campus_description = @campus_description where id = @Id`);
        })
    }


    static deleteById(id){
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('Id', sql.Int, id)
            return request.query(`update [dbo].campus_master set active = 0 where id = @Id`);
        })
    }
}