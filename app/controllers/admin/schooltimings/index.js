const {
    check,
    oneOf,
    validationResult
} = require('express-validator');


const schoolTiming = require("../../../models/schoolTiming")
const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences');
const Programs = require('../../../models/Programs');
const Days = require('../../../models/Days');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings');
const SchoolTimingType = require('../../../models/SchoolTimingType');
const AcadSession = require('../../../models/AcadSession');
const Settings = require('../../../models/Settings')
const isJsonString = require('../../../utils/util')
const SchoolTimingSettings = require('../../../models/SchoolTimingSettings')

module.exports = {
    getPage: (req, res) => {

        Promise.all([schoolTiming.fetchAll(10, res.locals.slug),  Programs.fetchAll(10, res.locals.slug), Days.fetchAll(10, res.locals.slug), SlotIntervalTimings.fetchAll(100), SchoolTimingType.fetchAll(10), AcadSession.fetchAll(1000), SchoolTimingSettings.fetchAll(100, res.locals.slug), SchoolTimingSettings.checkStatus(res.locals.slug)]).then(result => {
            console.log(result[6].recordset)
            res.render("admin/schooltimings/index",{
                schoolTimingList: result[0].recordset,
                programList: result[1].recordset,
                dayList: JSON.stringify(result[2].recordset),
                slotTime:result[3].recordset,
                schoolTimingTypeList: result[4].recordset,
                AcadSessionList: result[5].recordset,
                schoolTimingSettingsList: result[6].recordset,
                stsStatus: result[7].recordset.length > 0 ? result[7].recordset[0].status : 0,
                pageCount: result[0].recordset.length, 
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    create: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }
        res.status(200).json({status:200, description:"success", data:[]})
        // let object = {
        //     import_faculties: JSON.parse(req.body.inputJSON)
        // }
        // schoolTiming.save(object, res.locals.slug, res.locals.userId).then(result => {
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

    search: (req, res) => {
        let rowcount = 10;
        schoolTiming.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
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

    pagination: (req, res, ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        schoolTiming.pagination(req.body.pageNo, res.locals.slug).then(result => {
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


}