module.exports = class Faculties {
    constructor(faculty_id, faculty_name, start_time_id, end_time_id, campus_id, org_id) {
        this.faculty_id = faculty_id;
        this.faculty_name = faculty_name;
        this.start_time_id = start_time_id;
        this.end_time_id = end_time_id;
        this.campus_id = campus_id;
        this.org_id = org_id;
    }
}