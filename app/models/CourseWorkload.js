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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, module_name, program_id, module_id, intake, student_per_division, lec_per_week_per_division, practical_per_week_per_division, tutorial_per_week_per_division, workshop_per_week_per_division, continuous, session_events_per_semester, acad_session_lid, module_code
            FROM [${slug}].initial_course_workload ORDER BY id DESC`)
        })
    }


    static getAll(slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT  icw.id, icw.module_name, icw.program_id, icw.module_id, intake, icw.student_per_division, icw.lec_per_week_per_division, icw.practical_per_week_per_division, icw.tutorial_per_week_per_division, icw.workshop_per_week_per_division, icw.continuous, icw.session_events_per_semester, icw.acad_session_lid, icw.module_code, acads.acad_session, icw.module_type_lid, mt.name as module_name
            FROM [${slug}].initial_course_workload icw
            INNER JOIN [dbo].acad_sessions acads ON acads.id = icw.acad_session_lid
            LEFT JOIN [${slug}].module_types mt ON mt.id = icw.module_type_lid
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
                .query(`SELECT  icw.id, icw.module_name, icw.program_id, icw.module_id, intake, icw.student_per_division, icw.lec_per_week_per_division, icw.practical_per_week_per_division, icw.tutorial_per_week_per_division, icw.workshop_per_week_per_division, icw.continuous, icw.session_events_per_semester, icw.acad_session_lid, icw.module_code, acads.acad_session, icw.module_type_lid, mt.name as module_name
                FROM [${slug}].initial_course_workload icw
                INNER JOIN [dbo].acad_sessions acads ON acads.id = icw.acad_session_lid
                INNER JOIN [${slug}].module_types mt ON mt.id = icw.module_type_lid
                ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT  icw.id, icw.module_name, icw.program_id, icw.module_id, intake, icw.student_per_division, icw.lec_per_week_per_division, icw.practical_per_week_per_division, icw.tutorial_per_week_per_division, icw.workshop_per_week_per_division, icw.continuous, icw.session_events_per_semester, icw.acad_session_lid, icw.module_code, acads.acad_session, icw.module_type_lid, mt.name as module_name
                FROM [${slug}].initial_course_workload icw
                INNER JOIN [dbo].acad_sessions acads ON acads.id = icw.acad_session_lid
                INNER JOIN [${slug}].module_types mt ON mt.id = icw.module_type_lid
                WHERE icw.module_name LIKE @keyword OR icw.program_id LIKE @keyword OR icw.module_id LIKE @keyword OR  icw.student_per_division LIKE @keyword OR icw.lec_per_week_per_division LIKE @keyword OR icw.practical_per_week_per_division LIKE @keyword OR icw.tutorial_per_week_per_division LIKE @keyword OR icw.workshop_per_week_per_division LIKE @keyword OR icw.continuous LIKE @keyword OR icw.session_events_per_semester LIKE @keyword OR icw.module_code LIKE @keyword OR acads.acad_session LIKE @keyword
                ORDER BY id DESC`)
        })
    }


    static fetchCourseWorklaodSap(inputJson, userId, slug) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('input_json', sql.NVarChar(sql.MAX), inputJson)
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_insert_course_work_wsdl]`)
        })
    }

//object, res.locals.slug, res.locals.userId
    static update(inputJson, slug, userId) {
        console.log('JSON::::::::::::::::::>>',JSON.stringify(inputJson))
        return poolConnection.then(pool => {
            return pool.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(inputJson))
            .input('last_modified_by', sql.Int, userId)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${slug}].[sp_update_course_workload]`)
        })
    }


}