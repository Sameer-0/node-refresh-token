function ajaxApi(obj) {
    return $.ajax({
        type: obj.type,
        url: obj.url,
        data: obj.data,
        success: data => {
            return data
        },
        error: err => {
            return err
        },
        dataType: obj.dataType
    });
}