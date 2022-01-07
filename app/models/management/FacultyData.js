module.exports = class FacultyData {
    constructor(faculty_name, faculty_id, campus_id, org_id, date, slot_id, is_booked, a_content_uuid, a_contents_id) {
        this.faculty_name = faculty_name;
        this.faculty_id = faculty_id;
        this.campus_id = campus_id;
        this.org_id = org_id;
        this.date = date;
        this.slot_id = slot_id;
        this.is_booked = is_booked;
        this.a_content_uuid = a.a_content_uuid;
        this.a_contents_id = a_contents_id;
    }
}