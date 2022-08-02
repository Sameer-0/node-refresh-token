const express = require('express');
const app = express();
require('dotenv').config()
const http = require('http');
const https = require("https");
const path = require('path');
const soap = require('soap');

const setRouter = require("./router")
const timetablesocket = require("./app/controllers/admin/timeTableSimulation/timetablesocket");
const rescheduleTimesheetControllersocket = require("./app/controllers/admin/rescheduling/rescheduleTimesheetControllersocket");
const {
    verifySubdomain
} = require('./app/middlewares/domain')
const {
    v4: uuidv4
} = require('uuid');

const {
    existsSync,
    mkdirSync,
    accessSync,
    readFileSync,
    constants,
    appendFile,
    writeFile
} = require('fs');


let sslOptions = {
    pfx: readFileSync(__dirname + `/cert/server.pfx`),
    passphrase: '1234'
};


//redis
const {
    RedisStore,
    redisClient,
    session
} = require('./config/redis')
const device = require('express-device');

app.use(express.json({
    limit: '50mb'
}));
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static('./public'));
app.set('views', './app/views');
app.set('view engine', 'ejs');


app.use(
    session({
        store: new RedisStore({
            client: redisClient,
            ttl: 260
        }),
        saveUninitialized: false,
        genid: function (req) {
            return uuidv4() // use UUIDs for session IDs
        },
        secret: process.env.COOKIE_SECRET,
        resave: false,
        name: 'token',
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000, //24 hours
            httpOnly: false,
            sameSite: false,
            path: '/'
        }
    })
)

app.use('/set-token', (req, res) => {
    req.session.name = "Kapil Sharma"
    res.send('Token set')
})

get_breadcrumbs = function (url) {
    var rtn = [],
        acc = "", // accumulative url
        arr = url.substring(1).split("/");

    for (i = 0; i < arr.length; i++) {
        acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
        if (acc == '/management') {
            acc = '/management/dashboard'
        }
        if (acc == '/admin') {
            acc = '/admin/dashboard'
        }
        rtn[i] = {
            name: arr[i].toUpperCase(),
            url: acc
        };
        if (acc == '/management/dashboard') {
            acc = '/management'
        }
        if (acc == '/admin/dashboard') {
            acc = '/admin'
        }
    }
    // console.log('rtnnnn', rtn)
    return rtn;
};

app.use(function (req, res, next) {
    req.breadcrumbs = get_breadcrumbs(req.originalUrl);
    next();
});



app.use((req, res, next) => {
    if (!req.session) {
        return next(new Error('No session found!')) // handle error
    }
    next() // otherwise continue
})

app.use(verifySubdomain);
app.use(device.capture());

setRouter(app)


const sql = require('mssql')
const {
    poolConnection
} = require('./config/db');
require('dotenv').config();




