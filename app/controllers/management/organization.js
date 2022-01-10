const {
    check,
    oneOf,
    validationResult
} = require('express-validator');
const OrganizationMaster = require("../../models/management/OrganizationMaster")
const OrganizationType = require("../../models/management/OrganizationType")
module.exports = {
    getPage: (req, res) => {
        Promise.all([OrganizationMaster.fetchAll(), OrganizationType.fetchAll()]).then(result => {
            res.render('admin/management/organization/index', {
                orgList: result[0].recordset,
                orgtypeList: result[1].recordset
            })
        })
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