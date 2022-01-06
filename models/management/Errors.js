module.exports = class Errors {
    constructor(error_id, username, error_number, error_state, error_severity, error_line, error_procedure, error_msg, error_time) {
        this.error_id = error_id;
        this.username = username;
        this.error_number = error_number;
        this.error_state = error_state;
        this.error_severity = error_severity;
        this.error_line = error_line;
        this.error_procedure = error_procedure;
        this.error_msg = error_msg;
        this.error_time = error_time;
    }
}