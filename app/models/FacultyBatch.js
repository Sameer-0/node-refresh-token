const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const slug = require('../controllers/management/slug');

module.exports = class FacultyBatch {

    constructor(faculty_id, faculty_name, batch) {
        this.id = id;
        this.faculty_id = faculty_id;
        this.faculty_name = faculty_name;
        this.faculty_batch = batch;
    }

    static save(inputJSON, slug, userid) {
        console.log('JOSN:::::::::::::::', JSON.stringify(inputJSON))
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_add_faculty_batches]`)
        })
    }

    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fb.id, fb.faculty_lid, fb.batch_lid, f.faculty_name, f.faculty_id, db.batch
            FROM [${slug}].faculty_batches fb
            INNER JOIN [${slug}].[faculties] f ON fb.faculty_lid =  f.id       
			INNER JOIN [${slug}].[division_batches] db ON db.id = fb.batch_lid
            ORDER BY fb.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_batches`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} fb.id, fb.faculty_lid, fb.batch_lid, f.faculty_name, f.faculty_id, db.batch
                FROM [${slug}].faculty_batches fb
                INNER JOIN [${slug}].[faculties] f ON fb.faculty_lid =  f.id 
                INNER JOIN [${slug}].[division_batches] db ON db.id = fb.batch_lid
                WHERE  f.faculty_name LIKE @keyword OR  f.faculty_id LIKE @keyword OR fb.batch_lid LIKE @keyword
                ORDER BY fb.id DESC`)
        })
    }

    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  fb.id, fb.faculty_lid, fb.batch_lid, f.faculty_name, f.faculty_id, db.batch
                FROM [${slug}].faculty_batches fb
                INNER JOIN [${slug}].[faculties] f ON fb.faculty_lid =  f.id    
                INNER JOIN [${slug}].[division_batches] db ON db.id = fb.batch_lid     
                ORDER BY fb.id DESC OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static update(inputJSON, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJSON))
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_faculty_batches]`)
        })
    }

    static delete(id, slug, userid) {
        return poolConnection.then(pool => {
            const request = pool.request();
            return request.input('input_faculty_batch_lid', sql.Int, id)
                .input('last_modified_by', sql.Int, userid)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_delete_faculty_batches]`)
        })
    }

    static programByFacultyId(faculty_lid, slug) {
        return poolConnection.then(pool => { 
            let request = pool.request()
            return request.input('facultyLid', sql.Int, faculty_lid)
                .query(`SELECT DISTINCT p.id AS program_lid, p.program_name from [asmsoc-mum].faculty_works fw
                INNER JOIN [asmsoc-mum].program_sessions ps ON ps.id = fw.program_session_lid
                INNER JOIN [asmsoc-mum].programs p ON p.id = ps.program_lid
                WHERE fw.faculty_lid = @facultyLid`)
        })
    }


    static sessionByFacultyProgramId(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('program_lid', sql.Int, body.program_lid)
                .input('faculty_lid', sql.Int, body.faculty_lid)
                .query(`SELECT DISTINCT acds.id AS session_lid, acds.acad_session FROM [${slug}].faculty_works fw
                INNER JOIN [${slug}].program_sessions ps ON ps.id = fw.program_session_lid
                INNER JOIN [${slug}].programs p ON p.id = ps.program_lid
                INNER JOIN [dbo].acad_sessions acds ON acds.id = ps.acad_session_lid
                WHERE fw.faculty_lid = @faculty_lid AND p.id = @program_lid`)
        })
    }

    //Getting module name by faculty id, program id and session id
    static moduleNameByFaculty(body, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('program_lid', sql.Int, body.program_lid)
                .input('faculty_lid', sql.Int, body.faculty_lid)
                .input('session_lid', sql.Int, body.session_lid)
                .query(`select icw.id, icw.module_name from [${slug}].faculty_works fw INNER JOIN
                [${slug}].initial_course_workload icw ON icw.id = fw.module_lid
                where program_session_lid = (select id as program_session_lid from [${slug}].program_sessions where program_lid = @program_lid AND acad_session_lid = @session_lid) AND fw.faculty_lid = @faculty_lid`)
        })
    }

    static divisionByModuleId(module_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('module_lid', sql.Int, module_lid)
                .query(`select * from [${slug}].divisions where course_lid = @module_lid`)
        })
    }

    static batchByDivisionId(division_lid, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('division_lid', sql.Int, division_lid)
                .query(`select db.id, db.batch, et.name AS event_type from [${slug}].division_batches db
                INNER JOIN [dbo].event_types et ON et.id = db.event_type_lid
                where db.division_lid = @division_lid`)
        })
    }

    static  findFacultyBatchById(id, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request
            .input('Id', sql.Int, id)
                .query(`select * from [asmsoc-mum].faculty_batches where id = @Id`)
        })
    }

}