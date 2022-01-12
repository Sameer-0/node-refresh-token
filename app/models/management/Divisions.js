module.exports = class Divisions {
    constructor(courseId, division, divisionNum, divisionCount, status1, countForTheoryBatch, countForPracticalBatch, countForTutorialBatch, countForWorkshopBatch) {
        this.courseId = courseId;
        this.divisionNum = divisionNum;
        this.divisionCount = divisionCount;
        this.status1 = status1;
        this.countForPracticalBatch = countForPracticalBatch;
        this.countForTheoryBatch = countForTheoryBatch;
        this.division = division;
        this.countForTutorialBatch = countForTutorialBatch;
        this.countForWorkshopBatch = countForWorkshopBatch;
    }
}