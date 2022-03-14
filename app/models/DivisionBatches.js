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

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`  SELECT TOP ${Number(rowcount)} db.id, db.division_lid, db.batch, db.event_type_lid, db.divison_count, db.batch_count, 
            db.input_batch_count, db.faculty_count, IIF(db.active = 1 ,'Yes', 'No') as status, d.division, et.name FROM [${slug}].[division_batches] db
            INNER JOIN [${slug}].[divisions] d on d.id = db.division_lid
			INNER JOIN [dbo].[event_types] et on et.id = db.event_type_lid
            where d.active = 1 AND db.active = 1 AND et.active = 1`)
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
            .query(`SELECT id, division_id, batch, event_type, division_count, batch_count, input_batch_count, faculty_count FROM [bncp-mum].division_batches WHERE id = @id`)
        })
    }

    static updateBatch(body) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, body.id)
            .input('divisionId', sql.Int, body.divisionId)
            .input('batch', sql.Int, body.batch)
            .input('eventType', sql.Char, body.eventType)
            .input('divisionCount', sql.Int, body.divisionCount)
            .input('batchCount', sql.Int, body.batchCount)
            .input('inputBatchCount', sql.Int, body.inputBatchCount)
            .input('facultyCount', sql.SmallInt, body.facultyCount)
            .query(`UPDATE [bncp-mum].division_batches SET division_id = @divisionId, batch = @batch, event_type =@eventType, division_count =@divisionCount,
            batch_count =@batchCount, input_batch_count =@inputBatchCount, faculty_count =@facultyCount WHERE id = @id`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request() 
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].division_batches WHERE active = 1`)
        })
    }

    static changeStatus(body, slug) {
        console.log(body, slug)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, body.id)
            .input('Status', sql.TinyInt, body.status)
            .query(`UPDATE [${slug}].division_batches SET active = @Status WHERE id = @Id`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} db.id, db.division_lid, db.batch, db.event_type_lid, db.divison_count, db.batch_count, 
                db.input_batch_count, db.faculty_count, IIF(db.active = 1 ,'Yes', 'No') as status, d.division, et.name FROM [${slug}].[division_batches] db
                INNER JOIN [${slug}].[divisions] d on d.id = db.division_lid
                INNER JOIN [dbo].[event_types] et on et.id = db.event_type_lid
                where d.active = 1 AND db.active = 1 AND et.active = 1 AND (db.division_lid LIKE @keyword OR db.batch LIKE @keyword OR db.event_type_lid LIKE @keyword OR db.division_count LIKE @keyword OR db.batch_count LIKE @keyword OR db.input_batch_count LIKE @keyword OR db.faculty_count LIKE @keyword) ORDER BY d.id DESC`)
        })
    }
}