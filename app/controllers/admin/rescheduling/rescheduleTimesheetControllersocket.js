
const sql = require('mssql')
const sanitizer = require('sanitize')();
const soap = require('soap');
const path = require('path');
const moment = require("moment");
const {
    writeFile
} = require("fs");
const axios = require('axios').default;
const https = require('https');
//const httpsAgent = new https.Agent({ rejectUnauthorized: false });
// const Mutex = require('async-mutex').Mutex;
// const Semaphore = require('async-mutex').Semaphore;
// const withTimeout = require('async-mutex').withTimeout;

const Bull = require('bull');
const queue = new Bull('rescheduling-queue');



const {
    poolConnection
} = require('../../../../config/db');
require('dotenv').config();


module.exports.respond = async socket => {

    let db = await poolConnection;
    db.on('error', err => {
        console.log(err)
    })

    //On Client Join
    socket.on('join', function (data) {
        console.log('RESCHEDULE SOCKET INIT:::::::::::>>>', data);
    });

    //On Drop Slot
    socket.on('drop', async function (data, dayasked, roomNo, thisSlotG, slug, tdTableId) {
        var sanitizedData = sanitizer.value(data, String);
        var sanitizedDayasked = sanitizer.value(dayasked, String)
        var roomNo = sanitizer.value(roomNo, String)
        var thisSlotG = sanitizer.value(thisSlotG, String)
        let rsbId = Number(tdTableId)
        let rsbEvent = sanitizedData.split('|')[0].trim()
        var slug = sanitizer.value(slug, String)

        console.log('sanitizedData: ', sanitizedData)
        console.log('sanitizedDayasked: ', sanitizedDayasked)
        console.log('roomNo: ', roomNo)
        console.log('thisSlotG: ', thisSlotG)
        console.log('rsbId: ', rsbId)
        console.log('rsbEvent: ', rsbEvent)
        console.log('slug: ', slug)

        let request = await db.request()

        let rsbData = await request.query(`SELECT COUNT(*) AS count FROM [${slug}].roomslotbookingnewt WHERE id = ${rsbId} AND eventName = '${rsbEvent}'`)

        let pivotedData = await request.query(`SELECT COUNT(*) AS count FROM [${slug}].dataPivoted WHERE id = ${rsbId} AND Orders = '${sanitizedData}'`)

        let rsbCount = rsbData.recordset[0].count;
        let pivotedCount = rsbData.recordset[0].count;


        console.log('rsbData: ', rsbData)
        console.log('pivotedData: ', pivotedData)

        if (rsbCount == 1 && pivotedCount == 1) {
            request.input('sanitizedData', sql.NVarChar, sanitizedData)
            request.input('sanitizedDayasked', sql.NVarChar(20), sanitizedDayasked)
            request.input('inputroomNo', sql.NVarChar(10), roomNo)

            request.execute(`[${slug}].dropSlotAndAddToPending24052021`, async (err, obj) => {
                if (err) throw err;

                let result = obj.recordsets

                //console.log("pendingList--->", result);
                //console.log("slotname--->", result[1][0].Orders);

                var dataToBeSent = {
                    pendinglist: result[0],
                    slotname: result[1][0].Orders,
                    thisSlotG: thisSlotG,
                    roomno: roomNo
                }

                console.log("Emitting value", dataToBeSent);
                global.io.emit('eventDropped', {
                    flag: 1,
                    data: dataToBeSent
                });

            })
        } else {
            console.log("Emitting value", 'unable to drop');
            global.io.emit('eventDropped', {
                flag: 0,
                message: 'Opps!!! This lecture has already been dropped by other user.'
            });
        }


    })

    //ON DRAWER OPEN
    socket.on('drawerOpen', async function (slug) {
        let request = await db.request();
        let sqlstmt = 'SELECT id, roomno, slot, slotAllotedFor, day, active, flag  FROM [' + slug + '].initial_pending_table ORDER BY id DESC'
        request.query(sqlstmt, async function (err, result) {
            if (err) {
                console.log(err)
            } else {
                let fetchedResult = await result.recordset
                socket.emit('drawerData', fetchedResult)
            }
        })
    })

    //SOCKET ALLOCATE SLOT

    socket.on('allocateSlot', async function (data) {
        let request = await db.request()
        let slug = sanitizer.value(data.slug, String);

        let toBeAllocated = sanitizer.value(data.toBeAllocated, String);
        let roomNo = sanitizer.value(data.selectedRoomno, String);
        let lecture = sanitizer.value(data.dataWithoutTime, String)
        let dayName = sanitizer.value(data.daySelected, String)
        let lectureWithTime = sanitizer.value(data.currentValue, String)
        let facultyCid = sanitizer.value(data.cid, String)
        let facultyName = sanitizer.value(data.facultyName, String)
        let slotName = data.slotName;
        let rsbId = Number(data.tdTableId)

        console.log('toBeAllocated ====>>> ', rsbId)

        let rsbData = await request.query(`SELECT COUNT(*) AS count FROM [${slug}].roomslotbookingnewt WHERE id = ${rsbId} AND isBooked = 'N'`)
        let pivotData = await request.query(`SELECT COUNT(*) AS count FROM [${slug}].dataPivoted WHERE id = ${rsbId} AND Orders LIKE '%Not Alloted%'`)

        let rsbCount = rsbData.recordset[0].count;
        let pivotedCount = rsbData.recordset[0].count;

        console.log('Rsb data ====>>> ', rsbCount)
        console.log('pivot data ====>>> ', pivotedCount)

        if (rsbCount == 1 && pivotedCount == 1) {

            request.input('inputToBeAllocated', sql.NVarChar, toBeAllocated)
            request.input('inputSlotName', sql.NVarChar(10), slotName)
            request.input('inputSanitizedDaySelected', sql.NVarChar(20), dayName)
            request.input('inputSanitizedDataWithoutTime', sql.NVarChar, lecture)
            request.input('inputFacultyNameOnly', sql.NVarChar(50), facultyName)
            request.input('inputSanitizedSelectedRoomno', sql.NVarChar(10), roomNo)
            request.input('inputCid', sql.NVarChar(10), facultyCid)
            request.input('inputSanitizedCurrentValue', sql.NVarChar, lectureWithTime)
            request.input('inputTdTableId', sql.NVarChar(10), rsbId)

            request.execute(`[${slug}].allocateSlotFromInitialPendingList`, async (err, obj) => {
                if (err) throw err;

                let result = obj.recordsets

                let returnedData = {
                    result6: result[0][0],
                    thisSlotG: data.thisSlotG,
                    rsbData: result[1][0],
                    dataCount: 1
                }

                console.log('Result: ', result)
                global.io.emit('allocateSlotEmit', {
                    status: 200,
                    message: "Slot Allocated",
                    data: returnedData,
                    flag: 1
                })
            })
        } else {
            global.io.emit('allocateSlotEmit', {
                status: 200,
                message: "Allocation failed!!! This slot has been already occupied.",
                flag: 0
            })
        }


    })

    //Manual Allocation Socket
    socket.on('allocateManually', async function (data) {

        let request = await db.request()
        let roomno = sanitizer.value(data.roomno, String)
        let slot = sanitizer.value(data.slot, String)
        let uModuleId = sanitizer.value(data.uModuleId, String)
        let selectedDayName = sanitizer.value(data.selectedDayName, String)
        let facultyId = sanitizer.value(data.facultyId, String)
        let slotName = sanitizer.value(data.slotName, String)
        let thisSlotG = sanitizer.value(data.thisSlotG, String)
        let slug = sanitizer.value(data.slug, String)
        let programId = Number(data.programId)

        console.log("==>>>> programId: ", programId)
        console.log("==>>>> slot: ", slot)
        console.log("==>>>> slotName: ", slotName)
        console.log("==>>>> thisSlotG : ", thisSlotG)
        console.log("==>>>> roomno : ", roomno)
        console.log("==>>>> uModuleId : ", uModuleId)
        console.log("==>>>> selectedDayName : ", selectedDayName)
        console.log("==>>>> facultyId : ", facultyId)



        if (roomno !== null && slot !== null && uModuleId !== null && selectedDayName !== null && facultyId !== null && slotName !== null) {
            let stmt = "select id, roomno, Employee, Orders, dayname, active, status, updated_on from [" + slug + "].dataPivoted where dayname ='" + selectedDayName + "' and roomno='" + roomno + "' and Employee ='" + slot + "'"

            request.query(stmt, async function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    let rowsAffected = await result.rowsAffected[0]
                    console.log(rowsAffected)
                    if (rowsAffected > 0) {


                        request.output('outputValue', sql.Int)
                        request.input('roomno', sql.NVarChar(10), roomno)
                        request.input('slot', sql.NVarChar(10), slot)
                        request.input('programId', sql.Int, programId)
                        request.input('uModuleId', sql.NVarChar(20), uModuleId)
                        request.input('selectedDayName', sql.NVarChar(20), selectedDayName)
                        request.input('facultyId', sql.NVarChar(20), facultyId)

                        request.execute('[' + slug + '].manualSlotAllocation', async function (err, result) {
                            if (err) {
                                console.log(err)
                            } else {
                                let output = await result.output.outputValue;

                                if (output == 1) {
                                    let stmt = "select Orders from [" + slug + "].dataPivoted where dayname ='" + selectedDayName + "' and roomno='" + roomno + "' and Employee ='" + slot + "'"
                                    request.query(stmt, async function (err, result) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            let fetchedResult = await result.recordset[0].Orders
                                            global.io.emit('emitSlotName', {
                                                fetchedResult,
                                                roomno,
                                                thisSlotG
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })

    //Socket Change Faculty
    socket.on('saveChangedFaculty', async function (data) {
        let request = await db.request()
        console.log("EMITTED DATA------------>", data)

        let slotData = sanitizer.value(data.slotData, String);
        let dayName = sanitizer.value(data.dayName, String);
        let cId = Number(sanitizer.value(data.cId, String));
        let slug = (sanitizer.value(data.slug, String));

        request.input('slotData', sql.NVarChar(1000), slotData);
        request.input('dayName', sql.NVarChar(20), dayName);
        request.input('facultyLiteralId', sql.Int, cId);
        request.output('outputRoomNo', sql.NVarChar(10));
        request.output('outputSlot', sql.NVarChar(20));
        request.output('outputDay', sql.NVarChar(20));
        request.output('outputOrders', sql.NVarChar(1000));
        request.output('outputFacultyId', sql.NVarChar(20));
        request.output('outputValue', sql.Int);

        console.log("slotData===>> ", slotData)
        console.log("dayName===>> ", dayName)
        console.log("cId===>> ", cId)

        request.execute(`[${slug}].updateFacultyDirectly03042021`, async function (err, result) {
            if (err) {
                console.log(err)
            } else {
                let outputValue = await result.output;
                console.log("Output Value: ", outputValue);
                if (outputValue.outputValue === 1) {
                    global.io.emit("saveChangedFacultyEmit", {
                        roomNo: outputValue.outputRoomNo,
                        slot: outputValue.outputSlot,
                        dayName: outputValue.outputDay,
                        facultyId: outputValue.outputFacultyId,
                        slotData: outputValue.outputOrders,
                        thisSlotG: data.thisSlotG
                    })
                }
            }
        })

    })

    //dropEventedSlot
    socket.on('cancelEventedSlot', async function (data) {
        console.log(">>>>>> cancelEventedSlot received by socket")
        // const job = await queue.add({
        //     task: "cancelEventedSlot",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();

        let socketUser = data.socketUser;
        let resObj = data.resObj

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`
        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapFromDate,
                    ZtimeFrom: resObj.sapFromStartTime,
                    ZtimeTo: resObj.sapFromEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.fromRoom,
                    OldZroomId: "",
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.fromFacultyId,
                    OldZfacultyId: "",
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: "",
                    OldZtimeFrom: "",
                    OldZtimeTo: "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                },

            }
        }

        console.log('rescheduleObj: ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //insert into reschedule transactiopn table
        let stmt = `INSERT INTO [${data.slugName}].reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]


                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                console.log("stmtLastTrans>>>> ", stmtLastTrans);

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here
                if (!recordset) {
                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate
                    })

                    return resolve(sapResult);
                }

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${recordset.event_name}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '${recordset.room_no}', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${recordset.day}', '${recordset.event_id}', ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`
                console.log('insertStmt:===>>> ', insertStmt)
                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })
                //update faculty_timetable
                if (sapResult.Status == 'success') {
                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0, sap_flag = '${sapResult.Zflag}' WHERE date_str = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.ZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`
                    console.log('updateFtStmt: ', updateFtStmt)

                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate
                    })
                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate
                    })
                }
                resolve(sapResult);
            })
        })




    })

    socket.on('cancelEventedSlotCae', async function (data) {
        // const job = await queue.add({
        //     task: "cancelEventedSlotCae",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlotCae <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser::::::::::::::::::::::::::::::::::>>>>> ', socketUser)
        let resObj = data.resObj

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`
        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        //console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapFromDate,
                    ZtimeFrom: resObj.sapFromStartTime,
                    ZtimeTo: resObj.sapFromEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: resObj.sapToStartTime,
                    OldZtimeTo: resObj.sapToEndTime,
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                },

            }
        }

        console.log('rescheduleObj: ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //     //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, cancelled_against, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, ${Number(resObj.lecLid)}, is_adjusted_cancel FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                if (!recordset) {
                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.OldZroomId,
                        inputDate: resObj.fromDate
                    })

                    return resolve(sapResult);
                }

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, cancelled_against, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${recordset.event_name}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.OldZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.OldZroomId}' AND active = 'Y'), '${sapResult.OldZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${recordset.day}', '${recordset.event_id}', ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.cancelled_against)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0, sap_flag = '${sapResult.Zflag}' WHERE date_str = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.OldZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)

                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    let updateFtStmt2 = `UPDATE faculty_timetable SET is_adjusted_cancel = 1 WHERE id = ${Number(resObj.lecLid)}`

                    console.log('updateFtStmt: ', updateFtStmt2)

                    await request.query(updateFtStmt2).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })



                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.OldZroomId,
                        inputDate: resObj.fromDate
                    })


                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.OldZroomId,
                        inputDate: resObj.fromDate
                    })
                }

                resolve(sapResult);
            })

        })
    })

    //cancelEventedSlotBulk
    socket.on("cancelEventedSlotBulk", async data => {
        // const job = await queue.add({
        //     task: "cancelEventedSlotBulk",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>> BULK CANCEL<<<<<<<<<<<<<<<', data)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlotBulk <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

    

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");

        // poolConnection.then(pool=>{
        //     pool.request().execute()
        // }).then(rusult=>{

        // })
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .input('zFlag', sql.NVarChar(1), resObj.reschFlag)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('bulk_cancel_start')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.room_uid,
                    OldZroomId: "",
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: 'THEO',
                    ZfacultyId: lecture.faculty_id,
                    OldZfacultyId: "",
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: "",
                    OldZtimeFrom: "",
                    OldZtimeTo: "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)

            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;
                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                    let sapResult = await result.EtReturn.item;
                    resolve(sapResult);
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))


            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_bulk_cancel_start');

                console.log(updatedTimetableData)

                global.io.emit("bulkCancelled", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })
            } else {
                global.io.emit("bulkCancelled", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }

        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

    })

    //Reschedule Evented Slots
    socket.on("rescheduleEventedSlot", async function (data) {
        // const job = await queue.add({
        //     task: "rescheduleEventedSlot",
        //     reschData: data
        // });
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> rescheduleEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)
        let resObj = data.resObj

        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate,
                    OldZtimeFrom: resObj.sapFromStartTime,
                    OldZtimeTo: resObj.sapFromEndTime,
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                if (!recordset) {
                    console.log(">>>>>>>>>>> SHOULD BE FAILED.")
                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })

                    return resolve(sapResult);
                }

                let newEventName;
                await request.query(`SELECT CONCAT(REVERSE(SUBSTRING(REVERSE(event_name), PATINDEX('%-%', REVERSE(event_name)), DATALENGTH(event_name))), ' (', (SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE facultyId = '${sapResult.ZfacultyId}'),')') AS newEventName FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`).then(result => {
                    newEventName = result.recordset[0].newEventName;
                }).catch(err => {
                    throw err;
                })

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${newEventName}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0 WHERE date_str = '${moment(sapResult.OldZdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.OldZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.OldZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.OldZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)

                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    let insertFtStmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ((SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}'), ${sapResult.ZfacultyId}, '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), (SELECT IIF(LEN(slotName) = 6, RIGHT(slotName, 2), RIGHT(slotName, 1)) FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', ${Number(sapResult.Zyear)}, '${newEventName}', '${recordset.event_abbr}', 'A', '${sapResult.ZBuseve}', '${sapResult.Zflag}', '${sapResult.StatusRemark}', 'TH', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}', '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}', 1, (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                    console.log('insertFtStmt: ', insertFtStmt)

                    await request.query(insertFtStmt).then(result => {
                        console.log('>>>>>>>>Inserted into faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    let newSlotJson = {};

                    newSlotJson.uuid = recordset.uuid;
                    newSlotJson.starttime = moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.endtime = moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.isBooked = "Y";
                    newSlotJson.bookedProgramId = sapResult.ZPrgstd;
                    newSlotJson.bookedAcadYear = sapResult.Zyear;
                    newSlotJson.bookedAcadSession = recordset.acad_session;
                    newSlotJson.bookedDiv = recordset.division;
                    newSlotJson.eventName = resObj.newEventName;
                    newSlotJson.eventId = resObj.newEventId;
                    newSlotJson.sapEventId = sapResult.ZBuseve;
                    newSlotJson.createdType = "A";
                    newSlotJson.facultyId = sapResult.ZfacultyId;
                    newSlotJson.eventType = recordset.event_type;
                    newSlotJson.uniqueIdForSAP = recordset.unique_id_for_sap;
                    newSlotJson.sapFlag = sapResult.Zflag;
                    newSlotJson.remark = sapResult.Status;
                    newSlotJson.remarkType = sapResult.StatusRemark;

                    console.log('newSlotJson:======>>>>>>  ', newSlotJson)

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: newSlotJson
                    })




                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                }

                resolve(sapResult);

            })
        })
    })

    //Modify Evented Slot
    socket.on("modifyEventedSlot", async function (data) {
        // const job = await queue.add({
        //     task: "modifyEventedSlot",
        //     reschData: data
        // });


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> modifyEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')


        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)
        let resObj = data.resObj

        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate,
                    OldZtimeFrom: resObj.sapFromStartTime,
                    OldZtimeTo: resObj.sapFromEndTime,
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel  FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];

                //condition if empty array return here

                if (!recordset) {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>> SHOULD BE FAILED")

                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })

                    return resolve(sapResult);
                }


                let newEventName;
                await request.query(`SELECT CONCAT(REVERSE(SUBSTRING(REVERSE(event_name), PATINDEX('%-%', REVERSE(event_name)), DATALENGTH(event_name))), ' (', (SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE facultyId = '${sapResult.ZfacultyId}'),')') AS newEventName FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`).then(result => {
                    newEventName = result.recordset[0].newEventName;
                }).catch(err => {
                    console.log(err);
                })

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${newEventName}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0 WHERE date_str = '${moment(sapResult.OldZdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.OldZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.OldZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.OldZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)



                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    let insertFtStmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ((SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}'), ${sapResult.ZfacultyId}, '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), (SELECT IIF(LEN(slotName) = 6, RIGHT(slotName, 2), RIGHT(slotName, 1)) FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', ${Number(sapResult.Zyear)}, '${newEventName}', '${recordset.event_abbr}', 'A', '${sapResult.ZBuseve}', '${sapResult.Zflag}', '${sapResult.StatusRemark}', 'TH', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}', '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}', 1, (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                    console.log('insertFtStmt: ', insertFtStmt)

                    await request.query(insertFtStmt).then(result => {
                        console.log('>>>>>>>>Inserted into faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })



                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })

                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                }

                resolve(sapResult);

            })
        })


    })

    //Bulk Modify Evented Slot
    socket.on("bulkModifyEventedSlot", async data => {
        // const job = await queue.add({
        //     task: "bulkModifyEventedSlot",
        //     reschData: data
        // });


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> bulkModifyEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<');

        let request = await db.request();

        console.log('>>>>>>>>>>>>>>BULK MODIFY REPLACE FACULTY<<<<<<<<<<<<<<<');

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client);
            })
        });

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        //lecTransObj = '[{"id":"18303","date":"02/06/2021","slot":"slot2","room":"701","newDate":"02/06/2021","newSlot":"slot2","newRoom":"701"},{"id":"18304","date":"07/06/2021","slot":"slot1","room":"701","newDate":"07/06/2021","newSlot":"slot1","newRoom":"701"},{"id":"18305","date":"07/06/2021","slot":"slot2","room":"701","newDate":"07/06/2021","newSlot":"slot2","newRoom":"701"},{"id":"18306","date":"08/06/2021","slot":"slot2","room":"701","newDate":"08/06/2021","newSlot":"slot5","newRoom":"701"},{"id":"18307","date":"09/06/2021","slot":"slot2","room":"701","newDate":"09/06/2021","newSlot":"slot2","newRoom":"701"}]'

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('insert_bulk_transaction')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                console.log("date: ", lecture.date_str)
                console.log("DATE : ", moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"))

                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.new_date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.new_start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.new_end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.new_room_uid,
                    OldZroomId: lecture.room_uid,
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: lecture.event_type,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: lecture.faculty_id,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    OldZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)


            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;

                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                    let sapResult = await result.EtReturn.item

                    resolve(sapResult)
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))

            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_insert_bulk_transaction');

                console.log(updatedTimetableData)

                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })

            } else {
                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }

        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

    })

    //faculty check for bulk modify
    socket.on('facultyAvailabilityCheck', async (facultyArg, roomArg) => {

        console.log('facultyAvailabilityCheck DATA::::::::::::::::', facultyArg, roomArg) 


        let facultyData = await facultyArg;
        let roomData = await roomArg;

        console.log('>>>>>>>>>>>>>>CHECK FACULTY AVAILABILITY<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zapi_faculty_availability_bin_sep_20220509.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });

        let facultyParam = {
            ResourceType: facultyData.facultyType,
            ResourceId: facultyData.facultyId,
            StartDate: facultyData.startDate,
            EndDate: facultyData.endDate,
            StartTime:  moment(facultyData.startTime, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: moment(facultyData.endTime, 'hh:mm:ss A').format('HH:mm:ss'),
        }

        let roomParam = {
            ResourceType: 'G',
            ResourceId: roomData.roomAbbr,
            StartDate: roomData.startDate,
            EndDate: roomData.endDate,
            StartTime:  moment(roomData.startTime, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: moment(roomData.endTime, 'hh:mm:ss A').format('HH:mm:ss'),
        }
         
        
        let sapFacultyResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(facultyParam, async (err, result) => {
            
                if (err) throw err;
                try{
                
                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<',result)
                let sapResult = await result.EtResoAvaiInfo
                console.log('sapResult EtResoAvaiInfo: ', sapResult)
                if (!sapResult) {
                    sapResult = [];
                } else {
                    sapResult = sapResult.item

                    for (let item of sapResult) {
                        item.EventDate = moment(item.EventDate, 'YYYY-MM-DD').format("DD/MM/YYYY")
                        item.StartTime = moment(item.StartTime, 'HH:mm:ss').format('hh:mm:ss A')
                        item.EndTime = moment(item.EndTime, 'HH:mm:ss').format('hh:mm:ss A')
                    }
                }
                resolve({status:200, data: sapResult})
            }
            catch(error){
                console.log('error:::::::::',error)
                reject({status:500, data: []})
            }
            })
        })

        let sapRoomResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(roomParam, async (err, result) => {
            
                if (err) throw err;
                try{
                
                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<', result)
                let sapResult = await result.EtResoAvaiInfo
                console.log('sapResult EtResoAvaiInfo: ', sapResult)
                if (!sapResult) {
                    sapResult = [];
                } else {
                    sapResult = sapResult.item

                    for (let item of sapResult) {
                        item.EventDate = moment(item.EventDate, 'YYYY-MM-DD').format("DD/MM/YYYY")
                        item.StartTime = moment(item.StartTime, 'HH:mm:ss').format('hh:mm:ss A')
                        item.EndTime = moment(item.EndTime, 'HH:mm:ss').format('hh:mm:ss A')
                    }
                }
                resolve({status:200, data: sapResult})
            }
            catch(error){
                console.log('error:::::::::',error)
                reject({status:500, data: []})
            }
            })
        })

        console.log('>>>>>>>>>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<<<<<')
        console.log('sapResult::::::::::::::::::::>>>>>>',sapFacultyResult)
        socket.emit('facultyRoomAvlList', sapFacultyResult, sapRoomResult)
        socket.broadcast.emit('facultyRoomAvlList',sapFacultyResult, sapRoomResult)
    })

    socket.on("changeTimetable", async data => {
        // const job = await queue.add({
        //     task: "changeTimetable",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> changeTimetable <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();

        console.log('>>>>>>>>>>>>>>CHANGE OF TIMETABLE<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('change_timetable')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                console.log("date: ", lecture.date_str)
                console.log("DATE : ", moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"))

                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.new_date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.new_start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.new_end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.new_room_uid,
                    OldZroomId: lecture.room_uid,
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: lecture.event_type,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: lecture.faculty_id,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    OldZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)


            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;
                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                    let sapResult = await result.EtReturn.item;
                    resolve(sapResult);
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))


            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_change_timetable');

                console.log(updatedTimetableData)

                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })
            } else {
                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }



        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

    })

    //Extra Class
    socket.on("scheduleExtraClass", async function (data) {
        // const job = await queue.add({
        //     task: "scheduleExtraClass",
        //     reschData: data
        // });


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> scheduleExtraClass <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

        let resObj = data.resObj
        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'

        if (resObj.fromStartTime)
            resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromEndTime)
            resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromDate)
            resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })


        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate ? resObj.sapFromDate : "",
                    OldZtimeFrom: resObj.sapFromStartTime ? resObj.sapFromStartTime : "",
                    OldZtimeTo: resObj.sapFromEndTime ? resObj.sapFromEndTime : "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });

        //insert into reschedule transactiopn/faculty_timetable table

        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
        SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel FROM reschedule_transaction WHERE id = ${Number(resObj.transLid)}`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                let newEventName;
                await request.query(`SELECT CONCAT(REVERSE(SUBSTRING(REVERSE(event_name), PATINDEX('%-%', REVERSE(event_name)), DATALENGTH(event_name))), ' (', (SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE facultyId = '${sapResult.ZfacultyId}'),')') AS newEventName FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`).then(result => {
                    newEventName = result.recordset[0].newEventName;
                }).catch(err => {
                    throw err;
                })

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES (
                        '${recordset.transaction_id}', 
                        '${sapResult.Zflag}', 
                        '${sapResult.ZBuseve}', 
                        '${newEventName}', 
                        '${recordset.event_abbr}', 
                        '${recordset.event_type}', 
                        '${sapResult.ZPrgstd}',
                        (SELECT programCode FROM [asmsoc-mum].programName WHERE active = 'Y' AND programId = '${sapResult.ZPrgstd}'),
                        '${sapResult.ZModule}', 
                        (SELECT module_code FROM [asmsoc-mum].course_work WHERE programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}' AND acadSession = '${recordset.acad_session}'),
                        '${recordset.division}', 
                        '${recordset.acad_session}', 
                        '${sapResult.ZfacultyId}', 
                        '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', 
                        (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), 
                        '${sapResult.ZroomId}', 
                        (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), 
                        '${sapResult.Zyear}', 
                        ${Number(sapResult.ReasonId)}, 
                        '${sapResult.ReasonDetail}', 
                        '${sapResult.Status}', 
                        '${sapResult.StatusRemark}', 
                        ${recordset.unique_id_for_sap}, 
                        '${recordset.uuid}', 
                        (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), 
                        (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', 
                        (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let insertFtStmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ((SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}'), '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), 
                        (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), 
                        '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1),
                        (SELECT IIF(LEN(slotName) = 6, RIGHT(slotName, 2), RIGHT(slotName, 1)) FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), 
                        '${sapResult.ZPrgstd}',
                        (SELECT programCode FROM [asmsoc-mum].programName WHERE active = 'Y' AND programId = '${sapResult.ZPrgstd}'),
                        '${sapResult.ZModule}',
                        (SELECT module_code FROM [asmsoc-mum].course_work WHERE programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}' AND acadSession = '${recordset.acad_session}'),
                        '${recordset.division}', '${recordset.acad_session}', ${Number(sapResult.Zyear)}, '${newEventName}', '${recordset.event_abbr}', 'A', '${sapResult.ZBuseve}', '${sapResult.Zflag}', '${sapResult.StatusRemark}', 'TH', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}', '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}', 1, (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                    console.log('insertFtStmt: ', insertFtStmt)

                    await request.query(insertFtStmt).then(result => {
                        console.log('>>>>>>>>Inserted into faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    //UPDATE THE NEW Slot of timesheet07042020 TABLE

                    let newSlotJson = {};

                    newSlotJson.uuid = recordset.uuid;
                    newSlotJson.starttime = moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.endtime = moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.isBooked = "Y";
                    newSlotJson.bookedProgramId = sapResult.ZPrgstd;
                    newSlotJson.bookedAcadYear = sapResult.Zyear;
                    newSlotJson.bookedAcadSession = recordset.acad_session;
                    newSlotJson.bookedDiv = recordset.division;
                    newSlotJson.eventName = newEventName;
                    newSlotJson.eventId = recordset.event_id;
                    newSlotJson.sapEventId = sapResult.ZBuseve;
                    newSlotJson.createdType = "A";
                    newSlotJson.facultyId = sapResult.ZfacultyId;
                    newSlotJson.eventType = recordset.event_type;
                    newSlotJson.uniqueIdForSAP = recordset.unique_id_for_sap;
                    newSlotJson.sapFlag = sapResult.Zflag;
                    newSlotJson.remark = sapResult.Status;
                    newSlotJson.remarkType = sapResult.StatusRemark;

                    console.log('newSlotJson:======>>>>>>  ', newSlotJson)


                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.toDate,
                        slotDetail: newSlotJson
                    })

                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                }

                resolve(sapResult);

            })

        })


    })

    //Extra Class new
    socket.on("scheduleExtraClassNew", async data => {
        // const job = await queue.add({
        //     task: "scheduleExtraClassNew",
        //     reschData: data
        // });
        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

        let resObj = data.resObj

        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'

        if (resObj.fromStartTime)
            resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromEndTime)
            resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromDate)
            resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate ? resObj.sapFromDate : "",
                    OldZtimeFrom: resObj.sapFromStartTime ? resObj.sapFromStartTime : "",
                    OldZtimeTo: resObj.sapFromEndTime ? resObj.sapFromEndTime : "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");

        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let lastInsertedId;
        let stmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, is_new_ec) Output Inserted.id VALUES (
                    '${resObj.toFacultyName}',
                    '${resObj.toFacultyId}',
                    '${resObj.toDate}',
                    (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${resObj.toDate}'),
                    (SELECT roomno FROM [asmsoc-mum].room_data WHERE active = 'Y' AND room_uid = '${resObj.toRoom}'),
                    '${resObj.toRoom}',
                    '${resObj.toSlot}',
                    ${resObj.toSlot.split('t')[1]},
                    '${resObj.programId}',
                    (SELECT programCode FROM [asmsoc-mum].programName WHERE active = 'Y' AND programId = '${resObj.programId}'),
                    '${resObj.moduleId}',
                    (SELECT module_code FROM [asmsoc-mum].course_work WHERE programId = '${resObj.programId}' AND moduleId = '${resObj.moduleId}' AND acadSession = '${resObj.acadSession}'),
                    '${resObj.division}',
                    '${resObj.acadSession}',
                    '${resObj.acadYear}',
                    '${resObj.newEventName}',
                    '${resObj.eventAbbr}',
                    'A',
                    '${resObj.sapEventId}',
                    '${resObj.reschFlag}',
                    'initiated',
                    '${resObj.eventType == 'THEO' ? 'TH' : 'PR'}',
                    '${resObj.uniqueIdForSap}',
                    NEWID(),
                    '${resObj.toStartTime}',
                    '${resObj.toEndTime}',
                    0,
                    '${resObj.newEventId}',
                    1
                    )`


        console.log('add new lecture ==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
            lastInsertedId = result.recordset[0].id
        }).catch(err => {
            console.log(err)
        })

        console.log('lastInsertedId=======>>> ', lastInsertedId)
        console.log(`UPDATE faculty_timetable SET unx_lid = ${lastInsertedId} WHERE id = ${lastInsertedId}`)

        await request.query(`UPDATE faculty_timetable SET unx_lid = ${lastInsertedId} WHERE id = ${lastInsertedId}`).catch(err => {
            console.log(err)
        })


        //insert into reschedule transactiopn table
        let stmtRes = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
            SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec,is_adjusted_cancel FROM faculty_timetable WHERE id = ${lastInsertedId}`

        console.log('stmtRes==>> ', stmtRes)

        await request.query(stmtRes).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) reject(err);

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')

                //console.log("Returned result from sap: ", result)
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]
                console.log('sapResult Suraj::::::::::::::::::::::::::>>>>>>', sapResult)

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];

                console.log('recordset::::>>>> ', recordset)
                //condition if empty array return here


                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${resObj.newEventName}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), '${resObj.newEventId}', ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {


                    await request.query(`UPDATE faculty_timetable SET active = 1, sap_remark = '${sapResult.StatusRemark}' WHERE id = ${lastInsertedId}`).catch(err => {
                        console.log(err)
                    })


                    let newSlotJson = {};

                    newSlotJson.uuid = recordset.uuid;
                    newSlotJson.starttime = moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.endtime = moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.isBooked = "Y";
                    newSlotJson.bookedProgramId = sapResult.ZPrgstd;
                    newSlotJson.bookedAcadYear = sapResult.Zyear;
                    newSlotJson.bookedAcadSession = recordset.acad_session;
                    newSlotJson.bookedDiv = recordset.division;
                    newSlotJson.eventName = resObj.newEventName;
                    newSlotJson.eventId = resObj.newEventId;
                    newSlotJson.sapEventId = sapResult.ZBuseve;
                    newSlotJson.createdType = "A";
                    newSlotJson.facultyId = sapResult.ZfacultyId;
                    newSlotJson.eventType = recordset.event_type;
                    newSlotJson.uniqueIdForSAP = recordset.unique_id_for_sap;
                    newSlotJson.sapFlag = sapResult.Zflag;
                    newSlotJson.remark = sapResult.Status;
                    newSlotJson.remarkType = sapResult.StatusRemark;

                    console.log('newSlotJson:======>>>>>>  ', newSlotJson)


                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.toDate,
                        slotDetail: newSlotJson
                    })

                    console.log('>>>>>> CALLING sendToLms FUNCTION')
                    sendToLms({
                        data: sapResult
                    });


                    console.log('========================>>>>EMITTED<<<<====================================')

                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                    console.log('========================>>>>EMITTED failed<<<<====================================')
                }

                resolve(sapResult);

            })

        })
    })


    socket.on("dropAndModify", async function (data) {
        let request = await db.request()
        console.log("Reschedule evented Slot", data)

        let slotUuid = sanitizer.value(data.slotUuid, String);
        let uuid = sanitizer.value(data.uuid, String);
        let inputDate = sanitizer.value(data.inputDate, String);
        let roomNo = sanitizer.value(data.roomNo, String);
        let slotName = sanitizer.value(data.slotName, String);
        let facultyId = sanitizer.value(data.facultyId, String);
        let slugName = sanitizer.value(data.slugName, String);
        let tdData = sanitizer.value(data.tdData, String);

        request.input('slotUuid', sql.NVarChar(1000), slotUuid);
        request.input('uuid', sql.NVarChar(1000), uuid);
        request.input('inputDateString', sql.NVarChar(20), inputDate);
        request.input('inputRoomNo', sql.NVarChar(10), roomNo);
        request.input('inputSlotName', sql.NVarChar(10), slotName);
        request.input('facultyId', sql.NVarChar(20), facultyId);
        request.output('output', sql.Int);
        request.output('responseText', sql.NVarChar(1000))

        request.execute('[' + slugName + '].RescheduleEventedSlotsDateWise01122020', async function (err, result) {
            if (err) throw err;
            console.log(result)
            let outputValue = await result.output.output;
            console.log("Output Value: ", outputValue);

            global.io.emit("scheduleCompleted", {
                isScheduled: outputValue,
                slugName: slugName,
                slotName: slotName,
                roomNo: roomNo,
                inputDate: inputDate,
                tdData: tdData
            })

        })
    })

    //Freeze Timesheet
    socket.on("freezeTimesheet", async (data) => {
        console.log("=======>>>> Freezing Timesheet")
        let request = await db.request();
        let request1 = await db.request();
        let slugName = sanitizer.value(data.slug, String);

        async function execFreezeTimesheet() {

            // let generateTimesheet = await new Promise((resolve) => {
            //     request.output('output', sql.Int);
            //     request.execute('[' + slugName + '].generateTimesheet07042020', async function (err, result) {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             let answers = await result
            //             let outputVal = answers.output.output;
            //             if (outputVal == 1) {
            //                 return resolve(answers)
            //             } else {
            //                 global.io.emit("freezeTimetableErr", {
            //                     status: "Failed",
            //                     message: "Timesheet generation failed.",
            //                     data: answers
            //                 })
            //             }
            //         }
            //     })
            // })

            // let facultyTimesheet = await new Promise((resolve) => {
            //     console.log("=====>>>>>>>>> GENERATING FACULTY TIME SHEET");
            //     request.output('output', sql.Int)
            //     request.execute('[' + slugName + '].facultyTimesheet20042020', async function (err, result) {
            //         console.log("FACULTY TIMESHEET EXECUTING")
            //         if (err) throw err;
            //         let outputVal = await result.output.output
            //         console.log("FACULTY TIMESHEET EXECUTED")
            //         console.log("outputVal =====>>>>>>>>> ", outputVal);

            //         if (outputVal == 1) {
            //             console.log("NEXT PROMISE EXECUTING")
            //             return resolve(1)
            //         } else {
            //             console.log("EXEC STOPPED")
            //             global.io.emit("freezeTimetableErr", {
            //                 status: 400,
            //                 message: "Faculty timesheet generation failed."
            //             })
            //         }

            //     })
            // })

            // let generateDataForSAP = await new Promise((resolve) => {
            //     console.log("=====>>>>>>>>> GENERATING DATA FOR SAP");
            //     request1.output('state', sql.Int)
            //     request1.execute(`[${slugName}].generateDataForSAP`, async function (err, result) {
            //         if (err) throw err;
            //         let outputVal = await result.output.state

            //         console.log("generateDataForSAP ====>>>>>> ", outputVal)

            //         if (outputVal == 1) {
            //             return resolve(1)
            //         } else {
            //             global.io.emit("freezeTimetableErr", {
            //                 status: 400,
            //                 message: "Generate Data for SAP failed."
            //             })
            //         }

            //     })
            // })

            console.log(" TO UPDATE STATUS =====>>>>>>>>> ");

            // let updateStatus = await new Promise((resolve) => {
            //     console.log("=====>>>>>>>>>UPDATEING STATUS");
            //     let stmt = "IF NOT EXISTS (SELECT * FROM [" + slugName + "].statusTable WHERE title = 'isFreezed') INSERT INTO [" + slugName + "].statusTable (title, status, timesUpdated) VALUES('isFreezed', 'Y', 1) ELSE UPDATE [" + slugName + "].statusTable SET status='Y', timesUpdated = (SELECT timesUpdated FROM [" + slugName + "].statusTable WHERE title='isFreezed') + 1 WHERE title = 'isFreezed'"
            //     request.query(stmt, async function (err, obj) {
            //         if (err) throw err

            //         let result = await obj
            //         console.log("====>>>>>>   Emitting AGAIN", result)
            //         global.io.emit("timesheetFreezed", {
            //             status: 200,
            //             message: "Timesheet has been freezed successfully.",
            //             isFreezed: "Y"
            //         })
            //     })
            // })

        }

        execFreezeTimesheet()
    })

    //swapLecture
    socket.on('swapLecture', async obj => {
        let request = db.request();

        // request.input('roomno', sql.NVarChar(10), roomno)

        let socketData = await obj;
        console.log("Data: ", socketData)
        let fromId = Number(socketData.fromId)
        let toId = Number(socketData.toId)

        console.log(fromId, ' | ', toId)

        request.input('inputFromId', sql.Int, fromId);
        request.input('inputToId', sql.Int, toId);
        request.output('outputMsg', sql.NVarChar(500), '');
        request.input('output', sql.Int, 0);

        request.execute(`[${socketData.slug}].swapLectureDayWise110521`, async (err, result) => {
            if (err) throw err;

            let data = await result.recordset[0];

            console.log("swapped data==============>>>>>>>>>>>>>>>>>> ", data)
            //Changed By Hiren
            global.io.emit('lectureSwapped', {
                msg: data.outputMsg,
                isSwapped: data.output,
                slug: socketData.slug,
                dragTdId: socketData.dragTdId,
                targetTdId: socketData.targetTdId,
                dragTdHtml: data.toeventWithTime,
                dragEventName: data.toeventname,
                dragFacultyId: data.tofacultyid,
                dragFacultyType: data.tofacultyType,
                dragProgram: data.toprogram,
                dragAcadSession: data.toacadsession,
                dragEventType: data.toeventtype,
                dragEventId: data.toeventid,
                dragBookedDiv: data.tobookeddiv,

                targetTdVal: data.eventWithTime,
                targetEventName: data.eventname,
                targetFacultyId: data.facultyid,
                targetFacultyType: data.facultyType,
                targetProgram: data.program,
                targetAcadSession: data.acadsession,
                targetEventType: data.eventtype,
                targetEventId: data.eventid,
                targetBookedDiv: data.bookeddiv,
            })
        })
    })

    socket.on('create-sap-events', async function (slug) {
        console.log("Message: socket called creating sap events");


        let eventDetails = await poolConnection.then(pool => {
            return pool.request()
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[asmsoc-mum].sp_generate_event_details`)
        })
        eventDetails = JSON.parse(eventDetails.output.output_json).data

        let eventHeaders = await poolConnection.then(pool => {
            return pool.request()
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[asmsoc-mum].sp_generate_event_header`)
        })
        eventHeaders = JSON.parse(eventHeaders.output.output_json).data

        let eventSchedules = await poolConnection.then(pool => {
            return pool.request()
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[asmsoc-mum].sp_generate_event_schedules`)
        })
        eventSchedules = JSON.parse(eventSchedules.output.output_json).data


        console.log('Event details >>>> ', eventDetails.length)
        console.log('eventHeaders >>>> ', eventHeaders.length)
        console.log('eventSchedules >>>> ', eventSchedules.length)

       // return false;

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_create_sp_bin_sqh_20220401_2.wsdl");
        
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        await soapClient.ZeventCreateSp({
                ItEventDetail: {
                    item: eventDetails
                },
                ItEventHeader: {
                    item: eventHeaders
                },
                ItEventSchedule: {
                    item: eventSchedules,
                },
            },
            async function (err, result) {

                if (err) throw err;

                let etReturn = await result.EtReturn.item;

                writeFile(`D:/infralog/quality/course_wsdl.txt`, JSON.stringify(result), err => {
                    if (err) throw err;
                })


                let procRes = await poolConnection.then(pool => {
                    return pool.request()
                        .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(etReturn))
                        .output('output_flag', sql.Bit)
                        .output('output_json', sql.NVarChar(sql.MAX))
                        .execute(`[asmsoc-mum].sp_update_created_events`)
                })

                console.log('procRes>>> ', procRes)

                socket.emit('create-sap-events', {
                    status: 200,
                    message: 'Event creation completed.'
                });

            }
        )
    })


    socket.on('checkQueue', () => {
        queue.getJobCounts().then(res => console.log('Job Count:\n', res));
    })

    socket.on('flushQueue', () => {
        console.log('Flushing queue')
        queue.empty().then(res => console.log('Removed job:\n', res));
    })

    socket.on('getJobs', () => {
        console.log('>>>>> Fetching jobs...');
        queue.getJobs(['active']).then(jobs => {
            console.log('Job list Count: ', jobs.length);

            for (let job of jobs) {
                console.log('>>>>>>> Job \n', job.data);
            }

        });
    })

}


