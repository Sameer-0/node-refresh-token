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
            WHERE rt.active = 1 ORDER BY rt.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].room_transactions WHERE active = 1`)
        })
    }

    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} b.id AS building_id, b.building_name, b.building_number, 
                b.total_floors, org_o.org_abbr AS owner, org_h.org_abbr AS handled_by, CONVERT(NVARCHAR, st.start_time, 100) AS start_time, 
                CONVERT(NVARCHAR, et.end_time, 100) AS end_time, c.campus_abbr FROM dbo.buildings b 
                INNER JOIN dbo.organizations org_o ON org_o.id = b.owner_id 
                INNER JOIN dbo.organizations org_h ON org_h.id = b.handled_by 
                INNER JOIN dbo.slot_interval_timings st ON st.id = b.start_time_id 
                INNER JOIN dbo.slot_interval_timings et ON et.id = b.end_time_id 
                INNER JOIN dbo.campuses c ON c.id = b.campus_lid WHERE b.active = 1 
                AND st.active = 1 AND org_h.active = 1 and b.building_name like @keyword or  b.building_number like @keyword 
                or b.total_floors like @keyword or org_o.org_abbr like @keyword or org_h.org_abbr like @keyword or  st.start_time like @keyword or
                et.end_time like @keyword or c.campus_abbr like @keyword
                ORDER BY b.id DESC`)
        })
    }

    static pagination(slug, pageNo) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT TOP ${Number(rowcount)} rt.id, IIF(rt.transaction_type_lid IS NULL, 'NA',(select rtt.name from  dbo.room_transaction_types rtt where rt.transaction_type_lid = rtt.id AND rtt.active = 1)) as transaction_type, rt.transaction_type_lid, rts.name as stage,
                org.org_name, org.org_abbr,  camp.campus_abbr, rt.stage_lid, rt.created_on, rt.updated_on, rt.org_lid, rt.campus_lid, rt.user_lid, rt.active, rt.tenant_id, rt.tenant_room_transaction_id, t.slug_name
                FROM [${slug}].room_transactions rt 
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
                INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
                INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
                INNER JOIN dbo.tenants t ON t.id =  rt.tenant_id
                WHERE rt.active = 1 ORDER BY rt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }
}