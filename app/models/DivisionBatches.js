const {
    pool
} = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class DivisionBatches {
    constructor(divisionId, batch, eventType, divisionCount, inputBatchCount, facultyCount) {
        this.divisionId = divisionId;
        this.batch = batch;
        this.eventType = eventType;
        this.divisionCount = divisionCount;
        this.inputBatchCount = inputBatchCount;
        this.facultyCount = facultyCount;
    }


    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} db.id, d.division, db.batch, db.event_type,db.division_count, 
            db.batch_count, db.input_batch_count,db.faculty_count FROM [bncp-mum].[division_batches] db
            INNER JOIN [bncp-mum].[divisions] d on d.id = db.division_id
            where d.active = 1 AND db.active = 1`)
        })
    }

    static addBatch(body) {
        return poolConnection.then(pool => {
            return pool.request().input('divisionId', sql.Int, body.divisionId)
            .input('batch', sql.Int, body.batch)
            .input('eventType', sql.Char, body.eventType)
            .input('divisionCount', sql.Int, body.divisionCount)
            .input('batchCount', sql.Int, body.batchCount)
            .input('inputBatchCount', sql.Int, body.inputBatchCount)
            .input('facultyCount', sql.SmallInt, body.facultyCount)
            .query(`INSERT INTO [bncp-mum].[division_batches] (division_id, batch, event_type, division_count, batch_count, input_batch_count, faculty_count) 
            values (@divisionId, @batch, @eventType, @divisionCount, @batchCount, @inputBatchCount, @facultyCount)`)
        })
    }

    static getBatch(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
            .query(`SELECT id, division_id, batch, event_type, division_count, batch_count, input_batch_count, faculty_count FROM [bncp-mum].division_batches WHERE id = @id `)
        })
    }
}