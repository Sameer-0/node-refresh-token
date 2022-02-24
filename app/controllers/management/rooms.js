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
        let rowCount = 10
        if (req.method == "GET") {
            Promise.all([Rooms.fetchAll(rowCount), Organizations.fetchAll(200), Campuses.fetchAll(50), SlotIntervalTimings.fetchAll(50), RoomTypes.fetchAll(10), Buildings.fetchAll(50), Rooms.getCount()]).then(result => {
                console.log('result[2].recordset', result[2].recordset)
                res.render('management/room/index', {
                    roomList: result[0].recordset,
                    campusList: result[2].recordset,
                    buildingList: result[5].recordset,
                    orgList: result[1].recordset,
                    roomTypeList: result[4].recordset,
                    timeList: result[3].recordset,
                    roomcount: result[6].recordset[0] ? result[6].recordset[0].count : ''
                })
            }).catch(error => {
                throw error
            })

        } else if (req.method == 'POST') {
            Rooms.fetchChunkRows(rowCount, req.body.pageNo).then(result => {
                let roomList = []
                result.recordset.map(item => {
                    let rooms = {
                        room_number: item.room_number,
                        building_name: item.building_name,
                        room_type: item.room_type,
                        floor_number: item.floor_number,
                        capacity: item.capacity,
                        start_time: moment(item.start_time).format('LTS'),
                        end_time: moment(item.end_time).format('LTS'),
                        handled_by: item.handled_by,
                        campus_abbr: item.campus_abbr,
                        is_basement: item.is_basement,
                        is_processed: item.is_processed
                    }

                    roomList.push(rooms)
                })
                res.json({
                    status: "200",
                    message: "Quotes fetched",
                    data: roomList,
                    length: result.recordset.length

                })
            }).catch(error => {
                throw error
            })
        }
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


    delete: (req, res) => {
        let object = {
            delete_rooms: JSON.parse(req.body.Ids)
        }

        Rooms.delete(object).then(result => {
            res.json({
                status: 200,
                message: "Success"
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

    deleteAll: (req, res) => {
        Rooms.deleteAll().then(result => {
            res.status(200).json({
                status: 200
            })
        }).catch(error => {
            res.status(500).json(error.originalError.info.message)
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
                data:result.recordset
            })

        })
    }
}