module.exports = class DivisionBatches {
    constructor(division_id, batch, event_type, division_count, input_batch_count, faculty_count) {
        this.division_id = division_id;
        this.batch = batch;
        this.event_type = event_type;
        this.division_count = division_count;
        this.input_batch_count = input_batch_count;
        this.faculty_count = faculty_count;
    }
}