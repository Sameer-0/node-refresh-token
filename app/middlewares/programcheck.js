const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = function checkprogram(req, res, next) {

    const {
        faculty_id
    } = req.body

    if (!faculty_id) {
        res.json({
            status: 400,
            message: "Faculty id must not be emoty"
        })
    } else {
        console.log("Enterd:::::::::::::", faculty_id)
        let response = poolConnection.then(pool => {
            let request = pool.request()
            return request.input('facultyId', sql.Int, faculty_id)
                .query(`select program_id from [dbo].user_program where faculty_id = @facultyId and active  = 1`)
        })

        response.then(result => {
            if (result.recordset.length > 0) {
                console.log('Success')
                next()
            } else {
                res.json({
                    status: 400,
                    message: "Program not assign to you"
                })
            }
        })
    }

}