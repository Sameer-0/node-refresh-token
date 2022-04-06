const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class RoomTransactions {

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} rt.id, 
            IIF(rt.transaction_type_lid IS NULL, 'NA',(select rtt.name from  dbo.room_transaction_types rtt where rt.transaction_type_lid = rtt.id)) as transaction_type,
            rt.transaction_type_lid, rts.name as stage, stage_lid, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
            FROM [${slug}].room_transactions rt
            INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
            INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
            INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
            INNER JOIN [${slug}].users u ON u.id =  rt.user_lid  ORDER BY rt.id DESC`)
        }).catch(error => {
            throw error
        })
    }

    static save(slug, inputJson) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[request_for_room_bookings]`)
        })
    }


    static pegination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT rt.id, 
                IIF(rt.transaction_type_lid IS NULL, 'NA',(select rtt.name from  dbo.room_transaction_types rtt where rt.transaction_type_lid = rtt.id)) as transaction_type,
                rt.transaction_type_lid, rts.name as stage, stage_lid, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
                FROM [${slug}].room_transactions rt
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
                INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
                INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
                INNER JOIN [${slug}].users u ON u.id =  rt.user_lid ORDER BY rt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} rt.id, 
                IIF(rt.transaction_type_lid IS NULL, 'NA',(select rtt.name from  dbo.room_transaction_types rtt where rt.transaction_type_lid = rtt.id)) as transaction_type,
                rt.transaction_type_lid, rts.name as stage, stage_lid, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
                FROM [${slug}].room_transactions rt
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_lid = rts.id
                INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
                INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
                INNER JOIN [${slug}].users u ON u.id =  rt.user_lid
                WHERE rts.name LIKE @keyword OR org.org_name LIKE @keyword OR org.org_abbr LIKE @keyword OR camp.campus_abbr LIKE @keyword OR u.username LIKE @keyword ORDER BY rt.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].room_transactions`)
        })
    }

    // ROOM REQUESTS

    static RoomRequest(rowcount, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT TOP ${Number(rowcount)} id, transaction_type_lid, stage_lid, created_on, updated_on, org_lid, campus_lid, user_lid, last_changed, tenant_id, tenant_room_transaction_id
            FROM [${slug}].room_transactions`)
        })
    }

    // Procedure for Room Approval
    static approveRoom(slug, body) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_room_request_lid', sql.Int, body.input_room_request_lid)
                .input('approval_flag', sql.TinyInt, body.approval_flag)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[approval_for_room_booking]`)
        })
    }

}