async function scheduleExtraClassNew(data) {

    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING scheduleExtraClassNew <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> scheduleExtraClassNew <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

        let resObj = data.resObj

        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'

        if (resObj.fromStartTime)
            resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromEndTime)
            resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromDate)
            resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate ? resObj.sapFromDate : "",
                    OldZtimeFrom: resObj.sapFromStartTime ? resObj.sapFromStartTime : "",
                    OldZtimeTo: resObj.sapFromEndTime ? resObj.sapFromEndTime : "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");

        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let lastInsertedId;
        let stmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, is_new_ec) Output Inserted.id VALUES (
                    '${resObj.toFacultyName}',
                    '${resObj.toFacultyId}',
                    '${resObj.toDate}',
                    (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${resObj.toDate}'),
                    (SELECT roomno FROM [asmsoc-mum].room_data WHERE active = 'Y' AND room_uid = '${resObj.toRoom}'),
                    '${resObj.toRoom}',
                    '${resObj.toSlot}',
                    ${resObj.toSlot.split('t')[1]},
                    '${resObj.programId}',
                    (SELECT programCode FROM [asmsoc-mum].programName WHERE active = 'Y' AND programId = '${resObj.programId}'),
                    '${resObj.moduleId}',
                    (SELECT module_code FROM [asmsoc-mum].course_work WHERE programId = '${resObj.programId}' AND moduleId = '${resObj.moduleId}' AND acadSession = '${resObj.acadSession}'),
                    '${resObj.division}',
                    '${resObj.acadSession}',
                    '${resObj.acadYear}',
                    '${resObj.newEventName}',
                    '${resObj.eventAbbr}',
                    'A',
                    '${resObj.sapEventId}',
                    '${resObj.reschFlag}',
                    'initiated',
                    '${resObj.eventType == 'THEO' ? 'TH' : 'PR'}',
                    '${resObj.uniqueIdForSap}',
                    NEWID(),
                    '${resObj.toStartTime}',
                    '${resObj.toEndTime}',
                    0,
                    '${resObj.newEventId}',
                    1
                    )`


        console.log('add new lecture ==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
            lastInsertedId = result.recordset[0].id
        }).catch(err => {
            console.log(err)
        })

        console.log('lastInsertedId=======>>> ', lastInsertedId)
        console.log(`UPDATE faculty_timetable SET unx_lid = ${lastInsertedId} WHERE id = ${lastInsertedId}`)

        await request.query(`UPDATE faculty_timetable SET unx_lid = ${lastInsertedId} WHERE id = ${lastInsertedId}`).catch(err => {
            console.log(err)
        })


        //insert into reschedule transactiopn table
        let stmtRes = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
            SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec,is_adjusted_cancel FROM faculty_timetable WHERE id = ${lastInsertedId}`

        console.log('stmtRes==>> ', stmtRes)

        await request.query(stmtRes).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) reject(err);

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];

                console.log('recordset::::>>>> ', recordset)
                //condition if empty array return here


                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${resObj.newEventName}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), '${resObj.newEventId}', ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {


                    await request.query(`UPDATE faculty_timetable SET active = 1, sap_remark = '${sapResult.StatusRemark}' WHERE id = ${lastInsertedId}`).catch(err => {
                        console.log(err)
                    })


                    let newSlotJson = {};

                    newSlotJson.uuid = recordset.uuid;
                    newSlotJson.starttime = moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.endtime = moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.isBooked = "Y";
                    newSlotJson.bookedProgramId = sapResult.ZPrgstd;
                    newSlotJson.bookedAcadYear = sapResult.Zyear;
                    newSlotJson.bookedAcadSession = recordset.acad_session;
                    newSlotJson.bookedDiv = recordset.division;
                    newSlotJson.eventName = resObj.newEventName;
                    newSlotJson.eventId = resObj.newEventId;
                    newSlotJson.sapEventId = sapResult.ZBuseve;
                    newSlotJson.createdType = "A";
                    newSlotJson.facultyId = sapResult.ZfacultyId;
                    newSlotJson.eventType = recordset.event_type;
                    newSlotJson.uniqueIdForSAP = recordset.unique_id_for_sap;
                    newSlotJson.sapFlag = sapResult.Zflag;
                    newSlotJson.remark = sapResult.Status;
                    newSlotJson.remarkType = sapResult.StatusRemark;

                    console.log('newSlotJson:======>>>>>>  ', newSlotJson)


                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.toDate,
                        slotDetail: newSlotJson
                    })

                    console.log('>>>>>> CALLING sendToLms FUNCTION')
                    sendToLms({
                        name: "Kapil"
                    });

                    console.log('========================>>>>EMITTED<<<<====================================')

                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                    console.log('========================>>>>EMITTED failed<<<<====================================')
                }

                resolve(sapResult);

            })

        })

        resolve(1)
    })

}

