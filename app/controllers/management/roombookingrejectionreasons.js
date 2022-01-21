const RoomBookingRejectionReasons = require("../../models/RoomBookingRejectionReasons")


module.exports = {
    getPage: (req, res) => {
        RoomBookingRejectionReasons.fetchAll(10).then(result => {
      
            res.render('management/cancellation/bookingrejectionreasons', {
                RoomCancellationReasonsList: result.recordset
            })
        })

    },

    create: (req, res) => {
        RoomBookingRejectionReasons.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })

    },

    getById: (req, res) => {
        RoomBookingRejectionReasons.getById(req.query.id).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data:result.recordset[0]
            })
        })

    },

    update:(req, res)=>{
        RoomBookingRejectionReasons.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    delete:(req, res)=>{
  
        RoomBookingRejectionReasons.delete(req.body.id).then(result => {
            console.log('result:::::::::::>>',result)
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    search: (req, res) => {
        //here 10is rowcount
        let rowcont  = 10;
     
        RoomBookingRejectionReasons.search(rowcont, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "fetched",
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