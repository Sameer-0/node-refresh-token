const {
    check,
    validationResult,
    body
} = require('express-validator');

const Holidays = require('../../../models/Holidays')
const HolidayType = require('../../../models/HolidayTypes')
const AcadYear = require('../../../models/AcademicYear')
const AcademicCalender =  require('../../../models/AcademicCalender')
const path = require("path");
var soap = require("soap");

module.exports = {

    getPage: (req, res) => {
        Promise.all([Holidays.fetchAll(10, res.locals.slug), HolidayType.fetchAll(100), Holidays.getCount(res.locals.slug), AcadYear.fetchAll(), AcademicCalender.fetchAll(10000)]).then(result => {
            res.render('admin/holidays/index', {
                holidayList: result[0].recordset,
                holidayType: result[1].recordset,
                pageCount: result[2].recordset[0].count,
                acadYear: result[3].recordset[0].input_acad_year,
                academicCalender : result[4].recordset
            })
        })
    },

    create: (req, res) => {

        let object = {
            insert_new_holidays: JSON.parse(req.body.inputJSON)
        }

        Holidays.save(object, res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    findOne: (req, res) => {
        Holidays.findOne(req.query.Id, res.locals.slug).then(result => {
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
        Holidays.update(object, res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    delete: (req, res) => {

        console.log('Delete Call', req.body)
        let object = {
            delete_holidays: JSON.parse(req.body.id)
        }

        Holidays.delete(object, res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    deleteAll: (req, res) => {
        Holidays.deleteAll(res.locals.slug).then(result => {

            res.status(200).json({
                status: 200,
                description: "Successfully deleted"
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
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
        Holidays.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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
        let {acadYear} = req.body;
        var wsdlUrl = path.join(
            process.env.WSDL_PATH,
            "zhr_holiday_date_jp_bin_sep_20211129.wsdl"
          );
          console.log('wsdlUrl::::::::::::::::', wsdlUrl)    

          let soapClient = await new Promise(resolve => {
            soap.createClient(wsdlUrl, async function (err, soapClient) {
              if (err) {
                next(err);
              }
              resolve(soapClient);
            })
          })  

          console.log('soapClient:::::::::::::::::>>>',soapClient)

          let holidayList = await new Promise(async resolve => {
            await soapClient.ZhrHolidayDateJp({
                Acadyear: "2018",
                Campusid: "00004533",
                Schoolobjectid: "00004533",
              },
              async function (err, result) {
                let output = await result;
                console.log('output::::::::::::::>>>',output)
                resolve(1);
              });
          })

        //   Holidays.fetchHolidaySap(JSON.stringify(holidayList), res.locals.slug).then(data => {
        //     console.log('Data>>> ', data)
        //     res.status(200).json({
        //       data: courseWorkloadList
        //     });
        //   }).catch(err => {
        //     console.log(err)
        //   });

        res.status(200).json({
              data: holidayList
            });
    }


}