async function scheduleExtraClass(data) {

    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING scheduleExtraClass <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> scheduleExtraClass <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

        let resObj = data.resObj
        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'

        if (resObj.fromStartTime)
            resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromEndTime)
            resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')

        if (resObj.fromDate)
            resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })


        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate ? resObj.sapFromDate : "",
                    OldZtimeFrom: resObj.sapFromStartTime ? resObj.sapFromStartTime : "",
                    OldZtimeTo: resObj.sapFromEndTime ? resObj.sapFromEndTime : "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });

        //insert into reschedule transactiopn/faculty_timetable table

        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
        SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel FROM reschedule_transaction WHERE id = ${Number(resObj.transLid)}`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                let newEventName;
                await request.query(`SELECT CONCAT(REVERSE(SUBSTRING(REVERSE(event_name), PATINDEX('%-%', REVERSE(event_name)), DATALENGTH(event_name))), ' (', (SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE facultyId = '${sapResult.ZfacultyId}'),')') AS newEventName FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`).then(result => {
                    newEventName = result.recordset[0].newEventName;
                }).catch(err => {
                    throw err;
                })

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES (
                        '${recordset.transaction_id}', 
                        '${sapResult.Zflag}', 
                        '${sapResult.ZBuseve}', 
                        '${newEventName}', 
                        '${recordset.event_abbr}', 
                        '${recordset.event_type}', 
                        '${sapResult.ZPrgstd}',
                        (SELECT programCode FROM [asmsoc-mum].programName WHERE active = 'Y' AND programId = '${sapResult.ZPrgstd}'),
                        '${sapResult.ZModule}', 
                        (SELECT module_code FROM [asmsoc-mum].course_work WHERE programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}' AND acadSession = '${recordset.acad_session}'),
                        '${recordset.division}', 
                        '${recordset.acad_session}', 
                        '${sapResult.ZfacultyId}', 
                        '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', 
                        (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), 
                        '${sapResult.ZroomId}', 
                        (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), 
                        '${sapResult.Zyear}', 
                        ${Number(sapResult.ReasonId)}, 
                        '${sapResult.ReasonDetail}', 
                        '${sapResult.Status}', 
                        '${sapResult.StatusRemark}', 
                        ${recordset.unique_id_for_sap}, 
                        '${recordset.uuid}', 
                        (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), 
                        (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', 
                        (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let insertFtStmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ((SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}'), '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), 
                        (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), 
                        '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1),
                        (SELECT IIF(LEN(slotName) = 6, RIGHT(slotName, 2), RIGHT(slotName, 1)) FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), 
                        '${sapResult.ZPrgstd}',
                        (SELECT programCode FROM [asmsoc-mum].programName WHERE active = 'Y' AND programId = '${sapResult.ZPrgstd}'),
                        '${sapResult.ZModule}',
                        (SELECT module_code FROM [asmsoc-mum].course_work WHERE programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}' AND acadSession = '${recordset.acad_session}'),
                        '${recordset.division}', '${recordset.acad_session}', ${Number(sapResult.Zyear)}, '${newEventName}', '${recordset.event_abbr}', 'A', '${sapResult.ZBuseve}', '${sapResult.Zflag}', '${sapResult.StatusRemark}', 'TH', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}', '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}', 1, (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                    console.log('insertFtStmt: ', insertFtStmt)

                    await request.query(insertFtStmt).then(result => {
                        console.log('>>>>>>>>Inserted into faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    //UPDATE THE NEW Slot of timesheet07042020 TABLE

                    let newSlotJson = {};

                    newSlotJson.uuid = recordset.uuid;
                    newSlotJson.starttime = moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.endtime = moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.isBooked = "Y";
                    newSlotJson.bookedProgramId = sapResult.ZPrgstd;
                    newSlotJson.bookedAcadYear = sapResult.Zyear;
                    newSlotJson.bookedAcadSession = recordset.acad_session;
                    newSlotJson.bookedDiv = recordset.division;
                    newSlotJson.eventName = newEventName;
                    newSlotJson.eventId = recordset.event_id;
                    newSlotJson.sapEventId = sapResult.ZBuseve;
                    newSlotJson.createdType = "A";
                    newSlotJson.facultyId = sapResult.ZfacultyId;
                    newSlotJson.eventType = recordset.event_type;
                    newSlotJson.uniqueIdForSAP = recordset.unique_id_for_sap;
                    newSlotJson.sapFlag = sapResult.Zflag;
                    newSlotJson.remark = sapResult.Status;
                    newSlotJson.remarkType = sapResult.StatusRemark;

                    console.log('newSlotJson:======>>>>>>  ', newSlotJson)


                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.toDate,
                        slotDetail: newSlotJson
                    })

                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                }

                resolve(sapResult);

            })

        })

        resolve(1)
    })
}

async function changeTimetable(data) {

    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING changeTimetable <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> changeTimetable <<<<<<<<<<<<<<<<<<<<<<<<<<<<')


        let request = await db.request();

        console.log('>>>>>>>>>>>>>>CHANGE OF TIMETABLE<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('change_timetable')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                console.log("date: ", lecture.date_str)
                console.log("DATE : ", moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"))

                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.new_date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.new_start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.new_end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.new_room_uid,
                    OldZroomId: lecture.room_uid,
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: lecture.event_type,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: lecture.faculty_id,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    OldZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)


            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;
                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                    let sapResult = await result.EtReturn.item;
                    resolve(sapResult);
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))


            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_change_timetable');

                console.log(updatedTimetableData)

                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })
            } else {
                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }



        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

        resolve(1);
    })
}

async function bulkModifyEventedSlot(data) {

    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING bulkModifyEventedSlot <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> bulkModifyEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();

        console.log('>>>>>>>>>>>>>>BULK MODIFY REPLACE FACULTY<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        //lecTransObj = '[{"id":"18303","date":"02/06/2021","slot":"slot2","room":"701","newDate":"02/06/2021","newSlot":"slot2","newRoom":"701"},{"id":"18304","date":"07/06/2021","slot":"slot1","room":"701","newDate":"07/06/2021","newSlot":"slot1","newRoom":"701"},{"id":"18305","date":"07/06/2021","slot":"slot2","room":"701","newDate":"07/06/2021","newSlot":"slot2","newRoom":"701"},{"id":"18306","date":"08/06/2021","slot":"slot2","room":"701","newDate":"08/06/2021","newSlot":"slot5","newRoom":"701"},{"id":"18307","date":"09/06/2021","slot":"slot2","room":"701","newDate":"09/06/2021","newSlot":"slot2","newRoom":"701"}]'

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('insert_bulk_transaction')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                console.log("date: ", lecture.date_str)
                console.log("DATE : ", moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"))

                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.new_date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.new_start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.new_end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.new_room_uid,
                    OldZroomId: lecture.room_uid,
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: lecture.event_type,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: lecture.faculty_id,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    OldZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)


            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;

                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                    let sapResult = await result.EtReturn.item

                    resolve(sapResult)
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))

            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_insert_bulk_transaction');

                console.log(updatedTimetableData)

                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })

            } else {
                global.io.emit("bulkModified", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }

        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

        resolve(1)
    })
}

async function modifyEventedSlot(data) {

    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING modifyEventedSlot <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> modifyEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')


        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)
        let resObj = data.resObj

        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate,
                    OldZtimeFrom: resObj.sapFromStartTime,
                    OldZtimeTo: resObj.sapFromEndTime,
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel  FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];

                //condition if empty array return here

                if (!recordset) {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>> SHOULD BE FAILED")

                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })

                    return resolve(sapResult);
                }


                let newEventName;
                await request.query(`SELECT CONCAT(REVERSE(SUBSTRING(REVERSE(event_name), PATINDEX('%-%', REVERSE(event_name)), DATALENGTH(event_name))), ' (', (SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE facultyId = '${sapResult.ZfacultyId}'),')') AS newEventName FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`).then(result => {
                    newEventName = result.recordset[0].newEventName;
                }).catch(err => {
                    console.log(err);
                })

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${newEventName}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0 WHERE date_str = '${moment(sapResult.OldZdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.OldZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.OldZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.OldZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)



                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    let insertFtStmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ((SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}'), ${sapResult.ZfacultyId}, '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), (SELECT IIF(LEN(slotName) = 6, RIGHT(slotName, 2), RIGHT(slotName, 1)) FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', ${Number(sapResult.Zyear)}, '${newEventName}', '${recordset.event_abbr}', 'A', '${sapResult.ZBuseve}', '${sapResult.Zflag}', '${sapResult.StatusRemark}', 'TH', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}', '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}', 1, (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                    console.log('insertFtStmt: ', insertFtStmt)

                    await request.query(insertFtStmt).then(result => {
                        console.log('>>>>>>>>Inserted into faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })



                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })

                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                }

                resolve(sapResult);

            })
        })

        resolve(1)
    })
}

async function rescheduleEventedSlot(data) {
    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING rescheduleEventedSlot <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> rescheduleEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)
        let resObj = data.resObj

        console.log(resObj)

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`

        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapToDate,
                    ZtimeFrom: resObj.sapToStartTime,
                    ZtimeTo: resObj.sapToEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: resObj.sapFromDate,
                    OldZtimeFrom: resObj.sapFromStartTime,
                    OldZtimeTo: resObj.sapFromEndTime,
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
            }
        }

        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                let newEventName;
                await request.query(`SELECT CONCAT(REVERSE(SUBSTRING(REVERSE(event_name), PATINDEX('%-%', REVERSE(event_name)), DATALENGTH(event_name))), ' (', (SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE facultyId = '${sapResult.ZfacultyId}'),')') AS newEventName FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`).then(result => {
                    newEventName = result.recordset[0].newEventName;
                }).catch(err => {
                    throw err;
                })

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${newEventName}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0 WHERE date_str = '${moment(sapResult.OldZdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.OldZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.OldZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.OldZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)

                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    let insertFtStmt = `INSERT INTO faculty_timetable (faculty_name, faculty_id, date_str, day_str, room_no, room_uid, slot_name, slot_no, program_id, program_code, module_id, module_code, div, acad_session, acad_year, event_name, event_abbr, created_type, sap_event_id, sap_flag, sap_remark, event_type, unique_id_for_sap, uuid, start_time, end_time, active, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ((SELECT TOP 1 facultyName FROM [asmsoc-mum].faculty_work WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}'), ${sapResult.ZfacultyId}, '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT dateNameString FROM [asmsoc-mum].timesheet07042020 WHERE dateString = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}'), (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.ZroomId}' AND active = 'Y'), '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), (SELECT IIF(LEN(slotName) = 6, RIGHT(slotName, 2), RIGHT(slotName, 1)) FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', ${Number(sapResult.Zyear)}, '${newEventName}', '${recordset.event_abbr}', 'A', '${sapResult.ZBuseve}', '${sapResult.Zflag}', '${sapResult.StatusRemark}', 'TH', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}', '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}', 1, (SELECT CONCAT((SELECT Stuff((SELECT N'-' + part FROM fn_SplitString1('${recordset.event_id}', '-') WHERE id < 4 FOR XML PATH(''), TYPE).value('text()[1]','nvarchar(max)'),1,1,N'')), '- ', (SELECT id FROM [asmsoc-mum].facultyWorkloadStatus WHERE active = 'Y' AND facultyId = '${sapResult.ZfacultyId}' AND programId = '${sapResult.ZPrgstd}' AND moduleId = '${sapResult.ZModule}'))), ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                    console.log('insertFtStmt: ', insertFtStmt)

                    await request.query(insertFtStmt).then(result => {
                        console.log('>>>>>>>>Inserted into faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })


                    let newSlotJson = {};

                    newSlotJson.uuid = recordset.uuid;
                    newSlotJson.starttime = moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.endtime = moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A');
                    newSlotJson.isBooked = "Y";
                    newSlotJson.bookedProgramId = sapResult.ZPrgstd;
                    newSlotJson.bookedAcadYear = sapResult.Zyear;
                    newSlotJson.bookedAcadSession = recordset.acad_session;
                    newSlotJson.bookedDiv = recordset.division;
                    newSlotJson.eventName = resObj.newEventName;
                    newSlotJson.eventId = resObj.newEventId;
                    newSlotJson.sapEventId = sapResult.ZBuseve;
                    newSlotJson.createdType = "A";
                    newSlotJson.facultyId = sapResult.ZfacultyId;
                    newSlotJson.eventType = recordset.event_type;
                    newSlotJson.uniqueIdForSAP = recordset.unique_id_for_sap;
                    newSlotJson.sapFlag = sapResult.Zflag;
                    newSlotJson.remark = sapResult.Status;
                    newSlotJson.remarkType = sapResult.StatusRemark;

                    console.log('newSlotJson:======>>>>>>  ', newSlotJson)

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: newSlotJson
                    })




                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: sapResult.Zdate == sapResult.OldZdate ? true : false,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        fromSlot: resObj.fromSlot,
                        toSlot: resObj.toSlot,
                        oldRoomNo: sapResult.OldZroomId,
                        newRoomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate,
                        slotDetail: ""
                    })
                }

                resolve(sapResult);

            })
        })

        resolve(1)
    })
}

async function cancelEventedSlotBulk(data) {
    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING cancelEventedSlotBulk <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlotBulk <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

        console.log('>>>>>>>>>>>>>> BULK CANCEL<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = data.resObj
        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        let lecTransObj = data.transJson

        console.log('resJSON====>> ', lecTransObj)

        let insertedTransData = await db.request()
            .input('transJson', sql.NVarChar(sql.MAX), lecTransObj)
            .input('reasonId', sql.NVarChar(sql.Int), resObj.reasonId)
            .input('reasonDetail', sql.NVarChar(sql.MAX), resObj.reasonDetail)
            .input('zFlag', sql.NVarChar(1), resObj.reschFlag)
            .output('output', sql.Bit)
            .output('msg', sql.NVarChar(sql.MAX))
            .execute('bulk_cancel_start')

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log(insertedTransData)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        if (insertedTransData.output.output) {

            let rescheduleItems = [];
            let transLectureList = insertedTransData.recordset

            console.log("transLectureList: ", transLectureList)

            for (let lecture of transLectureList) {
                let item = {
                    TransId: lecture.transaction_id,
                    ZBuseve: lecture.sap_event_id,
                    Zdate: moment(lecture.date_str, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    ZtimeFrom: moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    ZtimeTo: moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
                    Zflag: lecture.z_flag,
                    ZroomId: lecture.room_uid,
                    OldZroomId: "",
                    Zyear: lecture.acad_year,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: lecture.program_id,
                    ZSess: lecture.z_acad_id,
                    ZModule: lecture.module_id,
                    ZEvetyp: 'THEO',
                    ZfacultyId: lecture.faculty_id,
                    OldZfacultyId: "",
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: "",
                    OldZtimeFrom: "",
                    OldZtimeTo: "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                }
                rescheduleItems.push(item)
            }


            let rescheduleObj = {
                ItReschedule: {
                    item: rescheduleItems
                }
            }

            console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<<', rescheduleObj.ItReschedule.item)

            let sapResult = await new Promise((resolve, reject) => {
                soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                    if (err) throw err;
                    console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<');
                    let sapResult = await result.EtReturn.item;
                    resolve(sapResult);
                })
            })

            console.log('>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<')
            console.log(sapResult)
            console.log(JSON.stringify(sapResult))


            if (sapResult.length > 0) {

                let updatedTimetableData = await db.request()
                    .input('transJson', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                    .output('output', sql.Bit)
                    .output('msg', sql.NVarChar(sql.MAX))
                    .execute('after_bulk_cancel_start');

                console.log(updatedTimetableData)

                global.io.emit("bulkCancelled", {
                    socketUser: socketUser,
                    updatedLectureList: updatedTimetableData.recordset,
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 1,
                    msg: 'Lectures has been updated successfully.'
                })
            } else {
                global.io.emit("bulkCancelled", {
                    socketUser: socketUser,
                    updatedLectureList: [],
                    slugName: 'asmsoc-mum',
                    status: 200,
                    isUpdated: 0,
                    msg: 'Lectures has been updated successfully.',
                })
            }

        } else {
            console.log('>>>>>>>>>>>>FAILED: ', insertedTransData.output.msg)
        }

        resolve(1)
    })
}

async function cancelEventedSlotCae(data) {
    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING cancelEventedSlotCae <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlotCae <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)
        let resObj = data.resObj

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        resObj.sapToStartTime = moment(resObj.toStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToEndTime = moment(resObj.toEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapToDate = moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`
        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        //console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapFromDate,
                    ZtimeFrom: resObj.sapFromStartTime,
                    ZtimeTo: resObj.sapFromEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.toRoom,
                    OldZroomId: resObj.fromRoom,
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.toFacultyId,
                    OldZfacultyId: resObj.fromFacultyId,
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: moment(resObj.toDate, 'DD/MM/YYYY').format("YYYY-MM-DD"),
                    OldZtimeFrom: resObj.sapToStartTime,
                    OldZtimeTo: resObj.sapToEndTime,
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                },

            }
        }

        console.log('rescheduleObj: ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //     //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, cancelled_against, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, ${Number(resObj.lecLid)}, is_adjusted_cancel FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]

                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                if (!recordset) {
                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.OldZroomId,
                        inputDate: resObj.fromDate
                    })

                    return resolve(sapResult);
                }

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, cancelled_against, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${recordset.event_name}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.OldZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', (SELECT roomno FROM [asmsoc-mum].room_data WHERE room_uid = '${sapResult.OldZroomId}' AND active = 'Y'), '${sapResult.OldZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${recordset.day}', '${recordset.event_id}', ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.cancelled_against)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0, sap_flag = '${sapResult.Zflag}' WHERE date_str = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.OldZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)

                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    let updateFtStmt2 = `UPDATE faculty_timetable SET is_adjusted_cancel = 1 WHERE id = ${Number(resObj.lecLid)}`

                    console.log('updateFtStmt: ', updateFtStmt2)

                    await request.query(updateFtStmt2).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })



                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.OldZroomId,
                        inputDate: resObj.fromDate
                    })


                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.OldZroomId,
                        inputDate: resObj.fromDate
                    })
                }

                resolve(sapResult);
            })

        })

        resolve(1)
    })
}

