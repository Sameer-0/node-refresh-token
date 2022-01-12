module.exports = class Faculties {
    constructor(facultyId, facultyName, startTimeId, endTimeId, campusId, orgId) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.startTimeId = startTimeId;
        this.endTimeId = endTimeId;
        this.campusId = campusId;
        this.orgId = orgId;
    }
}