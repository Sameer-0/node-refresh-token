const {
    search
} = require('../../models/Buildings');
const divisionModel = require('../../models/Divisions')
const courseModel = require('../../models/InitialCourseWorkload')



module.exports = {
    getPage: (req, res) => {
        let rowcount = 50;

        Promise.all([divisionModel.fetchAll(rowcount), courseModel.fetchAll()]).then(result => {
            res.render('management/division/index', {
                divisionList: result[0].recordset,
                courseList: result[1].recordset
            })
        })

    },

    addDivision: (req, res) => {
        divisionModel.addDivision(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success",
                body: req.body

            })
        })
    },

    getDivisionById: (req, res) => {
        divisionModel.getDivision(req.query.id).then(result => {
            res.json({
                status: 200,
                divisionData: result.recordset[0]
            })
        })
    },

    updateDivisionById: (req, res) => {
        divisionModel.updateDivision(req.body).then(result => {
            res.json({
                status: 200,

            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        divisionModel.search(rowcount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: 200,
                    message: "DivisionData Fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
            } else {
                res.json({
                    status: 400,
                    message: 'No Data Found',
                    data: result.recordset,
                    length: result.recordset.length
                })
            }
        }).catch(error => {
            console.log('Error::', error)
            res.json({
                status: 500,
                message: 'Something Went Wrong'
            })
        })
    },

    deleteDivisionById: (req, res) => {
        divisionModel.deleteDivision(req.body.id).then(result => {
            res.json({
                status: 200
            })

        })
    }
}