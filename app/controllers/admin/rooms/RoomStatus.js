const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const RoomStatus = require('../../../models/RoomStatus')


module.exports = {
    getPage: (req, res) => {
        
        Promise.all([RoomStatus.getRoomTimimgs(res.body)]).then(result => {
            res.render('admin/rooms/status'
            ,{
                RoomTimings: result[0].recordset
                // breadcrumbs: req.breadcrumbs,
            })
        }) 
    },

    getStatus: (req, res) => {

         RoomStatus.roomStatus(req.body)
         .then(result => {
            res.status(200).json(result.recordset)
        })
        .catch(error => {
            console.log('error:>>>>>>', error)
            if(isJsonString.isJsonString(error.originalError.info.message)){
                console.log("error")
                // res.status(500).json(JSON.parse(error.originalError.info.message))
            }
            else{
                console.log("error2")
                res.status(500).json({status:500,
                description:error.originalError.info.message,
                data:[]})
            }
        })
    }, 
}