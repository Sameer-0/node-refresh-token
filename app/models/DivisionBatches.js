module.exports = class DivisionBatches {
    constructor(divisionId, batch, eventType, divisionCount, inputBatchCount, facultyCount) {
        this.divisionId = divisionId;
        this.batch = batch;
        this.eventType = eventType;
        this.divisionCount = divisionCount;
        this.inputBatchCount = inputBatchCount;
        this.facultyCount = facultyCount;
    }
}