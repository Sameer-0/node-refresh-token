module.exports = class MasterRights {
    constructor(app_module_id, http_method_id, url_id, created_at, modified_at, status) {
        this.app_module_id = app_module_id;
        this.http_method_id = http_method_id;
        this.url_id = url_id;
        this.created_at = created_at;
        this.modified_at = modified_at;
        this.status = status;
    }
}