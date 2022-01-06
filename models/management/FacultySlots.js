module.exports = class FacultySlots {
    constructor(faculty_id, date, day_name, slot_id, campus_id, org_id, a_content_id) {
        this.faculty_id = faculty_id;
        this.date = date;
        this.day_name = day_name;
        this.slot_id = slot_id;
        this.campus_id = campus_id;
        this.org_id = org_id;
        this.a_content_id = a_content_id;
    }
}