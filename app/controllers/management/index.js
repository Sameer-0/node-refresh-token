const AcademicYear = require('../../models/management/AcademicYear')
const moment = require('moment');
module.exports = {

    getIndex: (req, res, next) => {
        AcademicYear.fetchAll().then(result => {
            if (result.recordset.length > 0) {
                let data = {
                    id: result.recordset[0].id,
                    name: result.recordset[0].name,
                    input_acad_year: result.recordset[0].input_acad_year,
                    start_date: moment(result.recordset[0].start_date).format('YYYY-MM-DD'),
                    end_date: moment(result.recordset[0].end_date).format('YYYY-MM-DD')
                }
                res.render('admin/management/academicYear/academicYear', {
                    academicDetails: data,
                    status: 200,
                    message: "Sucess"
                })
            } else {
                res.render('admin/management/academicYear/academicYear', {
                    status: 204,
                    message: "Data not found"
                })
            }
        }).catch(err => {
            res.status(500).json({
                stats: 500,
                message: "Something Went Wrong"
            })
        })
    },

    addAcadYear: (req, res) => {
        
     AcademicYear.Save(req.body).then(resp=>{
         
        console.log('Reqest:::::::::::>>', resp)
     })
        res.redirect('/management/academic-year')
    }
}