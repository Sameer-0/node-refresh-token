const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const SessionDates = require('../../../models/SessionDates')
const AcademicCalender  = require('../../../models/AcademicCalender')
const SessionTypes  = require('../../../models/SessionTypes')
const ProgramSessions = require('../../../models/ProgramSessions')
const isJsonString = require('../../../utils/util')
const Settings = require('../../../models/Settings')
const path = require("path");
var soap = require("soap");

module.exports = {
    getPage: (req, res) => {
        Promise.all([SessionDates.fetchAll(10, res.locals.slug), SessionDates.getCount(res.locals.slug), AcademicCalender.fetchAll(100), SessionTypes.fetchAll(10, res.locals.slug), ProgramSessions.fetchAll(10, res.locals.slug)]).then(result => {
            res.render('admin/sessions/sessiondates.ejs', {
                sessionDateList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                AcademicCalenderList: result[2].recordset,
                sessionTypes: result[3].recordset,
                programSessions: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        }).catch(error=>{
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },


    create: (req, res) => {

        // let object = {
        //     new_session_dates: JSON.parse(req.body.inputJSON)
        // }
        console.log('yellonello')
        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }
        res.status(200).json({status:200, description:"success", data:[]})

        // SessionDates.save(res.locals.slug, object, res.locals.userId).then(result => {
        //     res.status(200).json(JSON.parse(result.output.output_json))
            
        // }).catch(error => {
        //     if(isJsonString.isJsonString(error.originalError.info.message)){
        //         res.status(500).json(JSON.parse(error.originalError.info.message))
        //     }
        //     else{
        //         res.status(500).json({status:500,
        //         description:error.originalError.info.message,
        //         data:[]})
        //     }
        // })
    }, 

    findOne: (req, res) => {
       
        SessionDates.findById(req.body.id, res.locals.slug).then(result => {
            res.json({ 
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    update: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        SessionDates.update(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",

            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    delete: (req, res) => {

        console.log('req.body.Ids::::::::::',req.body.Ids)
        SessionDates.delete(req.body.Ids, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },


    search: (req, res) => {
        let rowcount = 10;
 
        SessionDates.search(req.body, res.locals.slug).then(result => {
            console.log('Search result.recordset',result.recordset)
            if (result.recordset.length > 0) {
                
                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
          

            } else {
                console.log(result.recordset+result.recordset.length)
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
           
            }
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },

    pagination: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        SessionDates.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            if(isJsonString.isJsonString(error.originalError.info.message)){
                res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    },
    
    fetchFromSAP: async (req, res, next) => {
        var wsdlUrl = path.join(
            process.env.WSDL_PATH,
            "zacademic_period_jp_bin_sep_20220509.wsdl"
        );

        let soapClient = await new Promise(resolve => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) {
                    next(err);
                }
                resolve(soapClient);
            })
        })

        let sessionDate = await new Promise(async resolve => {

           // console.log('soapClient::::::',soapClient)
            await soapClient.ZacademicPeriodJp({
                    Campusid: res.locals.campusIdSap,
                    Acadyear: res.locals.acadmicYear,
                    Schoolobjectid: res.locals.organizationIdSap
                },
                async function (err, result) {
                    let output = await result;
                   // console.log('output::::::::::',output.Output.item)
                    //resolve(output.WORKLOAD_DETAILS ? output.WORKLOAD_DETAILS.item : []);
                    resolve(output.Output.item)
                });
        })

        console.log('sessionDate:::::::::::::::::::::',JSON.stringify(sessionDate))

        if(sessionDate.length > 0){
            SessionDates.fetchSessionDateSap(res.locals.slug, sessionDate).then(_result => {
                //console.log('Success:::::::::::::>>>>>',_result)
                res.status(200).json(JSON.parse(_result.output.output_json))

            }).catch(error => {
             console.log('error:::::::::::::',error)
                if(isJsonString.isJsonString(error.originalError.info.message)){
                    res.status(500).json(JSON.parse(error.originalError.info.message))
                
                }
                else{
                  res.status(500).json({status:500,
                    description:error.originalError.info.message,
                    data:[]})
                  
                }
            })
        }else{
            res.status(500).json({status:500,
                description:'Something went wrong try after some time.',
                data:[]})
        }
               

    },
}