async function cancelEventedSlot(data) {
    let db = await new sql.ConnectionPool(databaseConfig.dbconfig).connect()

    console.log(">>>>>>>>>> EXECUTING cancelEventedSlot <<<<<<<<<<<<<<")
    return await new Promise(async resolve => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlot <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();

        let socketUser = data.socketUser;
        let resObj = data.resObj

        resObj.eventType = 'THEO';
        resObj.schoolId = '00004533'
        resObj.sapFromStartTime = moment(resObj.fromStartTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromEndTime = moment(resObj.fromEndTime, 'hh:mm:ss A').format('HH:mm:ss')
        resObj.sapFromDate = moment(resObj.fromDate, 'DD/MM/YYYY').format("YYYY-MM-DD")

        let acadIdStmt = `SELECT TOP 1 id FROM academicSessionMaster WHERE acadSession = '${resObj.acadSession}'`
        await request.query(acadIdStmt).then(result => {
            resObj.acadSessionId = result.recordset[0].id
        })

        //get transaction id
        let transactionId;
        await request.query(`SELECT NEWID() AS transId`).then(result => {
            transactionId = result.recordset[0].transId
        })
        console.log('transactionId====>> ', transactionId)


        let rescheduleObj = {
            ItReschedule: {
                item: {
                    TransId: transactionId,
                    ZBuseve: resObj.sapEventId,
                    Zdate: resObj.sapFromDate,
                    ZtimeFrom: resObj.sapFromStartTime,
                    ZtimeTo: resObj.sapFromEndTime,
                    Zflag: resObj.reschFlag,
                    ZroomId: resObj.fromRoom,
                    OldZroomId: "",
                    Zyear: resObj.acadYear,
                    ZOrg: resObj.schoolId,
                    ZPrgstd: resObj.programId,
                    ZSess: resObj.acadSessionId,
                    ZModule: resObj.moduleId,
                    ZEvetyp: resObj.eventType,
                    ZfacultyId: resObj.fromFacultyId,
                    OldZfacultyId: "",
                    ReasonId: Number(resObj.reasonId),
                    OldZdate: "",
                    OldZtimeFrom: "",
                    OldZtimeTo: "",
                    Remark: "",
                    ZfacId: "",
                    ReasonDetail: resObj.reasonDetail
                },

            }
        }

        console.log('rescheduleObj: ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220401_2.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        //insert into reschedule transactiopn table
        let stmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, day, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel)
	SELECT '${transactionId}', '${resObj.reschFlag}', sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, div, acad_session, faculty_id, date_str, day_str, room_no, room_uid, slot_name, acad_year, ${Number(resObj.reasonId)}, '${resObj.reasonDetail}', 'initiated', '', unique_id_for_sap, uuid, event_id, unx_lid, is_new_ec, is_adjusted_cancel FROM faculty_timetable WHERE date_str = '${resObj.fromDate}' AND room_uid = '${resObj.fromRoom}' AND slot_name = '${resObj.fromSlot}' AND active = 1`
        console.log('stmt==>> ', stmt)

        await request.query(stmt).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZeventRescheduleSp(rescheduleObj, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
                console.log('Result-======>>>> ', result.EtReturn.item)

                let sapResult = await result.EtReturn.item[0]


                let stmtLastTrans = `SELECT TOP 1 * FROM reschedule_transaction WHERE transaction_id = '${transactionId}'`;

                console.log("stmtLastTrans>>>> ", stmtLastTrans);

                let resultLastTrans = await request.query(stmtLastTrans)
                let recordset = resultLastTrans.recordset[0];
                //condition if empty array return here

                if (!recordset) {
                    let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail) VALUES ('${sapResult.TransId}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', (SELECT TOP 1 event_name FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), (SELECT TOP 1 event_abbr FROM faculty_timetable WHERE sap_event_id = '${sapResult.ZBuseve}' AND faculty_id = '${sapResult.ZfacultyId}'), 'TH', '${sapResult.ZPrgstd}', (SELECT programCode FROM [asmsoc-mum].programName WHERE programId = '${sapResult.ZPrgstd}'), '${sapResult.ZModule}', '', '', '', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}')`


                    console.log('insertStmt:===>>> ', insertStmt)

                    await request.query(insertStmt).then(result => {
                        console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate
                    })

                    return resolve(sapResult);
                }

                let insertStmt = `INSERT INTO reschedule_transaction (transaction_id, z_flag, sap_event_id, event_name, event_abbr, event_type, program_id, program_code, module_id, module_code, division, acad_session, faculty_id, date_str, room_no, room_uid, slot_name, acad_year, reason_id, reason_detail, trans_status, trans_detail, unique_id_for_sap, uuid, day, event_id, unx_lid, is_new_ec, is_adjusted_cancel) VALUES ('${recordset.transaction_id}', '${sapResult.Zflag}', '${sapResult.ZBuseve}', '${recordset.event_name}', '${recordset.event_abbr}', '${recordset.event_type}', '${sapResult.ZPrgstd}', '${recordset.program_code}', '${sapResult.ZModule}', '${recordset.module_code}', '${recordset.division}', '${recordset.acad_session}', '${sapResult.ZfacultyId}', '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}', '${recordset.room_no}', '${sapResult.ZroomId}', (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1), '${sapResult.Zyear}', ${Number(sapResult.ReasonId)}, '${sapResult.ReasonDetail}', '${sapResult.Status}', '${sapResult.StatusRemark}', ${recordset.unique_id_for_sap}, '${recordset.uuid}', '${recordset.day}', '${recordset.event_id}', ${recordset.unx_lid}, ${Number(recordset.is_new_ec)}, ${Number(recordset.is_adjusted_cancel)})`


                console.log('insertStmt:===>>> ', insertStmt)

                await request.query(insertStmt).then(result => {
                    console.log('>>>>>>>>Inserted into reschedule_transaction<<<<<<<<', result)
                }).catch(err => {
                    throw err;
                })

                //update faculty_timetable

                if (sapResult.Status == 'success') {

                    let updateFtStmt = `UPDATE faculty_timetable SET active = 0, sap_flag = '${sapResult.Zflag}' WHERE date_str = '${moment(sapResult.Zdate, "YYYY-MM-DD").format("DD/MM/YYYY")}' AND room_uid = '${sapResult.ZroomId}' AND slot_name = (SELECT slotName FROM [asmsoc-mum].school_timing WHERE sapStartTime = '${moment(sapResult.ZtimeFrom, 'HH:mm:ss').format('hh:mm:ss A')}' AND sapEndTime = '${moment(sapResult.ZtimeTo, 'HH:mm:ss').format('hh:mm:ss A')}' AND dayId = 1) AND active = 1`

                    console.log('updateFtStmt: ', updateFtStmt)

                    await request.query(updateFtStmt).then(result => {
                        console.log('>>>>>>>>Updated faculty_timetable<<<<<<<<', result)
                    }).catch(err => {
                        throw err;
                    })

                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate
                    })


                } else {
                    console.log('Rescheduling failed')
                    global.io.emit("droppedEventedSlot", {
                        socketUser: socketUser,
                        status: sapResult.Status,
                        msg: sapResult.StatusRemark,
                        isSameDay: true,
                        resFlag: sapResult.Zflag,
                        slugName: 'asmsoc-mum',
                        slotName: resObj.fromSlot,
                        roomNo: sapResult.ZroomId,
                        inputDate: resObj.fromDate
                    })
                }


                resolve(sapResult);

            })
        })
        resolve(1)
    })
}

