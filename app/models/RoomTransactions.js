const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const {
    body,
    Result
} = require('express-validator');

module.exports = class RoomTransactions {

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} rt.id, rtt.name as transaction_type, rt.transaction_type_id, rts.name as stage, stage_id, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
            FROM [${slug}].room_transactions rt
            INNER JOIN dbo.room_transaction_types rtt ON rt.transaction_type_id = rtt.id
            INNER JOIN dbo.room_transaction_stages rts ON rt.stage_id = rts.id
            INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
            INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
            INNER JOIN [${slug}].users u ON u.id =  rt.user_id
            WHERE rt.active = 1 AND rtt.active = 1 AND rts.active = 1 AND org.active = 1 AND camp.active = 1 AND u.active = 1 ORDER BY rt.id DESC`)
        }).catch(error => {
            throw error
        })
    }

    static save(slug, inputJson) {
        console.log('JOSN FORM FE:::::::::::::::>>>',JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_new_room_transactions]`)
        })
    }


    static pegination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT rt.id, rtt.name as transaction_type, rt.transaction_type_id, rts.name as stage, stage_id, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
                FROM [${slug}].room_transactions rt
                INNER JOIN dbo.room_transaction_types rtt ON rt.transaction_type_id = rtt.id
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_id = rts.id
                INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
                INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
                INNER JOIN [${slug}].users u ON u.id =  rt.user_id
                WHERE rt.active = 1 AND rtt.active = 1 AND rts.active = 1 AND org.active = 1 AND camp.active = 1 AND u.active = 1 ORDER BY rt.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }


    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} rt.id, rtt.name as transaction_type, rt.transaction_type_id, rts.name as stage, stage_id, org.org_name, org.org_abbr, camp.campus_abbr, u.username  
                FROM [${slug}].room_transactions rt
                INNER JOIN dbo.room_transaction_types rtt ON rt.transaction_type_id = rtt.id
                INNER JOIN dbo.room_transaction_stages rts ON rt.stage_id = rts.id
                INNER JOIN dbo.organizations org ON org.id =  rt.org_lid
                INNER JOIN dbo.campuses camp ON camp.id =  rt.campus_lid
                INNER JOIN [${slug}].users u ON u.id =  rt.user_id
                WHERE rt.active = 1 AND rtt.active = 1 AND rts.active = 1 AND org.active = 1 AND camp.active = 1 AND u.active = 1 AND (rtt.name LIKE @keyword OR rts.name LIKE @keyword OR org.org_name LIKE @keyword OR org.org_abbr LIKE @keyword OR camp.campus_abbr LIKE @keyword OR u.username LIKE @keyword ) ORDER BY rt.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].room_transactions WHERE active = 1`)
        })
    }


}