const { pool } = require('mssql');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')


module.exports = class InitialCourseWorkload {
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

    static fetchAll() {
            return poolConnection.then(pool => {
                return pool.request().query(`select cw.id, cw.module_name, cw.program_id, cw.module_id, cw.acad_session_id, cw.electives, cw.intake, cw.student_per_division, cw.lec_per_week_per_division, cw.practical_per_week_per_division, cw.tutorial_per_week_per_division, cw.workshop_per_week_per_division,
                cw.continuous, cw.session_per_semester, cw.acad_session_id, cw.lec_per_week_per_batch, cw.practical_per_week_per_batch, cw.tutorial_per_week_per_batch, cw.workshop_per_week_per_batch from [bncp-mum].initial_course_workload cw`)
            })
    }
}