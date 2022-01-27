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
            Promise.all([roomModel.fetchAll(rowCount), OrganizationMaster.fetchAll(200), CampusMaster.fetchAll(50), SlotIntervalTimings.fetchAll(50), RoomTypes.fetchAll(10), Buildings.fetchAll(50), roomModel.getCount()]).then(result => {
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


    getSingleRoom: (req, res) => {
        roomModel.fetchRoomById(req.query.id).then(result => {
            res.json({
                status: 200,
                roomData: result.recordset[0]
            })
        })

    },
    updateRoomById: (req, res) => {
        roomModel.updateRoomById(req.body).then(result => {
            res.json({
                status: 200
            })
        })
    },


    deleteRoomById: (req, res) => {
        roomModel.delete(req.body.roomId).then(result => {
            res.json({
                status: 200,
                message: "Success"
            })
        })
    },

    addRoom: (req, res) => {

        // console.log('roomJson:::::::>>>', req.body.roomJson)
        roomModel.add(req.body.roomJson).then(result => {

            console.log('result', result)
            res.json({
                status: 200,
                message: "success",
                data: result.recordset
            })

        }).catch(err => {
            res.json({
                status: 500
            })
        })
    },



    searchRoom: (req, res) => {
   
        let rowCount = 10;
        roomModel.searchRoom(rowCount, req.query.keyword).then(result => {
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