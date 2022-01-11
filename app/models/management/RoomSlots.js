const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../../config/db')

module.exports = class RoomSlots {
    constructor(date, room_id, slot_id, alloted_to, transaction_uui, is_booked, date_id) {
        this.date = date;
        this.room_id = room_id;
        this.slot_id = slot_id;
        this.alloted_to = alloted_to;
        this.transaction_uui = transaction_uui;
        this.is_booked = is_booked;
        this.date_id = date_id;
    }

    static fetchAll() {
        return poolConnection.then(pool => {
            return pool.request().query(`select id, date, room_id, slot_id, alloted_to, b_transaction_id, is_booked, active, b_transaction_uuid from [dbo].room_slots where active  = 1`)
        })
    }

    static save(body) {
        return poolConnection.then(pool => {
            let request = pool.request();
            return request.input('Date', sql.Date, body.date)
                .input('Room_id', sql.Int, body.room_id)
                .input('Slot_id', sql.Int, body.slot_id)
                .input('Alloted_to', sql.Int, body.alloted_to)
                .input('B_transaction_id',sql.BigInt, b_transaction_id)
                .input('Is_booked',sql.BigInt, body.is_booked)
                .input('B_transaction_uuid',sql.BigInt, body.is_booked)
                .query(`insert into [dbo].room_slots (date, room_id, slot_id, alloted_to, b_transaction_id, is_booked, b_transaction_uuid)  values(@Date, @Room_id, @Slot_id, @Alloted_to, @B_transaction_id,@Is_booked, @B_transaction_uuid)`)
        })
    }
}