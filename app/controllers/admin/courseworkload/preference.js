const {
    check,
    oneOf,
    validationResult
} = require('express-validator');

const CourseDayRoomPreferences = require('../../../models/CourseDayRoomPreferences')

module.exports = {
    getPage: (req, res) => {
        Promise.all([CourseDayRoomPreferences.fetchAll(10, res.locals.slug), CourseDayRoomPreferences.getCount(res.locals.slug)]).then(result => {
            res.render('admin/courseworkload/preference',{
                coursepreference : result[0].recordset,
                pageCount : result[1].recordset[0].count,
                totalentries : result[0].recordset ? result[0].recordset.length : 0
            })
        })
    },

    search: (req, res) => {
        let rowcount = 10;
        CourseDayRoomPreferences.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
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

        console.log('hitting pagination')
        CourseDayRoomPreferences.pagination(req.body.pageNo, res.locals.slug).then(result => {
            res.json({
                status: "200",
                message: "Quotes fetched",
                data: result.recordset,
                length: result.recordset.length
            })
        }).catch(error => {
            throw error
        })
    },

    update: (req, res) => {

        let object = {
            update_faculty_date_times: JSON.parse(req.body.inputJSON)
        }

        CourseDayRoomPreferences.update(object, res.locals.slug, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {

            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },
}