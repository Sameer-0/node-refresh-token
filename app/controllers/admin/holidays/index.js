const {
    check,
    validationResult,
    body
} = require('express-validator');

const Holidays = require('../../../models/Holidays')
const HolidayType = require('../../../models/HolidayTypes')
const AcadYear = require('../../../models/AcademicYear')
const AcademicCalender = require('../../../models/AcademicCalender')
const Settings = require('../../../models/Settings');

const path = require("path");
var soap = require("soap");
const isJsonString = require('../../../utils/util');

module.exports = {


    getPage: (req, res) => {
        Promise.all([Holidays.fetchAll(10, res.locals.slug), HolidayType.fetchAll(100), Holidays.getCount(res.locals.slug), AcadYear.fetchAll(), AcademicCalender.fetchAll(10000)]).then(result => {
            res.render('admin/holidays/index', {
                holidayList: result[0].recordset,
                holidayType: result[1].recordset,
                pageCount: result[2].recordset[0].count,
                acadYear: result[3].recordset[0].input_acad_year,
                academicCalender: result[4].recordset,
                breadcrumbs: req.breadcrumbs,
            })
        })
    },

    create: (req, res) => {
        console.log('holidays controller', req.body)
        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        let object = {
            insert_new_holidays: JSON.parse(req.body.inputJSON)
        }


        Holidays.save(object, res.locals.slug, res.locals.userId).then(result => {
            console.log('result:::<><', result)
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },

    findOne: (req, res) => {
        Holidays.findOne(req.body.Id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    update: (req, res) => {
        let object = {
            update_holidays: JSON.parse(req.body.inputJSON)
        }
        Holidays.update(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },

    delete: (req, res) => {

        console.log('Delete Call', req.body)
        let object = {
            delete_holidays: JSON.parse(req.body.id)
        }

        Holidays.delete(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    },




    search: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        //here 10is rowcount
        let rowcount = 10;
        Holidays.search(rowcount, req.body.keyword, res.locals.slug).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Holiday fetched",
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
            console.log(error)
            res.json({
                status: "500",
                message: "Something went wrong",
            })
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
        Holidays.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Holiday fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log(error)
            throw error
        })
    },

    fetchFromSAP: async (req, res, next) => {
        let {
            acadYear
        } = req.body;
        var wsdlUrl = path.join(
            process.env.WSDL_PATH,
            "zhr_holiday_date_jp_bin_sep_20220509.wsdl"
        );
           let soapClient = await new Promise(resolve => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
                if (err) {
                    next(err);
                }
                resolve(soapClient);
            })
        })

        let holidayList = await new Promise(async resolve => {
            await soapClient.ZhrHolidayDateJp({
                    Acadyear: res.locals.acadmicYear,
                    Campusid: res.locals.campusIdSap,
                    Schoolobjectid: res.locals.organizationIdSap,
                },
                async function (err, result) {
                    let output = await result;
                    resolve(output.Output.item);
                });
        })
        console.log('output::::::::::::::>>> ', holidayList)

        Holidays.fetchHolidaySap(JSON,stringify(holidayList), res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            console.log(error)
            if (isJsonString.isJsonString(error.originalError.info.message)) {
                res.status(500).json(JSON.parse(error.originalError.info.message))
            } else {
                res.status(500).json({
                    status: 500,
                    description: error.originalError.info.message,
                    data: []
                })
            }
        })
    }


}