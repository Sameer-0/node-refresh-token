

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

// Add more Course workload
// $('#add-more-courseWorkload').on('click', function () {
//     console.log("courseWorload Added::::")
//     let lastTr = $('#add-more-courseWorkload-table tbody tr:last-child')
//     let semester = lastTr.find(`input[name='semester']`).val();
//     let courseName = lastTr.find(`input[name='courseName']`).val();
//     let noOfDivisions = lastTr.find(`input[name='noOfDivisions']`).val();
//     let lecturePerDivision = lastTr.find(`input[name='lecturePerDivision']`).val();
//     let totalSessionPerSemester = lastTr.find(`input[name='totalSessionPerSemester']`).val();
//     let sessionPerWeek = lastTr.find(`input[name='sessionPerWeek']`).val();

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

//Add more session date

$('#add-more-sessionDate').on('click', function () {
    console.log("Session date Added::::")
    let lastTr = $('#add-more-sessionDate-table tbody tr:last-child')
    let programId= lastTr.find(`select[name='programName']`).val();
    let acadSessionID = lastTr.find(`select[name='acadSession']`).val();
    let startDateID = lastTr.find(`select[name='startDate']`).val();
    let endDateId = lastTr.find(`select[name='endDate']`).val();
    

    let clonedTr = lastTr.clone();
    // clonedTr.find(`select[name='programName']`).val('')
    // clonedTr.find(`input[name='courseName']`).val('')
    // clonedTr.find(`input[name='noOfDivisions']`).val('')
    // clonedTr.find(`input[name='lecturePerDivision']`).val('')
    // clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
    // clonedTr.find(`input[name='sessionPerWeek']`).val('')
    // clonedTr.find(`input[name='programId']`).val('')
    // clonedTr.find(`input[name='acadSession']`).val('')
    // clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
    $('#add-more-sessionDate-table tbody').append(clonedTr)
})

$('#add-more-sessionDate-table').on('click', '.remove-sessionDate', function () {
    console.log('sessiondatedelete')
    let trLength = $('#add-more-sessionDate-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove()
    } else {
        alert('Cannot delete this room.')
    }
})

//Add School Timing
$('#add-more-schoolTiming').on('click', function () {
    console.log("School Timing Added::::")
    let lastTr = $('#add-more-schoolTiming-table tbody tr:last-child')
    let name= lastTr.find(`input[name='schoolName']`).val();
    let programName = lastTr.find(`select[name='programName']`).val();
    let dayId = lastTr.find(`select[name='day']`).val();
    let acadSessionId = lastTr.find(`select[name='acadSession']`).val();
    let startTimeId = lastTr.find(`select[name='startTime']`).val();
    let endTimeId = lastTr.find(`select[name='endTime']`).val();
    let lectureTypeId = lastTr.find(`select[name='lecType']`).val();
    

    let clonedTr = lastTr.clone();
    // clonedTr.find(`select[name='programName']`).val('')
    // clonedTr.find(`input[name='courseName']`).val('')
    // clonedTr.find(`input[name='noOfDivisions']`).val('')
    // clonedTr.find(`input[name='lecturePerDivision']`).val('')
    // clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
    // clonedTr.find(`input[name='sessionPerWeek']`).val('')
    // clonedTr.find(`input[name='programId']`).val('')
    // clonedTr.find(`input[name='acadSession']`).val('')
    // clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
    $('#add-more-schoolTiming-table tbody').append(clonedTr)
})

$('#add-more-schoolTiming-table').on('click', '.remove-schoolTiming', function () {
    console.log('divison Delete')
    let trLength = $('#add-more-schoolTiming-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove();
    } else {
        alert('Cannot delete this room.')
    }
})