module.exports = class CancellationReasons {
    constructor(typeOfCancellation, reasonText, sapId) {
        this.typeOfCancellation = typeOfCancellation;
        this.reasonText = reasonText;
        this.sapId = sapId;
    }
}