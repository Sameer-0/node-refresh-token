const divisionModel = require('../../models/Divisions')



module.exports = {
    getPage: (req, res) => {
        divisionModel.fetchAll().then(result => {
            res.render('management/division/index')
        })
       
    }
}