module.exports = class Buildings {
    constructor(building_name, building_number, total_floors, owner_id, handled_by, start_time, end_time, campus_id) {
        this.building_name = building_name;
        this.building_number = building_number;
        this.total_floors = total_floors;
        this.owner_id = owner_id;
        this.handled_by = handled_by;
        this.start_time = start_time;
        this.end_time = end_time;
        this.campus_id = campus_id;
    }
}