let rescheduleTimeTable = async (jobData) => {
    console.log('Task in process: ', jobData.task)
    console.log('Task data: ', jobData.reschData)

    if (jobData.task === 'scheduleExtraClassNew') {
        return await scheduleExtraClassNew(jobData.reschData);
    } else if (jobData.task === 'scheduleExtraClass') {
        return await scheduleExtraClass(jobData.reschData)
    } else if (jobData.task === 'changeTimetable') {
        return await changeTimetable(jobData.reschData)
    } else if (jobData.task === 'bulkModifyEventedSlot') {
        return await bulkModifyEventedSlot(jobData.reschData)
    } else if (jobData.task === 'modifyEventedSlot') {
        return await modifyEventedSlot(jobData.reschData)
    } else if (jobData.task === 'cancelEventedSlotBulk') {
        return await cancelEventedSlotBulk(jobData.reschData)
    } else if (jobData.task === 'cancelEventedSlotCae') {
        return await cancelEventedSlotCae(jobData.reschData)
    } else if (jobData.task === 'cancelEventedSlot') {
        return await cancelEventedSlot(jobData.reschData)
    } else if (jobData.task === 'rescheduleEventedSlot') {
        return await rescheduleEventedSlot(jobData.reschData)
    }
}

queue.process(async (job) => {
    console.log('>>>>>>>>>>>>> INITIALIZING QUEUE PROCESS <<<<<<<<<<<<<<<')
    return await rescheduleTimeTable(job.data);
});

