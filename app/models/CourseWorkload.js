const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = class {

    constructor(moduleName, programId, moduleId, acadSession, electives, intake, studentPerDivision, lecPerWeekPerDivision, practicalPerWeekPerDivision, tutorialPerWeekPerDivision, workshopPerWeekPerDivision, continuous, sessionPerSemester) {
        this.moduleName = moduleName;
        this.programId = programId;
        this.moduleId = moduleId;
        this.acadSession = acadSession;
        this.electives = electives;
        this.intake = intake;
        this.studentPerDivision = studentPerDivision;
        this.lecPerWeekPerDivision = lecPerWeekPerDivision;
        this.practicalPerWeekPerDivision = practicalPerWeekPerDivision;
        this.tutorialPerWeekPerDivision = tutorialPerWeekPerDivision;
        this.workshopPerWeekPerDivision = workshopPerWeekPerDivision;
        this.continuous = continuous;
        this.sessionPerSemester = sessionPerSemester;
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, module_name, program_id, module_id, intake, student_per_division, lecture_count_per_batch,practical_count_per_batch,tutorial_count_per_batch,workshop_count_per_batch, continuous, session_events_per_semester, acad_session_lid, module_code
            FROM [${slug}].initial_course_workload ORDER BY id DESC`)
        })
    }


    static getAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT icw.id, icw.module_name, icw.program_id, icw.module_id, intake, icw.student_per_division, icw.lecture_count_per_batch, icw.practical_count_per_batch, icw.tutorial_count_per_batch, icw.workshop_count_per_batch, icw.continuous, icw.session_events_per_semester, icw.acad_session_lid, icw.module_code, acads.acad_session, icw.module_type_lid, mt.name as module_type
            FROM [${slug}].initial_course_workload icw
            INNER JOIN [dbo].acad_sessions acads ON acads.id = icw.acad_session_lid
            LEFT JOIN [dbo].module_types mt ON mt.id = icw.module_type_lid
            ORDER BY id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].initial_course_workload`)
        })
    }

    static changeStatus(body, slug) {
        console.log(body, slug)
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('Id', sql.Int, body.id)
                .input('Status', sql.TinyInt, body.status)
                .query(`UPDATE [${slug}].initial_course_workload SET active = @Status WHERE id = @Id`)
        })
    }


    static pagination(pageNo, slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.input('pageNo', sql.Int, pageNo)
                .query(`SELECT  icw.id, icw.module_name, icw.program_id, icw.module_id, intake, icw.student_per_division, icw.lecture_count_per_batch, icw.practical_count_per_batch, icw.tutorial_count_per_batch, icw.workshop_count_per_batch, icw.continuous, icw.session_events_per_semester, icw.acad_session_lid, icw.module_code, acads.acad_session, icw.module_type_lid, mt.name as module_type
                FROM [${slug}].initial_course_workload icw
                INNER JOIN [dbo].acad_sessions acads ON acads.id = icw.acad_session_lid
                INNER JOIN [dbo].module_types mt ON mt.id = icw.module_type_lid
                ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} icw.id, icw.module_name, icw.program_id, icw.module_id, intake, icw.student_per_division, icw.lecture_count_per_batch, icw.practical_count_per_batch, icw.tutorial_count_per_batch, icw.workshop_count_per_batch, icw.continuous, icw.session_events_per_semester, icw.acad_session_lid, icw.module_code, acads.acad_session, icw.module_type_lid, mt.name as module_type
                FROM [${slug}].initial_course_workload icw
                INNER JOIN [dbo].acad_sessions acads ON acads.id = icw.acad_session_lid
                LEFT JOIN [dbo].module_types mt ON mt.id = icw.module_type_lid
                WHERE icw.module_name LIKE @keyword  OR icw.program_id LIKE @keyword OR icw.module_id LIKE @keyword OR icw.module_code LIKE  @keyword OR  acads.acad_session LIKE @keyword  OR mt.name LIKE @keyword
                ORDER BY id DESC`)
        })
    }


    static fetchCourseWorklaodSap(inputJson, userId, slug) {
        return poolConnection.then(pool => {
            return pool.request()
                .input('input_json', sql.NVarChar(sql.MAX), inputJson)
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_import_course_workload_sap]`)
        })
    }

    //object, res.locals.slug, res.locals.userId
    static update(inputJson, slug, userId) {
        console.log('JSON::::::::::::::::::>>', JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            return pool.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_update_initial_course_workload]`)
        })
    }


    static fetchAllWSDL(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select * from [${slug}].course_work_wsdl`)
        })
    }

    static fetchAllWSDLWithProgramName(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`select cww.id, cww.module_desc, cww.prog_code, cww.module_objid, p.program_name, cww.sess_desc from [${slug}].course_work_wsdl cww 
            INNER JOIN  [${slug}].programs p ON cww.prog_objid = p.program_id`)
        })
    }

    //object, res.locals.slug, res.locals.userId
    static create(inputJson, slug, userId) {
        console.log('Import Course::::::::::::::>',JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            return pool.request()
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
                .input('last_modified_by', sql.Int, userId)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${slug}].[sp_insert_initial_course_workload]`)
                
        })
    }
}