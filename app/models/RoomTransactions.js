const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class RoomTransactions {
    constructor(roomId, roomNumber, applicant, transactionTypeId, applicantSapId, startDate, endDate, startTime, endTime, stageId, createdOn, updatedOn, appliedForOrgId, appliedForCampusOrgId, transactionUuid) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.applicant = applicant;
        this.transactionTypeId = transactionTypeId;
        this.applicantSapId = applicantSapId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.stageId = stageId;
        this.createdOn = createdOn;
        this.updatedOn = updatedOn;
        this.appliedForOrgId = appliedForOrgId;
        this.appliedForCampusOrgId = appliedForCampusOrgId;
        this.transactionUuid = transactionUuid;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, transaction_uuid, applicant, applicant_sap_id FROM [dbo].room_transactions WHERE active = 1`)
        })
    }

    static viewTransactionUuId(rowcount, transid) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('transId', sql.UniqueIdentifier, transid)
                .query(`SELECT rt.id AS room_transaction_id, rt.room_id, rt.room_number AS room, rt.applicant, rtt.name as trans_type, rts.name as stage,
                rt.applicant_sap_id,CONVERT(NVARCHAR, rt.start_date, 110) AS start_date , 
                CONVERT(NVARCHAR, rt.end_date, 110) AS end_date ,CONVERT(NVARCHAR, rt.start_time, 100) as start_time, 
                CONVERT(NVARCHAR, rt.end_time, 100) AS end_time, om.org_abbr AS organization, camp.campus_abbr as campus
                FROM [dbo].room_transactions rt 
                INNER JOIN [dbo].room_transaction_types rtt ON rt.transaction_type_id = rtt.id 
                INNER JOIN [dbo].room_transaction_stages rts ON rt.stage_id = rts.id
                INNER JOIN [dbo].organization_master om  on rt.applied_for_org_id =  om.id
                INNER JOIN [dbo].campus_master camp ON rt.applied_for_campus_org_id = camp.id
                WHERE rt.transaction_uuid = @transid`)
        })
    }

    static approveTransactionByUuId(transuuid) {
        return poolConnection.then(pool => {
            let request  = pool.request()
          return request.input('input_transaction_uuid', sql.UniqueIdentifier,  transuuid)
           // .output('message', sql.VarChar(400))
            .execute(`[dbo].room_transaction_approval`)
        })
    }

}