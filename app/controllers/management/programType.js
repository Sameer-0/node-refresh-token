const programTypeModel = require('../../models/programType')

module.exports = {
    getProgramTypePage: (req, res) => {
        programTypeModel.fetchAll().then(result => {
            res.render('management/program/programType', {
                programList: result.recordset
            })
        })
    },

    createProgramType: (req, res) => {
        programTypeModel.save(req.body).then(result => {
            console.log('reqBOdy:::::', req.body)
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },


    getProgramTypeById: (req, res) => {
        programTypeModel.getProgramTypeById(req.query.id).then(result => {

            res.json({
                status: 200,
                message: "Success",
                programData: result.recordset[0]
            })
        })
    },

    updateProgramTypeById: (req, res) => {

        programTypeModel.update(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",

            })
        })
    },

    deleteProgramTypeById: (req, res) => {
        programTypeModel.delete(req.body.id).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        programTypeModel.searchProgramType(rowcount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Room Type fetched",
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
        }).catch(err => {
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    },

    programcheck:(req, res)=>{
        res.json({status:"success",program:req.body.username})
    }

}