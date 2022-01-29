const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const OrganizationMaster = require("../../models/OrganizationMaster")
const OrganizationType = require("../../models/OrganizationType")
module.exports = {
    getPage: (req, res) => {

        if (req.method == "GET") {
            Promise.all([OrganizationMaster.fetchAll(10), OrganizationType.fetchAll(), OrganizationMaster.getCount()]).then(result => {
                res.render('management/organization/index', {
                    orgList: result[0].recordset,
                    orgtypeList: result[1].recordset,
                    pageCount: result[2].recordset[0].count
                })
            })
        } else if (req.method == "POST") {
            OrganizationMaster.fetchChunkRows(req.body.pageNo).then(result => {
                res.json({
                    status: 200,
                    data: result.recordset,
                })
            })
        }
    },

    create: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }
        OrganizationMaster.save(req.body).then(result => {
            res.json({
                status: 200
            })
        })
    },

    single: (req, res) => {
        OrganizationMaster.getOrgById(req.body.Id).then(result => {
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

        OrganizationMaster.update(req.body).then(result => {
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
        OrganizationMaster.deleteOrgById(req.body.Id).then(result => {
            res.json({
                status: 200
            })
        })
    },


    search: (req, res) => {
        //here 10is rowcount
        let rowcont = 10;
        OrganizationMaster.searchOrg(rowcont, req.body.keyword).then(result => {
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