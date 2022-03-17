function ajaxApi(obj) {
    return $.ajax({
        type: obj.type,
        url: obj.url,
        data: obj.data,
        beforeSend: function () {
            // $('#image').show();
            $(".modal-loader").removeClass('d-none')
            console.log('Show beforeSend::::::::>')
        },
        complete: function () {
            $(".modal-loader").addClass('d-none')
            console.log('Show complete::::::::>')
        },
        success: data => {
            return data
        },
        showSuccess(result) {
            console.log('Show Succces::::::::>', result)
        },
        error: err => {
            return err
        },
        dataType: obj.dataType
    });
}