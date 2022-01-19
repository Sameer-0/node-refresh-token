const RoomSlots = require("../../models/RoomSlots")

module.exports = {

    getPage: (req, res) => {
        RoomSlots.fetchAll(10).then(result => {
            console.log('result.recordset::::::::::>>',result.recordset)
            res.render('management/room/room_slots', {
                roolSlotList: result.recordset
            })
        })

    }

}