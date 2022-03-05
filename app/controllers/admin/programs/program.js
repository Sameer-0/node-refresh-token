const Programs = require('../../../models/Programs')
const ProgramTypes  =  require('../../../models/programType')
module.exports = {
    getPage: (req, res) => {

        Promise.all([Programs.fetchAll(10, res.locals.slug), ProgramTypes.fetchAll(100, res.locals.slug)]).then(result=>{
            res.render('admin/programs/index', {
                programList: result[0].recordset,
                programTypeList: result[1].recordset
            })
        })

        
    }
}