app.use('/create-events', async (req, res, next) => {
//     console.log("Message: socket called creating sap events");


//     let eventDetails = await poolConnection.then(pool => {
//         return pool.request()
//             .output('output_flag', sql.Bit)
//             .output('output_json', sql.NVarChar(sql.MAX))
//             .execute(`[asmsoc-mum].sp_generate_event_details`)
//     })
//     eventDetails = JSON.parse(eventDetails.output.output_json).data

//     let eventHeaders = await poolConnection.then(pool => {
//         return pool.request()
//             .output('output_flag', sql.Bit)
//             .output('output_json', sql.NVarChar(sql.MAX))
//             .execute(`[asmsoc-mum].sp_generate_event_header`)
//     })
//     eventHeaders = JSON.parse(eventHeaders.output.output_json).data

//     let eventSchedules = await poolConnection.then(pool => {
//         return pool.request()
//             .output('output_flag', sql.Bit)
//             .output('output_json', sql.NVarChar(sql.MAX))
//             .execute(`[asmsoc-mum].sp_generate_event_schedules`)
//     })
//     eventSchedules = JSON.parse(eventSchedules.output.output_json).data


//     console.log('Event details>>>> ', eventDetails)
//     console.log('eventHeaders >>>> ', eventHeaders)
//     console.log('eventSchedules >>>> ', eventSchedules)


    
//     let wsdlUrl = path.join(process.env.WSDL_PATH, "zevent_create_sp_bin_sqh_20220401_2.wsdl");


//     let soapClient = await new Promise((resolve, reject) => {
//         soap.createClient(wsdlUrl, async function (err, soapClient) {
//             if (err) throw err;
//             let client = await soapClient;
//             resolve(client)
//         })
//     });

//     //console.log(soapClient)
//    // return false;

//     await soapClient.ZeventCreateSp({
//             ItEventDetail: {
//                 item: eventDetails
//             },
//             ItEventHeader: {
//                 item: eventHeaders
//             },
//             ItEventSchedule: {
//                 item: eventSchedules,
//             },
//         },
//         async function (err, result) {
//             if (err) {
//                 throw err;
//             } else {
//                 let output = await result;

//                 console.log('output SAP result>>> ', output)

//                 writeFile(`D:/infralog/quality/course_wsdl.txt`, JSON.stringify(output), err => {
//                     if (err) throw err;
//                 })

//                 let etReturn = output.EtReturn.item;

//                 console.log('etReturn>> ', etReturn)


//                 (async function syncLoopWithFunc() {
//                     for (let k in etReturn) {
//                         console.log('EventId-->', etReturn[k].EventId);

//                         if (etReturn[k].EventId == "00000000") {
//                             console.log("Remark-->", etReturn[k].Remark);
                            
//                             if (
//                                 etReturn[k].Rdate == "0000-00-00" &&
//                                 etReturn[k].FromTime == "00:00:00" &&
//                                 etReturn[k].ToTime == "00:00:00" &&
//                                 etReturn[k].RoomNo == null &&
//                                 etReturn[k].FacultyId == null
//                             ) {
//                                 console.log('If Everything is null-->');
//                                 await new Promise(function (resolve) {

//                                     console.log('etReturn[k].Remarktype: ', etReturn[k].Remarktype)

//                                     request.query(`UPDATE [${slug}].draft_timetable SET sap_remark = '${etReturn[k].Remark.split("'").join("''")}', sap_flag = 'F', remark_type = '${etReturn[k].Remarktype}' WHERE batch_lid = '${etReturn[k].UniqueId}'`,
//                                         async function (err, results) {
//                                             if (err) {
//                                                 console.log(err);
//                                                 throw err;
//                                             } else {
//                                                 let resultSet = await results;
//                                                 console.log(
//                                                     "resultSet-->",
//                                                     resultSet
//                                                 );
//                                                 console.log(
//                                                     "UniqueId-->",
//                                                     etReturn[k].UniqueId
//                                                 );
//                                                 return resolve(resultSet);
//                                             }
//                                         }
//                                     );
//                                 });
//                             } else {
//                                 await new Promise(function (resolve) {
//                                     request.query(`UPDATE [${slug}].draft_timetable SET sap_remark = '${etReturn[k].Remark.split("'").join("''")}', sap_flag = 'F', remark_type = '${etReturn[k].Remarktype}' WHERE batch_lid = '${etReturn[k].UniqueId}' AND date = '${etReturn[k].Rdate}' and sap_start_time = '${etReturn[k].FromTime}' AND end_time = '${etReturn[k].ToTime}' AND room_abbr = '${etReturn[k].RoomNo}' and faculty_id = '${etReturn[k].FacultyId}'`,
//                                         async function (
//                                             err,
//                                             results
//                                         ) {
//                                             if (err) {
//                                                 console.log(err);
//                                                 throw err;
//                                             } else {
//                                                 let resultSet = await results;
//                                                 console.log(
//                                                     "resultSet-->",
//                                                     resultSet
//                                                 );
//                                                 console.log(
//                                                     "UniqueId-->",
//                                                     etReturn[k].UniqueId
//                                                 );
//                                                 return resolve(
//                                                     resultSet
//                                                 );
//                                             }
//                                         }
//                                     );
//                                 });
//                             }
//                         } else {
//                             console.log(
//                                 "UniqueIdBefore-->",
//                                 etReturn[k].UniqueId
//                             );
//                             await new Promise(function (resolve) {
//                                 request.query(`UPDATE [${slug}].draft_timetable SET sap_event_id = '${etReturn[k].EventId}', sap_flag = 'S', sap_remark = '${etReturn[k].Remark}', remark_type = '${etReturn[k].Remarktype}' WHERE batch_lid = '${etReturn[k].UniqueId}'`,
//                                     async function (err, results) {
//                                         if (err) {
//                                             console.log(err);
//                                             throw err;
//                                         } else {
//                                             let resultSet = await results;
//                                             console.log(
//                                                 "resultSet-->",
//                                                 resultSet
//                                             );
//                                             console.log(
//                                                 "UniqueId-->",
//                                                 etReturn[k].UniqueId
//                                             );
//                                             return resolve(resultSet);
//                                         }
//                                     }
//                                 );
//                             });
//                             console.log("success-->");
//                         }
//                     }
//                 })();

//                 socket.emit('res_create_events_sap', {
//                     status: 200,
//                     message: 'Success'
//                 });
//             }
//         }
//     )

    res.send('STOPPING HERE')
})


// app.use(function (req, res) {
//     res.status(404).redirect('/user/login')
// })


// app.use((err, req, res, next) => {
//     console.log('=========================>>>>ERROR MIDDLEWARE<<<<==============================')
//     let logDir = process.env.LOG_DIR_PATH
//     let logFile = process.env.LOG_FILE_PATH
//     let fsErr = '';
//     let errMsg = err.stack;
//     let msg = `Opps! Something went wrong.`

//     console.log('Error midleware: ', errMsg)

//     try {

//       if (!existsSync(logDir) && !accessSync(logDir, constants.R_OK | constants.W_OK)) {
//         mkdirSync(logDir);
//       }
//       let currentDate = new Date();
//       let errStr = `${currentDate}: \n Request URL - ${req.hostname + req.url} \n ${errMsg} \n -------------- \n`

//       appendFile(logFile, errStr, err => {
//         if (err) throw err;
//       })

//     } catch (e) {
//       fsErr += e;
//       console.log("catched error====>>> ", e)
//     }

//     console.log('File err===>>> ', fsErr)
//     console.log("Request type ===============================>>>>>", req.xhr)

//     if (req.xhr) {

//       res.status(500).json({
//         msg: msg + fsErr
//       })
//     } else {
//       res.status(500).render('message/error', {
//         msg: msg + fsErr
//       })
//     }
//   })




if (process.env.APP_ENV === 'PRODUCTION') {
    const server = https.createServer(sslOptions, app).listen(process.env.APP_PORT);
    //socket initialization
    global.io = require("socket.io")(server);
    //SOCKET CONNECTION
    global.io.on("connection", timetablesocket.respond);
    global.io.on("connection", rescheduleTimesheetControllersocket.respond)
} else {
    const server = http.createServer(app).listen(process.env.APP_PORT);
    //socket initialization
    global.io = require("socket.io")(server);
    //SOCKET CONNECTION
    global.io.on("connection", timetablesocket.respond);
    global.io.on("connection", rescheduleTimesheetControllersocket.respond)
}