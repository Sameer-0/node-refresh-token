const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTransactionRequest {
    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT TOP ${Number(rowcount)} rt.id, IIF(rt.transaction_type_lid IS NULL, 'NA',(select rtt.name from  dbo.room_transaction_types rtt where rt.transaction_type_lid = rtt.id AND rtt.active = 1)) as transaction_type, rt.transaction_type_lid, rts.name as stage,
            org.org_name, org.org_abbr,  camp.campus_abbr, rt.stage_lid, rt.created_on, rt.updated_on, rt.org_lid, rt.campus_lid, rt.user_lid, rt.active, rt.tenant_id, rt.tenant_room_transaction_id, t.slug_name
            FROM [${slug}].room_transactions rt 
            INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
            INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
            INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
            INNER JOIN dbo.tenants t ON t.id =  rt.tenant_id
            WHERE rt.active = 1`)
        })
    }
}