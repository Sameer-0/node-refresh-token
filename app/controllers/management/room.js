const {
    check,
    oneOf,
    validationResult,
    Result
} = require('express-validator');

const roomModel = require('../../models/RoomData')
const SlotIntervalTimings = require('../../models/SlotIntervalTimings')
const RoomTypes = require('../../models/RoomTypes')
const moment = require('moment');
const Buildings = require('../../models/Buildings');
const OrganizationMaster = require('../../models/OrganizationMaster');
const CampusMaster = require('../../models/CampusMaster');



module.exports = {
    getPage: (req, res) => {
        let rowCount = 10
        if (req.method == "GET") {
            Promise.all([roomModel.fetchAll(10), OrganizationMaster.fetchAll(50), CampusMaster.fetchAll(50), SlotIntervalTimings.fetchAll(), RoomTypes.fetchAll(10),Buildings.fetchAll(50), roomModel.getCount()]).then(result => {
                let roomList = []
                let slotList = []
                // result[0].recordset.map(item => {
                //     let rooms = {
                //         room_number: item.room_number,
                //         building_name: item.building_name,
                //         room_type: item.room_type,
                //         floor_number: item.floor_number,
                //         capacity: item.capacity,
                //         start_time: moment(item.start_time).format('LTS'),
                //         end_time: moment(item.end_time).format('LTS'),
                //         handled_by: item.handled_by,
                //         campus_abbr: item.campus_abbr,
                //         is_basement: item.is_basement,
                //         is_processed: item.is_processed
                //     }
                //     roomList.push(rooms)
                // })
                res.render('management/room/index', {
                    roomList: result[0].recordset,
                    campusList: result[2].recordset,
                    buildingList: result[5].recordset,
                    orgList: result[1].recordset,
                    roomTypeList: result[4].recordset,
                    timeList: result[3].recordset
                })

            }).catch(error => {
                throw error
            })

        } else if (req.method == 'POST') {
            roomModel.fetchChunkRows(rowCount, req.body.pageNo).then(result => {
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


    getSingleRoom:(req, res) => {
        roomModel.fetchRoomById(req.body.id).then(result => {
            res.json({
                status: 200,
                roomData: result.recordset[0]
            })
        })

    },

    getRoomTypePage: (req, res) => {
        RoomTypes.fetchAll(10).then(result => {
            res.render('management/room/roomtype', {
                roomTypes: result.recordset
            })
        })
    },

    createRoomType: (req, res) => {
        RoomTypes.save(req.body).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    getRoomTypeById: (req, res) => {
        RoomTypes.getRoomTypeById(req.body.roomtypeid).then(result => {
            res.json({
                status: 200,
                message: "Success",
                data: result.recordset[0]
            })
        })
    },

    updateRoomTypeById: (req, res) => {
        RoomTypes.update(req.body.roomtypeid).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    deleteRoomTypeById: (req, res) => {
        RoomTypes.delete(req.body.roomtypeid).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    searchRoom: (req, res) => {
        let rowCount = 10;
        roomModel.searchRoom(rowCount, req.body.keyword).then(result => {
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
    }
}