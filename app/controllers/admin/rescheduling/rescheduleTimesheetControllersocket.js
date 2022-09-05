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


    //cancelEventedSlotBulk
    socket.on("cancelEvents", async data => {

        console.log('>>>>>>>>>>>>>>CANCEL EVENT<<<<<<<<<<<<<<<', )

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");
   
        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);
        //resObj.eventType = 'THEO';
        // let lecTransObj = data.transJson

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))

        let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            // .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_cancel_rescheduling]`)

        let transLectureList = JSON.parse(result.output.output_json).data

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log("transLectureList>> ", transLectureList)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        let rescheduleItems = [];

        for (let lecture of transLectureList) {
            let item = {
                TransId: lecture.TransId,
                ZBuseve: lecture.ZBuseve,
                Zdate: lecture.Zdate,
                ZtimeFrom: lecture.ZtimeFrom,
                ZtimeTo: lecture.ZtimeTo,
                Zflag: lecture.Zflag,
                ZroomId: lecture.ZroomId,
                OldZroomId: lecture.OldZroomId,
                Zyear: lecture.Zyear,
                ZOrg: data.orgId,
                ZPrgstd: lecture.ZPrgstd,
                ZSess: lecture.ZSess,
                ZModule: lecture.ZModule,
                ZEvetyp: lecture.ZEvetyp,
                ZfacultyId: lecture.ZfacultyId,
                OldZfacultyId: lecture.OldZfacultyId,
                ReasonId: lecture.ReasonId,
                OldZdate: lecture.OldZdate,
                OldZtimeFrom: lecture.OldZtimeFrom,
                OldZtimeTo: lecture.OldZtimeTo,
                Remark: "",
                ZfacId: "",
                ReasonDetail: lecture.ReasonDetail
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
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                .input('reason_id', sql.Int, resObj.reasonId)
                // .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 2)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[asmsoc-mum].[sp_cancel_rescheduling]');

            console.log(updatedTimetableData)

            global.io.emit("cancelEventResponse", {
                socketUser: socketUser,
                updatedLectureList: updatedTimetableData.output.output_json,
                slugName: 'asmsoc-mum',
                status: 200,
            })
        } else {
            // global.io.emit("bulkCancelled", {
            //     socketUser: socketUser,
            //     updatedLectureList: [],
            //     slugName: 'asmsoc-mum',
            //     status: 200,
            //     isUpdated: 0,
            //     msg: 'Lectures has been updated successfully.',
            // })
            console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
        }



    })

    socket.on("cancelAgainstExtraEvent", async data => {

        console.log('>>>>>>>>>>>>>>CANCEL AGINST EXTRA EVENT<<<<<<<<<<<<<<<', )

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);
        //resObj.eventType = 'THEO';
        // let lecTransObj = data.transJson

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))

        let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_cancel_regular_against_extra_rescheduling]`)

        let transLectureList = JSON.parse(result.output.output_json).data

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log("transLectureList>> ", transLectureList)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')

        //CREATE SAP OBJ JSON
        let rescheduleItems = [];

        for (let lecture of transLectureList) {
            let item = {
                TransId: lecture.TransId,
                ZBuseve: lecture.ZBuseve,
                Zdate: lecture.Zdate,
                ZtimeFrom: lecture.ZtimeFrom,
                ZtimeTo: lecture.ZtimeTo,
                Zflag: lecture.Zflag,
                ZroomId: lecture.ZroomId,
                OldZroomId: lecture.OldZroomId,
                Zyear: lecture.Zyear,
                ZOrg: data.orgId,
                ZPrgstd: lecture.ZPrgstd,
                ZSess: lecture.ZSess,
                ZModule: lecture.ZModule,
                ZEvetyp: lecture.ZEvetyp,
                ZfacultyId: lecture.ZfacultyId,
                OldZfacultyId: lecture.OldZfacultyId,
                ReasonId: lecture.ReasonId,
                OldZdate: lecture.OldZdate,
                OldZtimeFrom: lecture.OldZtimeFrom,
                OldZtimeTo: lecture.OldZtimeTo,
                Remark: "",
                ZfacId: "",
                ReasonDetail: lecture.ReasonDetail
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
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 2)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[asmsoc-mum].[sp_cancel_regular_against_extra_rescheduling]');

            console.log(updatedTimetableData)

            global.io.emit("cancelAgaistExtraEventResponse", {
                socketUser: socketUser,
                updatedLectureList: JSON.parse(updatedTimetableData.output.output_json),
                slugName: 'asmsoc-mum',
                status: 200,
            })
        } else {
            // global.io.emit("bulkCancelled", {
            //     socketUser: socketUser,
            //     updatedLectureList: [],
            //     slugName: 'asmsoc-mum',
            //     status: 200,
            //     isUpdated: 0,
            //     msg: 'Lectures has been updated successfully.',
            // })
            console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
        }



    })

    //Modify Evented Slot
    socket.on("modifyEvents", async function (data) {
        // const job = await queue.add({
        //     task: "modifyEventedSlot",
        //     reschData: data
        // });

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> MODIFY EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");  

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_modify_rescheduling]`)



        let transLectureList = JSON.parse(result.output.output_json).data
        console.log('transLectureList', transLectureList)


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log("transLectureList>> ", transLectureList)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
      
        //CREATE SAP OBJ JSON
        let rescheduleItems = [];

        for (let lecture of transLectureList) {
            let item = {
                TransId: lecture.TransId,
                ZBuseve: lecture.ZBuseve,
                Zdate: lecture.Zdate,
                ZtimeFrom: lecture.ZtimeFrom,
                ZtimeTo: lecture.ZtimeTo,
                Zflag: lecture.Zflag,
                ZroomId: lecture.ZroomId,
                OldZroomId: "",
                Zyear: lecture.Zyear,
                ZOrg: data.orgId,
                ZPrgstd: lecture.ZPrgstd,
                ZSess: lecture.ZSess,
                ZModule: lecture.ZModule,
                ZEvetyp: lecture.ZEvetyp,
                ZfacultyId: lecture.ZfacultyId,
                OldZfacultyId: "",
                ReasonId: lecture.ReasonId,
                OldZdate: lecture.Zdate,
                OldZtimeFrom: lecture.ZtimeFrom,
                OldZtimeTo: lecture.ZtimeTo,
                Remark: "",
                ZfacId: "",
                ReasonDetail: lecture.ReasonDetail
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
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 2)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[asmsoc-mum].[sp_modify_rescheduling]');

            console.log(updatedTimetableData)

            global.io.emit("modifyEventResponse", {
                socketUser: socketUser,
                updatedLectureList: updatedTimetableData.output.output_json,
                slugName: 'asmsoc-mum',
                status: 200,
            })
        } else {
            // global.io.emit("bulkCancelled", {
            //     socketUser: socketUser,
            //     updatedLectureList: [],
            //     slugName: 'asmsoc-mum',
            //     status: 200,
            //     isUpdated: 0,
            //     msg: 'Lectures has been updated successfully.',
            // })
            console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
        }


    })

    //Reschedule Evented Slots
    socket.on("rescheduleEvents", async function (data) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> RESCHEDULE EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl");  

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_reschedule]`)


        let transLectureList = JSON.parse(result.output.output_json).data
        console.log('transLectureList', transLectureList)


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log("transLectureList>> ", transLectureList)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
      
        //CREATE SAP OBJ JSON
        let rescheduleItems = [];

        for (let lecture of transLectureList) {
            let item = {
                TransId: lecture.TransId,
                ZBuseve: lecture.ZBuseve,
                Zdate: lecture.Zdate,
                ZtimeFrom: lecture.ZtimeFrom,
                ZtimeTo: lecture.ZtimeTo,
                Zflag: lecture.Zflag,
                ZroomId: lecture.ZroomId,
                OldZroomId: lecture.OldZroomId,
                Zyear: lecture.Zyear,
                ZOrg: data.orgId,
                ZPrgstd: lecture.ZPrgstd,
                ZSess: lecture.ZSess,
                ZModule: lecture.ZModule,
                ZEvetyp: lecture.ZEvetyp,
                ZfacultyId: lecture.ZfacultyId,
                OldZfacultyId: lecture.OldZfacultyId,
                ReasonId: lecture.ReasonId,
                OldZdate: lecture.OldZdate,
                OldZtimeFrom: lecture.OldZtimeFrom,
                OldZtimeTo: lecture.OldZtimeTo,
                Remark: "",
                ZfacId: "",
                ReasonDetail: lecture.ReasonDetail
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
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 2)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute(`[${data.slugName}].[sp_reschedule]`);

            console.log(updatedTimetableData)

            global.io.emit("rescheduleEventResponse", {
                socketUser: socketUser,
                updatedLectureList: updatedTimetableData.output.output_json,
                slugName: 'asmsoc-mum',
                status: 200,
            })
        } else {
            // global.io.emit("bulkCancelled", {
            //     socketUser: socketUser,
            //     updatedLectureList: [],
            //     slugName: 'asmsoc-mum',
            //     status: 200,
            //     isUpdated: 0,
            //     msg: 'Lectures has been updated successfully.',
            // })
            console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
        }

    })

    //Extra Class new
    socket.on("scheduleExtraClassNew", async data => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> EXTRA CLASS EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl"); 

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_extra_class_rescheduling]`)



        let transLectureList = JSON.parse(result.output.output_json).data
        console.log('transLectureList', transLectureList)


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log("transLectureList>> ", transLectureList)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
      
        //CREATE SAP OBJ JSON
        let rescheduleItems = [];

        for (let lecture of transLectureList) {
            let item = {
                TransId: lecture.TransId,
                ZBuseve: lecture.ZBuseve,
                Zdate: lecture.Zdate,
                ZtimeFrom: lecture.ZtimeFrom,
                ZtimeTo: lecture.ZtimeTo,
                Zflag: lecture.Zflag,
                ZroomId: lecture.ZroomId,
                OldZroomId: lecture.OldZroomId,
                Zyear: lecture.Zyear,
                ZOrg: data.orgId,
                ZPrgstd: lecture.ZPrgstd,
                ZSess: lecture.ZSess,
                ZModule: lecture.ZModule,
                ZEvetyp: lecture.ZEvetyp,
                ZfacultyId: lecture.ZfacultyId,
                OldZfacultyId: lecture.OldZfacultyId,
                ReasonId: lecture.ReasonId,
                OldZdate: lecture.OldZdate,
                OldZtimeFrom: lecture.OldZtimeFrom,
                OldZtimeTo: lecture.OldZtimeTo,
                Remark: "",
                ZfacId: "",
                ReasonDetail: lecture.ReasonDetail
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
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 2)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[asmsoc-mum].[sp_extra_class_rescheduling]');

            console.log(updatedTimetableData)

            global.io.emit("extraClassResponse", {
                socketUser: socketUser,
                updatedLectureList: JSON.parse(updatedTimetableData.output.output_json),
                slugName: 'asmsoc-mum',
                status: 200,
            })
        } else {
            // global.io.emit("bulkCancelled", {
            //     socketUser: socketUser,
            //     updatedLectureList: [],
            //     slugName: 'asmsoc-mum',
            //     status: 200,
            //     isUpdated: 0,
            //     msg: 'Lectures has been updated successfully.',
            // })
            console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
        }

    })

    //Regular Lecture
    socket.on("scheduleRegularLecture", async data => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>> REGULAR CLASS EVENT <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

        let socketUser = data.userId;
        // console.log('socketUser>>>>> ', socketUser)

        let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_reschedule_sp_bin_sqh_20220808.wsdl"); 

        console.log('wsdlUrl', wsdlUrl)
        let soapClient = await new Promise((resolve, reject) => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) throw err;
                let client = await soapClient;
                resolve(client)
            })
        });


        let resObj = JSON.parse(data.transJson);

        console.log('resJSON====>> ', resObj)
        console.log('JSON.stringify(resObj.eventsJson) ====>> ', JSON.stringify(resObj.eventsJson))
        
        let result = await db.request()
            .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(resObj.eventsJson))
            .input('reason_id', sql.Int, resObj.reasonId)
            .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
            .input('res_stage', sql.Int, 1)
            .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
            .input('last_modified_by', sql.Int, data.userId)
            .output('output_flag', sql.Bit)
            .output('output_json', sql.NVarChar(sql.MAX))
            .execute(`[${data.slugName}].[sp_regular_class_rescheduling]`)



        let transLectureList = JSON.parse(result.output.output_json).data
        console.log('transLectureList', transLectureList)


        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BEDFORE')
        console.log("transLectureList>> ", transLectureList)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>AFTER')
    
        //CREATE SAP OBJ JSON
        let rescheduleItems = [];

        for (let lecture of transLectureList) {
            let item = {
                TransId: lecture.TransId,
                ZBuseve: lecture.ZBuseve,
                Zdate: lecture.Zdate,
                ZtimeFrom: lecture.ZtimeFrom,
                ZtimeTo: lecture.ZtimeTo,
                Zflag: lecture.Zflag,
                ZroomId: lecture.ZroomId,
                OldZroomId: "",
                Zyear: lecture.Zyear,
                ZOrg: data.orgId,
                ZPrgstd: lecture.ZPrgstd,
                ZSess: lecture.ZSess,
                ZModule: lecture.ZModule,
                ZEvetyp: lecture.ZEvetyp,
                ZfacultyId: lecture.ZfacultyId,
                OldZfacultyId: "",
                ReasonId: lecture.ReasonId,
                OldZdate: "",
                OldZtimeFrom: "",
                OldZtimeTo: "",
                Remark: "",
                ZfacId: "",
                ReasonDetail: lecture.ReasonDetail
            }
            rescheduleItems.push(item)
        }


        let rescheduleObj = {
            ItReschedule: {
                item: rescheduleItems
            }
        }

        console.log('>>>>>>>SAP IBJ JSON<<<<<<<<<<<< LAST:::>>>>', rescheduleObj.ItReschedule.item)
      
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
                .input('input_json', sql.NVarChar(sql.MAX), JSON.stringify(sapResult))
                .input('reason_id', sql.Int, resObj.reasonId)
                .input('reason_detail', sql.NVarChar(sql.MAX), resObj.reasonDescription)
                .input('res_stage', sql.Int, 2)
                .input('flag', sql.NVarChar(sql.MAX), resObj.reschFlag)
                .input('last_modified_by', sql.Int, data.userId)
                .output('output_flag', sql.Bit)
                .output('output_json', sql.NVarChar(sql.MAX))
                .execute('[asmsoc-mum].[sp_regular_class_rescheduling]');

            console.log(updatedTimetableData)

            global.io.emit("regularClassResponse", {
                socketUser: socketUser,
                updatedLectureList: JSON.parse(updatedTimetableData.output.output_json),
                slugName: 'asmsoc-mum',
                status: 200,
            })
        } else {
            // global.io.emit("bulkCancelled", {
            //     socketUser: socketUser,
            //     updatedLectureList: [],
            //     slugName: 'asmsoc-mum',
            //     status: 200,
            //     isUpdated: 0,
            //     msg: 'Lectures has been updated successfully.',
            // })
            console.log('>>>>>>>>>>>>>>>SAP RESULT CAME EMPTY<<<<<<<<<<<<<<<<<')
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
            StartTime: moment(facultyData.startTime, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: moment(facultyData.endTime, 'hh:mm:ss A').format('HH:mm:ss'),
        }

        let roomParam = {
            ResourceType: 'G',
            ResourceId: roomData.roomAbbr,
            StartDate: roomData.startDate,
            EndDate: roomData.endDate,
            StartTime: moment(roomData.startTime, 'hh:mm:ss A').format('HH:mm:ss'),
            EndTime: moment(roomData.endTime, 'hh:mm:ss A').format('HH:mm:ss'),
        }


        let sapFacultyResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(facultyParam, async (err, result) => {

                if (err) throw err;
                try {

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
                    resolve({
                        status: 200,
                        data: sapResult
                    })
                } catch (error) {
                    console.log('error:::::::::', error)
                    reject({
                        status: 500,
                        data: []
                    })
                }
            })
        })

        let sapRoomResult = await new Promise((resolve, reject) => {
            soapClient.ZapiFacultyAvailability(roomParam, async (err, result) => {

                if (err) throw err;
                try {

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
                    resolve({
                        status: 200,
                        data: sapResult
                    })
                } catch (error) {
                    console.log('error:::::::::', error)
                    reject({
                        status: 500,
                        data: []
                    })
                }
            })
        })

        console.log('>>>>>>>>>>>>>>>>>>SAP RESULT<<<<<<<<<<<<<<<<<<<<<<<')
        console.log('sapResult::::::::::::::::::::>>>>>>', sapFacultyResult)
        socket.emit('facultyRoomAvlList', sapFacultyResult, sapRoomResult)
        socket.broadcast.emit('facultyRoomAvlList', sapFacultyResult, sapRoomResult)
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

        // let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_create_sp_bin_sep_20220509.wsdl");

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

                writeFile(`D:/infralog/production/course_wsdl.txt`, JSON.stringify(result), err => {
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

                socket.emit('res-create-sap-events', {
                    status: 200,
                    message: 'Event creation completed.'
                });

            }
        )
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

}