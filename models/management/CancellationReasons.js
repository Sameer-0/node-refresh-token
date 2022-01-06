module.exports = class CancellationReasons {
    constructor(type_of_cancellation, reason_text, sap_id) {
        this.type_of_cancellation = type_of_cancellation;
        this.reason_text = reason_text;
        this.sap_id = sap_id;
    }
}