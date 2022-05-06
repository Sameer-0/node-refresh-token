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
            return pool.request().query(`select TOP ${Number(rowcount)} db.id,  db.batch, db.divison_count, db.batch_count, db.input_batch_count, db.faculty_count, div.division, et.name as event_name, icw.module_name from [${slug}].division_batches db
            INNER JOIN [${slug}].divisions div on db.division_lid = div.id 
            INNER JOIN [${slug}].initial_course_workload icw on div.course_lid = icw.id 
            INNER JOIN [dbo].event_types et on db.event_type_lid = et.id`)
        })
    }

    static addBatch(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('divisionId', sql.Int, body.divisionId)
            .input('batch', sql.Int, body.batch)
            .input('eventType', sql.Char, body.eventType)
            .input('divisionCount', sql.Int, body.divisionCount)
            .input('batchCount', sql.Int, body.batchCount)
            .input('inputBatchCount', sql.Int, body.inputBatchCount)
            .input('facultyCount', sql.SmallInt, body.facultyCount)
            .query(`INSERT INTO [${slug}].[division_batches] (division_id, batch, event_type, division_count, batch_count, input_batch_count, faculty_count) 
            values (@divisionId, @batch, @eventType, @divisionCount, @batchCount, @inputBatchCount, @facultyCount)`)
        })
    }

    static getBatch(id, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
            .query(`SELECT id, division_id, batch, event_type, division_count, batch_count, input_batch_count, faculty_count FROM [${slug}].division_batches WHERE id = @id`)
        })
    }

    static updateBatch(body, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, body.id)
            .input('divisionId', sql.Int, body.divisionId)
            .input('batch', sql.Int, body.batch)
            .input('eventType', sql.Char, body.eventType)
            .input('divisionCount', sql.Int, body.divisionCount)
            .input('batchCount', sql.Int, body.batchCount)
            .input('inputBatchCount', sql.Int, body.inputBatchCount)
            .input('facultyCount', sql.SmallInt, body.facultyCount)
            .query(`UPDATE [${slug}].division_batches SET division_id = @divisionId, batch = @batch, event_type =@eventType, division_count =@divisionCount,
            batch_count =@batchCount, input_batch_count =@inputBatchCount, faculty_count =@facultyCount WHERE id = @id`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request() 
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].division_batches`)
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

    
    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT db.id, db.division_lid, db.batch, db.event_type_lid, db.divison_count, db.batch_count, 
                db.input_batch_count, db.faculty_count, d.division, et.name FROM [${slug}].[division_batches] db
                INNER JOIN [${slug}].[divisions] d on d.id = db.division_lid
                INNER JOIN [dbo].[event_types] et on et.id = db.event_type_lid
                ORDER BY d.id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} db.id, db.division_lid, db.batch, db.event_type_lid, db.divison_count, db.batch_count, 
                db.input_batch_count, db.faculty_count, d.division, et.name FROM [${slug}].[division_batches] db
                INNER JOIN [${slug}].[divisions] d on d.id = db.division_lid
                INNER JOIN [dbo].[event_types] et on et.id = db.event_type_lid
                WHERE db.division_lid LIKE @keyword OR db.batch LIKE @keyword OR db.event_type_lid LIKE @keyword OR db.divison_count LIKE @keyword OR db.batch_count LIKE @keyword OR db.input_batch_count LIKE @keyword OR db.faculty_count LIKE @keyword OR d.division LIKE @keyword OR et.name LIKE @keyword ORDER BY d.id DESC`)
        })
    }

        //object, res.locals.slug, res.locals.userId
        static update(inputJson, slug, userId) {
            return poolConnection.then(pool => {
                return pool.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_division_batches]`)
            })
        }


        static fetchDistinctBatches(slug) {
            return poolConnection.then(pool => {
                return pool.request().query(`select DISTINCT batch from [${slug}].division_batches`)
            })
        }
}