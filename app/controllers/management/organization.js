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
            Promise.all([OrganizationMaster.fetchAll(), OrganizationType.fetchAll(), OrganizationMaster.getCount()]).then(result => {
                res.render('management/organization/index', {
                    orgList: result[0].recordset,
                    orgtypeList: result[1].recordset,
                    pageCount: result[2].recordset[0].count
                })
            })
        } else if (req.method == "POST") {

        }
    },

    createOrg: (req, res) => {
        OrganizationMaster.save(req.body).then(result => {
            res.json({
                status: 200
            })
        })
    },

    getOrgById: (req, res) => {
        OrganizationMaster.getOrgById(req.body.orgId).then(result => {
            res.json({
                status: 200,
                orgData: result.recordset[0]
            })
        })
    },

    updateOrgById: (req, res) => {
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
    deleteById: (req, res) => {
        OrganizationMaster.deleteOrgById(req.body.orgId).then(result => {
            res.json({
                status: 200
            })
        })
    }
}