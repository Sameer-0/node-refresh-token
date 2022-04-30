const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const SessionDates = require('../../../models/SessionDates')
const AcademicCalender  = require('../../../models/AcademicCalender')
const SessionTypes  = require('../../../models/SessionTypes')
const ProgramSessions = require('../../../models/ProgramSessions')
module.exports = {
    getPage: (req, res) => {
        Promise.all([SessionDates.fetchAll(10, res.locals.slug), SessionDates.getCount(res.locals.slug), AcademicCalender.fetchAll(100), SessionTypes.fetchAll(10, res.locals.slug), ProgramSessions.fetchAll(10, res.locals.slug)]).then(result => {
            console.log('result:::::programsession',result[0].recordset)
            res.render('admin/sessions/sessiondates.ejs', {
                sessionDateList: result[0].recordset,
                pageCount: result[1].recordset[0].count,
                AcademicCalenderList: result[2].recordset,
                sessionTypes: result[3].recordset,
                programSessions: result[4].recordset
            })
        }).catch(error=>{
            console.log('Error::::::::::::::::>>>',error)
        })
    },

    create: (req, res) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        console.log('req.body:::::::::',req.body)

        SessionDates.save(req.body, res.locals.slug).then(result => {
            res.status(200).json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            console.log('error:::::::::::',error)
            res.status(500).json(error.originalError.info.message)
        })

    },

    findOne: (req, res) => {
       
        SessionDates.findById(req.query.id, res.locals.slug).then(result => {
            res.json({ 
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        }).catch(error => {
            console.log("error:::::::::>>", error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    update: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        SessionDates.update(req.body, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success",

            })
        }).catch(error => {
            console.log('error::::::::::>>',error)
            res.status(500).json(error.originalError.info.message)
        })
    },

    delete: (req, res) => {

        console.log('req.body.Ids::::::::::',req.body.Ids)
        SessionDates.delete(req.body.Ids, res.locals.slug).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    deleteAll: (req, res) => {
        console.log('all delete!!!!!!!')
        SessionDates.deleteAll(res.locals.slug).then(result => {
            res.status(200).json({
                status: 200
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    search: (req, res) => {
        let rowcount = 10;
 
        SessionDates.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
            console.log('Search result.recordset',result.recordset)
            if (result.recordset.length > 0) {
                
                res.json({
                    status: "200",
                    message: "Room Type fetched",
                    data: result.recordset,
                    length: result.recordset.length
                })
          

            } else {
                console.log(result.recordset+result.recordset.length)
                res.json({
                    status: "400",
                    message: "No data found",
                    data: result.recordset,
                    length: result.recordset.length
                })
           
            }
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },

    pagination: (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        SessionDates.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            console.log(error)
            throw error
        })
    }
}