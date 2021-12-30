const OrganizationSlug = require('../models/OrganizationSlug')

module.exports = {

    getIndex: (req, res, next) => {
        OrganizationSlug.fetchAll().then(result => {
            res.render('index', {orgList: result.recordset})
        })

    }
}