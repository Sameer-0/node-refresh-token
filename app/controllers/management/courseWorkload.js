const CourseModel = require('../../models/InitialCourseWorkload')

module.exports = {
    getpage: (req, res) => {
        CourseModel.fetchAll().then(result => {
            res.render('management/courseWorkload/index', {
                courseList: result.recordset
            })
        })
    }
}

