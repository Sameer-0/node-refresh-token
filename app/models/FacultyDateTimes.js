const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const {
    pool
} = require('mssql');
const slug = require('../controllers/management/slug');

module.exports = class FacultyDateTimes {
    constructor(faculty_id, faculty_name, start_date, end_date, start_time, end_time) {
        this.faculty_id = faculty_id;
        this.faculty_name = faculty_name;
        this.start_date = start_date;
        this.end_date = end_date;
        this.start_time = start_time;
        this.end_time = end_time
    }


    static fetchAll(rowcount, slug) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} fdt.id, fdt.faculty_lid, fdt.start_date_id, fdt.end_date_id, fdt.start_time_id, fdt.end_time_id, 
            f.faculty_name, f.faculty_id, ac.date as start_date, ac1.date as end_date, sit.start_time, sit.end_time
            FROM [${slug}].faculty_date_times fdt 
            INNER JOIN [${slug}].[faculties] f ON fdt.faculty_lid =  f.id
			INNER JOIN [dbo].[academic_calendar] ac ON fdt.start_date_id =  ac.id
            INNER JOIN [dbo].[academic_calendar] ac1 ON fdt.end_date_id =  ac1.id
            INNER JOIN [dbo].[slot_interval_timings] sit ON fdt.start_time_id = sit.id           
            ORDER BY fdt.id DESC`)
        })
    }

    static getCount(slug) {
        return poolConnection.then(pool => {
            let request = pool.request()
            return request.query(`SELECT COUNT(*) as count FROM [${slug}].faculty_date_times`)  
        })
    }

}