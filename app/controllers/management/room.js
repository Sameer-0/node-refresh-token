const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const roomModel = require('../../models/RoomData')
const building = require('../../models/Buildings')
const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const pagination = require('../../utils/Pagination')
const moment = require('moment')



module.exports = {
    getPage: (req, res, next) => {

        roomModel.fetchAll().then(result => {
            console.log('result::', result)
            res.render('admin/management/room/index.ejs' , {
                roomList: result.recordset
            })
        }).catch(err => {
            console.log(err)
        })
//         coursemodel.fetchAll()
//         .then(result => {

//             console.log(result)
//             res.render('course_workload/index.ejs', {
//                 courseList: result.recordset
//             })
//         })
//         .catch(err => {
//             console.log(err)
//         })
    }
}