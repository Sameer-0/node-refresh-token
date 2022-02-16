const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const Organizations = require("../../models/Organizations")
const OrganizationTypes = require("../../models/OrganizationTypes");
const Settings = require('../../models/Settings');
module.exports = {
    getPage: (req, res) => {
        if (req.method == "GET") {
            Promise.all([Organizations.fetchAll(10), OrganizationTypes.fetchAll(50), Organizations.getCount()]).then(result => {
                res.render('management/organization/index', {
                    orgList: result[0].recordset,
                    orgtypeList: result[1].recordset,
                    pageCount: result[2].recordset[0].count
                })
            })
        } else if (req.method == "POST") {
            Organizations.fetchChunkRows(req.body.pageNo).then(result => {
                res.json({
                    status: 200,
                    data: result.recordset,
                })
            })
        }
    },

    create: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        console.log('req.body::::::::::::::::::::::::::', req.body)

        Organizations.save(req.body.inputJSON).then(result => {
            if (result.output.output) {
                res.status(200).json({
                    status: 200,
                    data: result.recordset,
                    message: "success"
                })
            } else {
                res.status(409).json({
                    status: 409,
                    data: result.recordset,
                    message: ["Fail! Dublicate entry found"]
                })
            }
        }).catch(error => {
            res.status(500).json({
                status: 500,
                message: [error]
            })
        })
    },

    single: (req, res) => {
        Organizations.getOrgById(req.body.Id).then(result => {
            res.json({
                status: 200,
                orgData: result.recordset[0]
            })
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

        Organizations.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            res.json({
                status: 400,
                message: "Recored Already Exit!"
            })
        })
    },
    delete: (req, res) => {
        Organizations.deleteOrgById(req.body.Id).then(result => {
            res.json({
                status: 200
            })
        })
    },


    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        Organizations.searchOrg(rowcont, req.body.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Campus fetched",
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
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    }
}