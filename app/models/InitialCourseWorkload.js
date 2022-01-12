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
}