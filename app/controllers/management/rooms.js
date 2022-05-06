const {
    check,
    validationResult
} = require('express-validator');

const Rooms = require('../../models/Rooms')
const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const RoomTypes = require('../../models/RoomTypes')
const Buildings = require('../../models/Buildings');
const Organizations = require('../../models/Organizations');
const Campuses = require('../../models/Campuses');
const Settings = require('../../models/Settings')

module.exports = {

    getPage: (req, res) => {
        res.render('management/room/index',{breadcrumbs: req.breadcrumbs,})
    }, 

    getRoomPage: (req, res) => {
        let rowCount = 10
        Promise.all([Rooms.fetchAll(rowCount), Organizations.fetchAll(200), Campuses.fetchAll(50), SlotIntervalTimings.forAddingRoom(1000), RoomTypes.fetchAll(10), Buildings.fetchAll(50), Rooms.getCount()]).then(result => {
            res.render('management/room/room', {
                roomList: result[0].recordset,
                campusList: result[2].recordset,
                buildingList: result[5].recordset,
                orgList: result[1].recordset,
                roomTypeList: result[4].recordset,
                timeList: result[3].recordset,
                roomcount: result[6].recordset[0] ? result[6].recordset[0].count : '',
                breadcrumbs: req.breadcrumbs,
                
                
            })
        }).catch(error => {
            throw error
        })
    },


    findOne: (req, res) => {
        Rooms.findOne(req.query.id).then(result => {
            res.json({
                status: 200,
                roomData: result.recordset[0]
            })
        })
    },

    update: (req, res) => {

        console.log('inputJSON:::::::>>', JSON.parse(req.body.inputJSON))
        let object = {
            update_rooms: JSON.parse(req.body.inputJSON)
        }

        Rooms.update(object).then(result => {
            res.json({
                status: 200
            })
        })
    },


    addRoom: (req, res) => {

        if (req.body.settingName) {
            Settings.updateByName(res.locals.slug, req.body.settingName)
        }

        let object = {
            add_new_rooms: JSON.parse(req.body.inputJSON)
        }
        Rooms.save(object).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    },



    searchRoom: (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({
                statuscode: 422,
                errors: errors.array()
            });
            return;
        }


        let rowCount = 10;
        Rooms.searchRoom(rowCount, req.query.keyword).then(result => {
            if (result.recordset.length > 0) {
                res.json({
                    status: "200",
                    message: "Rooms fetched",
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
    },


    isProcessed: (req, res) => {
        Rooms.isProcessed(object).then(result => {
            res.json({
                status: 200
            })
        })
    },

    buildingList: (req, res) => {
        Rooms.getBuildingByCampusId(req.body.campus_lid).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })

        })
    },

    
    getRoomTimeSlots: (req, res) => {
        SlotIntervalTimings.forAddingRoom(req.body.id).then(result => {
            res.json({
                status: 200,
                data: result.recordset
            })

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

        Rooms.fetchChunkRows(10, req.body.pageNo).then(result => {
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

    delete: (req, res) => {
        console.log('BODY::::::::::::>>>>>>',req.body.id)
        Rooms.delete(req.body.id, res.locals.userId).then(result => {
            res.status(200).json(JSON.parse(result.output.output_json))
        }).catch(error => {
            res.status(500).json(JSON.parse(error.originalError.info.message))
        })
    }
}