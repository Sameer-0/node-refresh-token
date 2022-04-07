const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
module.exports = class RoomTransactionDetails {

    static findByRoomTransactionId(id, slug) {
        return poolConnection.then(pool => {
            let response = pool.request()
            return response.input('RoomLid', sql.Int, id)
                .query(`SELECT rtd.id, room.room_number, CONVERT(NVARCHAR, ac.date, 105) as start_date, CONVERT(NVARCHAR, _ac.date, 105) as end_date,  CONVERT(NVARCHAR, sit.start_time) as start_time, 
                CONVERT(NVARCHAR, _sit.end_time) as end_time  FROM [${slug}].[room_transaction_details] rtd 
            INNER JOIN [dbo].academic_calendar ac ON ac.id = rtd.start_date_id
            INNER JOIN [dbo].academic_calendar _ac ON _ac.id = rtd.end_date_id
            INNER JOIN [dbo].rooms room  ON room.id =  rtd.room_lid 
            INNER JOIN [dbo].slot_interval_timings sit ON sit.id =  rtd.start_time_id
            INNER JOIN [dbo].slot_interval_timings _sit ON _sit.id =  rtd.end_time_id
            WHERE  rtd.room_transaction_lid = @RoomLid
            ORDER BY rtd.id DESC`)
        }).catch(error => {
            throw error
        })
    }
}