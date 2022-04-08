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
            return pool.request().query(`SELECT TOP ${Number(rowcount)} id, module_name, program_id, module_id, module_type_lid, intake, student_per_division, lec_per_week_per_division, practical_per_week_per_division, tutorial_per_week_per_division, workshop_per_week_per_division, continuous, session_events_per_semester, acad_session_lid, module_code
            FROM [${slug}].initial_course_workload ORDER BY id DESC`)
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
                .query(`SELECT id, module_name, program_id, module_id, electives, intake, student_per_division, lec_per_week_per_division, practical_per_week_per_division, tutorial_per_week_per_division, workshop_per_week_per_division, continuous, session_events_per_semester, acad_session_lid, last_changed, module_code
                FROM [${slug}].initial_course_workload ORDER BY id DESC  OFFSET (@pageNo - 1) * 10 ROWS FETCH NEXT 10 ROWS ONLY`)
        })
    }

    static search(rowcount, keyword, slug) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
                .query(`SELECT TOP ${Number(rowcount)} id, module_name, program_id, module_id, electives, intake, student_per_division, lec_per_week_per_division, 
                practical_per_week_per_division, tutorial_per_week_per_division, workshop_per_week_per_division, continuous, session_events_per_semester, 
                acad_session_lid, last_changed, module_code
                FROM [${slug}].initial_course_workload 
                WHERE module_name LIKE @keyword OR program_id LIKE @keyword OR electives LIKE @keyword OR intake LIKE @keyword OR student_per_division LIKE @keyword OR lec_per_week_per_division LIKE @keyword OR tutorial_per_week_per_division LIKE @keyword OR workshop_per_week_per_division LIKE @keyword OR continuous LIKE @keyword OR session_events_per_semester LIKE @keyword OR module_code LIKE @keyword ORDER BY id DESC`)
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


}