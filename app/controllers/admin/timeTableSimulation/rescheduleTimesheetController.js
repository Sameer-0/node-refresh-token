const sql = require('mssql')
const soap = require('soap');
const path = require('path');
require('dotenv').config()

module.exports.respond = async socket => {

    //On Client Join
    socket.on('join', function (data) {
        console.log(data);
    });

    // socket.on('schedule-event', async function (data) {
    //     console.log('data:::::::::::::>>>',data)
    //     let request = await db.request();
    //     let sqlstmt = 'SELECT id, roomno, slot, slotAllotedFor, day, active, flag  FROM [' + slug + '].initial_pending_table ORDER BY id DESC'
    //     request.query(sqlstmt, async function (err, result) {
    //         if (err) {
    //             console.log(err)
    //         } else {
    //             let fetchedResult = await result.recordset
    //             socket.emit('drawerData', fetchedResult)
    //         }
    //     })
    // })

    //ON DRAWER OPEN
    socket.on('drawerOpen', async function (slug) {
        // let request = await db.request();
        // let sqlstmt = 'SELECT id, roomno, slot, slotAllotedFor, day, active, flag  FROM [' + slug + '].initial_pending_table ORDER BY id DESC'
        // request.query(sqlstmt, async function (err, result) {
        //     if (err) {
        //         console.log(err)
        //     } else {
        //         let fetchedResult = await result.recordset
        //         socket.emit('drawerData', fetchedResult)
        //     }
        // })
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
        console.log('socketUser====>> ', socketUser)
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

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


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

        console.log('socketUser====>> ', socketUser)
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

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


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


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> cancelEventedSlotBulk <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        let request = await db.request();
        let socketUser = data.socketUser;
        console.log('socketUser====>> ', socketUser)

        console.log('>>>>>>>>>>>>>> BULK CANCEL<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


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
        console.log('socketUser====>> ', socketUser)
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

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


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
        console.log('socketUser====>> ', socketUser)
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

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


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

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client);
            })
        });

        let socketUser = data.socketUser;
        console.log('socketUser====>> ', socketUser)


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
    socket.on('facultyAvailabilityCheck', async data => {
        let request = await db.request();

        let socketUser = data.socketUser;
        console.log('socketUser>>>>> ', socketUser)

        let facultyData = await data;
        console.log('>>>>>>>>>>>>>>CHECK FACULTY AVAILABILITY<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zapi_faculty_availability_bin_sep_20220509.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });

        let resourceParam = {
            ResourceType: facultyData.facultyType == '0' ? 'P' : 'H',
            ResourceId: facultyData.facultyId,
            StartDate: facultyData.startDate,
            EndDate: facultyData.endDate,
            StartTime: '', //moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: '' //moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
        }

        console.log(facultyData)

        console.log('resourceParam: ', resourceParam)


        let sapResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(resourceParam, async (err, result) => {
                if (err) throw err;

                console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')
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
                resolve(sapResult)

            })
        })


        console.log('>>>>>>>>>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<<<<<')
        //console.log(sapResult)
        socket.emit('facultyAvlList', {
            socketUser: socketUser,
            facultySchedule: sapResult
        })


    })

    socket.on("changeTimetable", async data => {
        // const job = await queue.add({
        //     task: "changeTimetable",
        //     reschData: data
        // });
        
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> changeTimetable <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let request = await db.request();

        console.log('>>>>>>>>>>>>>>CHANGE OF TIMETABLE<<<<<<<<<<<<<<<')

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });
        let socketUser = data.socketUser;
        console.log('socketUser====>> ', socketUser)


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

        console.log('socketUser====>> ', socketUser)
        console.log('rescheduleObj: =====>>> ', rescheduleObj)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");


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

        console.log('socketUser====>> ', socketUser)
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

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sep_20220509.wsdl");

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
                    sendToLms({ eventId: resObj.newEventId });


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



}