queue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result: `, result);
})



//Fetch api


function sendToLms(data) {
    let obj = {
        TransId: data.TransId,
        ZBuseve: data.ZBuseve,
        Zdate: data.Zdate,
        ZtimeFrom: moment(data.ZtimeFrom).format("hh:mm:ss A"),
        ZtimeTo: moment(data.ZtimeTo).format("hh:mm:ss A"),
        Zflag: data.Zflag,
        ZroomId: data.ZroomId,
        OldZroomId: data.OldZroomId,
        Zyear: data.Zyear,
        ZOrg: data.ZOrg,
        ZPrgstd: data.ZPrgstd,
        ZSess: data.ZSess,
        ZModule: data.ZModule,
        ZEvetyp: data.ZEvetyp,
        ZfacultyId: data.ZfacultyId,
        OldZfacultyId: data.OldZfacultyId,
        ReasonId: data.ReasonId,
        OldZdate: data.OldZdate,
        OldZtimeFrom: data.OldZtimeFrom,
        OldZtimeTo: data.OldZtimeTo,
        Remark: data.Remark,
        ZfacId: data.ZfacId,
        ReasonDetail: data.ReasonDetail,
        Status: data.Status,
        StatusRemark: data.StatusRemark
    }

    console.log('>>>>>>>>>>>>>>>>>>>>>>>> SENDING DATA TO LMS <<<<<<<<<<<<<<<<<<<<<<<')
    axios.post('https://uat-portal.svkm.ac.in:8080/usermgmtcrud/sendCancledLecture', {
            data: obj
        }, {
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (err) {
            console.log(err);
        });
}