const Holidays = require('../../../models/Holidays')
const HolidayType = require('../../../models/HolidayTypes')
module.exports = {
    getPage: (req, res) => {
        Promise.all([Holidays.fetchAll(10, res.locals.slug), HolidayType.fetchAll(100), Holidays.getCount(res.locals.slug)]).then(result => {
            res.render('admin/holidays/index', {
                holidayList: result[0].recordset,
                holidayType: result[1].recordset,
                pageCount: result[2].recordset[0].count
            })
        })
    },

    create: (req, res) => {

        let object = {
            add_holidays: JSON.parse(req.body.inputJSON)
        }

        console.log('object:::::::::::::',object)

        Holidays.save(object, res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    findOne: (req, res) => {
        Holidays.findOne(req.query.Id, res.locals.slug).then(result => {
            res.json({
                status: 200,
                data: result.recordset[0]
            })
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    update: (req, res) => {
        let object = {
            update_holidays: JSON.parse(req.body.inputJSON)
        }
        Holidays.update(object, res.locals.slug).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    delete: (req, res) => {

        console.log('Delete Call', req.body)
        let object = {
            delete_buildings: JSON.parse(req.body.Ids)
        }

        Holidays.delete(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },

    deleteAll: (req, res) => {
        Holidays.deleteAll().then(result => {

            res.status(200).json({status:200,description:"Successfully deleted"})
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
        })
    },


    search: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }

        //here 10is rowcount
        let rowcount = 10;

        Holidays.search(rowcount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Building fetched",
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
            console.log(error)
            res.json({
                status: "500",
                message: "Something went wrong",
            })
        })
    }

    
}