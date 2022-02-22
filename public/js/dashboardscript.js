            // Add more rows for orgnization
            $('#add-more-orgnization').on('click', function () {
                console.log("Organization Added::::")
                let lastTr = $('#add-more-org-table tbody tr:last-child')
                let orgId = lastTr.find(`select[name='orgId']`).val();
                let orgAbbr = lastTr.find(`select[name='orgAbbr']`).val();
                let orgName = lastTr.find(`select[name='orgName']`).val();
                let orgCompleteName = lastTr.find(`select[name='orgCompleteName']`).val();
                let orgType = lastTr.find(`select[name='orgType']`).val();

                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='orgId']`).val('')
                clonedTr.find(`input[name='orgAbbr']`).val('')
                clonedTr.find(`select[name='orgName']`).val('')
                clonedTr.find(`select[name='orgCompleteName']`).val('')
                clonedTr.find(`select[name='orgType']`).val(orgType).trigger('change');

                $('#add-more-org-table tbody').append(clonedTr)
            })

            $('#add-more-org-table').on('click', '.remove-organization', function () {
                let trLength = $('#add-more-org-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.') 
                }
            })

            //Add more rows for campus

            $('#add-more-campus').on('click', function () {
                console.log("Organization Added::::")

                let lastTr = $('#add-more-campus-table tbody tr:last-child')
                let campusId = lastTr.find(`select[name='campusId']`).val();
                let campusAbbr = lastTr.find(`select[name='campusAbbr']`).val();
                let campusName = lastTr.find(`select[name='campusName']`).val();
                let campusDesc = lastTr.find(`select[name='campusDesc']`).val();


                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='campusId']`).val('')
                clonedTr.find(`input[name='campusAbbr']`).val('')
                clonedTr.find(`select[name='campusName']`).val('')
                clonedTr.find(`select[name='campusDesc']`).val('')
                $('#add-more-campus-table tbody').append(clonedTr)
            })

            $('#add-more-campus-table').on('click', '.remove-campus', function () {
                let trLength = $('#add-more-campus-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows for building    

            $('#add-more-building').on('click', function () {
                console.log("Organization Added::::")
                let lastTr = $('#add-more-building-table tbody tr:last-child')
                let buildingName = lastTr.find(`select[name='buildingName']`).val();
                let buildingNumber = lastTr.find(`select[name='buildingNumber']`).val();
                let floors = lastTr.find(`select[name='floors']`).val();
                let ownerId = lastTr.find(`select[name='ownerId']`).val();
                let startTimeId = lastTr.find(`select[name='startTimeId']`).val();
                let endTimeId = lastTr.find(`select[name='endTimeId']`).val();
                let handledById = lastTr.find(`select[name='handledById']`).val();
                let campusId = lastTr.find(`select[name='campusId']`).val();


                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='buildingName']`).val('')
                clonedTr.find(`input[name='buildingNumber']`).val('')
                clonedTr.find(`select[name='floors']`).val('')
                clonedTr.find(`select[name='ownerId']`).val('')
                clonedTr.find(`select[name='startTimeId']`).val('')
                clonedTr.find(`select[name='endTimeId']`).val('')
                clonedTr.find(`select[name='handledById']`).val('')
                clonedTr.find(`select[name='campusId']`).val('')

                $('#add-more-building-table tbody').append(clonedTr)
            })

            $('#add-more-building-table').on('click', '.remove-building', function () {
                let trLength = $('#add-more-building-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows in room

            $('#add-more-room').on('click', function () {
                console.log("Room Added::::")
    
                let lastTr = $('#add-room-table tbody tr:last-child')
                // lastTr.find('.modalSelect2').select('destroy');
    
    
                let lastRoomType = lastTr.find(`select[name='roomType']`).val();
                let lastStartTime = lastTr.find(`select[name='startTime']`).val();
                let lastEndTime = lastTr.find(`select[name='endTime']`).val();
                let lastIsbasement = lastTr.find(`select[name='isBasement']`).val();
    
                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='roomNo']`).val('')
                clonedTr.find(`select[name='roomType']`).val(lastRoomType).trigger('change');
                clonedTr.find(`select[name='startTime']`).val(lastStartTime).trigger('change');
                clonedTr.find(`select[name='endTime']`).val(lastEndTime).trigger('change');
                clonedTr.find(`select[name='isBasement']`).val(lastIsbasement).trigger(
                    'change');
    
                $('#add-room-table tbody').append(clonedTr)
    
                lastTr.find('.modalSelect2').select({
                    dropdownParent: $('#add-room-modal')
                });
    
                clonedTr.find('.modalSelect2').select({
                    dropdownParent: $('#add-room-modal')
                });
            })
    
    
            $('#add-room-modal').on('click', '.remove-room', function () {
                let trLength = $('#add-room-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows in faculty