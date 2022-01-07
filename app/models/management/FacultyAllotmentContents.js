module.exports = class FacultyAllotmentContents {
    constructor(program_id, acad_year, acad_session, division, batch, event_name) {
        this.program_id = program_id;
        this.acad_year = acad_year;
        this.acad_session = acad_session;
        this.division = division;
        this.batch = batch;
        this.event_name = event_name;
    }
}