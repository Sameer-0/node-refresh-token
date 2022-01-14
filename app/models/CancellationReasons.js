const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class CancellationReasons {
    constructor(typeOfCancellation, reasonText, sapId) {
        this.typeOfCancellation = typeOfCancellation;
        this.reasonText = reasonText;
        this.sapId = sapId;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} cr.id cancellationid, cr.type_of_cancellation, cr.reason_text, cr.sap_id FROM [dbo].cancellation_reasons cr where cr.active = 1`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let  = pool.request()
           return  request.input('typeOfCancellation', sql.NVarChar(5), body.typeOfCancellation)
           .input('reasonText', sql.NVarChar(100), body.reasonText)
           .input('sapId', sql.Int, body.sapId)
           .query(`INSERT INTO [dbo].cancellation_reasons (type_of_cancellation, reason_text, sap_id) VALUES (@typeOfCancellation, @reasonText, @sapId)`)
        })
    }

    static update(body) {
        return poolConnection.then(pool => {
            let  = pool.request()
           return  request.input('typeOfCancellation', sql.NVarChar(5), body.typeOfCancellation)
           .input('reasonText', sql.NVarChar(100), body.reasonText)
           .input('sapId', sql.Int, body.sapId)
           .input('cancellationid', sql.Int, body.cancellationid)
           .query(`INSERT INTO [dbo].cancellation_reasons (type_of_cancellation, reason_text, sap_id) VALUES (@typeOfCancellation, @reasonText, @sapId)`)
        })
    }
}