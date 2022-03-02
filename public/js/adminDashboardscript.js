// Add more rows for Days
console.log("Admin dashboard!!!!")
$('#add-more-days').on('click', function () {
    console.log("days Added::::")
    let lastTr = $('#add-more-days-table tbody tr:last-child')
    let startDate = lastTr.find(`select[name='startDate']`).val();
    let endDate = lastTr.find(`select[name='endDate']`).val();


    let clonedTr = lastTr.clone();
    clonedTr.find(`select[name='startDate']`).val('')
    clonedTr.find(`select[name='endDate']`).val('')
   
    $('#add-more-days-table tbody').append(clonedTr)
})

$('#add-more-days-table').on('click', '.remove-days', function () {
    let trLength = $('#add-more-days-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove()
    } else {
        alert('Cannot delete this room.')
    }
})

//Add more rows for holidays
$('#add-more-holidays').on('click', function () {
    console.log("holidays Added::::")
    let lastTr = $('#add-more-holidays-table tbody tr:last-child')
    let calendarId = lastTr.find(`input[name='calendarId']`).val();
    let calendarName = lastTr.find(`input[name='calendarName']`).val();
    let campusId = lastTr.find(`input[name='campusId']`).val();
    let calendarYear = lastTr.find(`input[name='calendarYear']`).val();
    let holidayDate = lastTr.find(`input[name='holidayDate']`).val();
    let holidayReason = lastTr.find(`input[name='holidayReason']`).val();


    let clonedTr = lastTr.clone();
    clonedTr.find(`input[name='calendarId']`).val('')
    clonedTr.find(`input[name='calendarName']`).val('')
    clonedTr.find(`input[name='campusId']`).val('')
    clonedTr.find(`input[name='calendarYear']`).val('')
    clonedTr.find(`input[name='holidayDate']`).val('')
    clonedTr.find(`input[name='holidayReason']`).val('')
    
   
    $('#add-more-holidays-table tbody').append(clonedTr)
})

$('#add-more-holidays-table').on('click', '.remove-holidays', function () {
    let trLength = $('#add-more-holidays-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove()
    } else {
        alert('Cannot delete this room.')
    }
})

//Add more room
$('#add-more-room').on('click', function () {
    console.log("Room Added::::")
    let lastTr = $('#add-more-room-table tbody tr:last-child')
    let roomNumber = lastTr.find(`input[name='roomNumber']`).val();
    let roomType = lastTr.find(`input[name='roomType']`).val();
    let campusId = lastTr.find(`input[name='campusId']`).val();
    let floor = lastTr.find(`input[name='floor']`).val();
    let capacity = lastTr.find(`input[name='capacity']`).val();
    let buildingName = lastTr.find(`input[name='buildingName']`).val();
    let buildingNumber = lastTr.find(`input[name='buildingNumber']`).val();
    let ownerId = lastTr.find(`select[name='ownerId']`).val();
    let handledById = lastTr.find(`select[name='handledById']`).val();


    let clonedTr = lastTr.clone();
    clonedTr.find(`input[name='roomNumber']`).val('')
    clonedTr.find(`input[name='roomType']`).val('')
    clonedTr.find(`input[name='campusId']`).val('')
    clonedTr.find(`input[name='floor']`).val('')
    clonedTr.find(`input[name='capacity']`).val('')
    clonedTr.find(`input[name='buildingName']`).val('')
    clonedTr.find(`input[name='buildingNumber']`).val('')
    clonedTr.find(`select[name='ownerId']`).val('')
    clonedTr.find(`select[name='handledById']`).val('')
    
   
    $('#add-more-room-table tbody').append(clonedTr)
})

$('#add-more-room-table').on('click', '.remove-room', function () {
    let trLength = $('#add-more-room-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove()
    } else {
        alert('Cannot delete this room.')
    }
})

//Add more program
// $('#add-more-program').on('click', function () {
//     console.log("program Added::::")
//     let lastTr = $('#add-more-program-table tbody tr:last-child')
//     let programId = lastTr.find(`input[name='programId']`).val();
//     let programName = lastTr.find(`input[name='programName']`).val();
   


//     let clonedTr = lastTr.clone();
//     clonedTr.find(`input[name='programId']`).val('')
//     clonedTr.find(`input[name='programName']`).val('')
   
   
//     $('#add-more-program-table tbody').append(clonedTr)
// })

// $('#add-more-program-table').on('click', '.remove-program', function () {
//     let trLength = $('#add-more-program-table tbody tr').length;
//     if (trLength > 1) {
//         $(this).closest('tr').remove()
//     } else {
//         alert('Cannot delete this room.')
//     }
// })

//Add more Course workload
// $('#add-more-courseWorkload').on('click', function () {
//     console.log("program Added::::")
//     let lastTr = $('#add-more-courseWorkload-table tbody tr:last-child')
//     let programId = lastTr.find(`input[name='semester']`).val();
//     let courseName = lastTr.find(`input[name='courseName']`).val();
//     let noOfDivisions = lastTr.find(`input[name='noOfDivisions']`).val();
//     let lecturePerDivision = lastTr.find(`input[name='lecturePerDivision']`).val();
//     let totalSessionPerSemester = lastTr.find(`input[name='totalSessionPerSemester']`).val();
//     let sessionPerWeek = lastTr.find(`input[name='sessionPerWeek']`).val();
//     let programId = lastTr.find(`input[name='programId']`).val();
//     let acadSession = lastTr.find(`input[name='acadSession']`).val();
//     let practicalPerWeekPerSession = lastTr.find(`input[name='practicalPerWeekPerSession']`).val();
   


//     let clonedTr = lastTr.clone();
//     clonedTr.find(`input[name='semester']`).val('')
//     clonedTr.find(`input[name='courseName']`).val('')
//     clonedTr.find(`input[name='noOfDivisions']`).val('')
//     clonedTr.find(`input[name='lecturePerDivision']`).val('')
//     clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
//     clonedTr.find(`input[name='sessionPerWeek']`).val('')
//     clonedTr.find(`input[name='programId']`).val('')
//     clonedTr.find(`input[name='acadSession']`).val('')
//     clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
//     $('#add-more-courseWorkload-table tbody').append(clonedTr)
// })

// $('#add-more-courseWorkload-table').on('click', '.remove-courseWorkload', function () {
//     let trLength = $('#add-more-courseWorkload-table tbody tr').length;
//     if (trLength > 1) {
//         $(this).closest('tr').remove()
//     } else {
//         alert('Cannot delete this room.')
//     }
// })

let element = document.querySelector('.div3');

element.addEventListener