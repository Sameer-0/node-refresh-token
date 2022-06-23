const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

module.exports = {

    getPage: (req, res) => {
     
            res.render('admin/faculty/facultyallocationstatus', {
            
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
      
    }
}