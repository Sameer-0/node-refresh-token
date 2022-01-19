const RoomTypes = require('../../models/RoomTypes')

module.exports = {
    getRoomTypePage: (req, res) => {
        RoomTypes.fetchAll(10).then(result => {
            res.render('management/room/roomtype', {
                roomTypes: result.recordset
            })
        })
    },

    createRoomType: (req, res) => {
        RoomTypes.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getRoomTypeById: (req, res) => {
        RoomTypes.getRoomTypeById(req.body.roomtypeid).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    updateRoomTypeById: (req, res) => {
        RoomTypes.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    deleteRoomTypeById: (req, res) => {
        RoomTypes.delete(req.body.roomtypeid).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    searchRoomType:(req, res)=>{
               //here 10is rowcount
               let rowcont = 10;
               RoomTypes.searchRoomType(rowcont, req.body.keyword).then(result => {
                   if (result.recordset.length > 0) {
                       res.json({
                           status: "200",
                           message: "Slug fetched",
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