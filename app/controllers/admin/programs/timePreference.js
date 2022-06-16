const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const Programs = require('../../../models/Programs');
const ProgramSessionTimings = require('../../../models/ProgramSessionTimings');
const SlotIntervalTimings = require('../../../models/SlotIntervalTimings')
// const ProgramSessions = require('../../../models/ProgramSessions')
// const isJsonString = require('../../../utils/util')


module.exports = {
    getPage: (req, res) => {
        Promise.all([ProgramSessionTimings.fetchAll(res.locals.slug), Programs.fetchAll(10, res.locals.slug), SlotIntervalTimings.fetchAll(1000)]).then(result => {
            console.log('time-list::::', result[0].recordset)
            res.render('admin/programs/programSessionTimePreference', {
                programSessionTimingList: result[0].recordset,
                programList: result[1].recordset,
                timeList: result[2].recordset,
                breadcrumbs: req.breadcrumbs,
                Url: req.originalUrl
            })
        })
            
       
    },

    create: (req, res, next) => {

        let obj ={
            'add_program_session_timings': JSON.parse(req.body.inputJSON)
        }
        console.log(obj)
        ProgramSessionTimings.save(obj, res.locals.slug, res.locals.userId).then( result => {

            res.status(200).json(result.recordset)
        })
        .catch(error => {

            console.log(error)

            // if(isJsonString.isJsonString(error.originalError.info.message)){
            //     res.status(500).json(JSON.parse(error.originalError.info.message))
            // }
            // else{
            //     res.status(500).json({status:500,
            //     description:error.originalError.info.message,
            //     data:[]})
            // }
        })
    }
}