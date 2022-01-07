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
}