module.exports = class InitialCourseWorkload {
    constructor(module_name, program_id, module_id, acad_session, electives, intake, student_per_division, lec_per_week_per_division, practical_per_week_per_division, tutorial_per_week_per_division, workshop_per_week_per_division, continuous, session_per_semester) {
        this.module_name = module_name;
        this.program_id = program_id;
        this.module_id = module_id;
        this.acad_session = acad_session;
        this.electives = electives;
        this.intake = intake;
        this.student_per_division = student_per_division;
        this.lec_per_week_per_division = lec_per_week_per_division;
        this.practical_per_week_per_division = practical_per_week_per_division;
        this.tutorial_per_week_per_division = tutorial_per_week_per_division;
        this.workshop_per_week_per_division = workshop_per_week_per_division;
        this.continuous = continuous;
        this.session_per_semester = session_per_semester;
    }
}