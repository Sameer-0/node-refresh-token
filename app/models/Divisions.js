const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')
const moment = require('moment');
const { pool } = require('mssql');
const { body, Result } = require('express-validator');

module.exports = class Divisions {
    constructor(courseId, division, divisionNum, divisionCount, status1, countForTheoryBatch, countForPracticalBatch, countForTutorialBatch, countForWorkshopBatch) {
        this.courseId = courseId;
        this.divisionNum = divisionNum;
        this.divisionCount = divisionCount;
        this.status1 = status1;
        this.countForPracticalBatch = countForPracticalBatch;
        this.countForTheoryBatch = countForTheoryBatch;
        this.division = division;
        this.countForTutorialBatch = countForTutorialBatch;
        this.countForWorkshopBatch = countForWorkshopBatch;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} d.id , cw.module_name AS course,
            d.division, d.division_num, d.division_count, d.status1, d.count_for_theory_batch, d.count_for_practical_batch,
            d.count_for_tutorial_batch, d.count_for_workshop_batch FROM [bncp-mum].divisions d
            INNER JOIN [bncp-mum].initial_course_workload cw ON cw.id = d.course_id WHERE d.active = 1 ORDER BY d.id DESC`)
        })
    }

    static addDivision(body) {
        return poolConnection.then(pool => {
            return pool.request().input('courseId', sql.Int, body.courseId)
            .input('division', sql.Char, body.division)
            .input('divisionNum', sql.Int, body.divisionNum)
            .input('divisionCount', sql.Int, body.divisionCount)
            .input('countTheoryBatch', sql.Int, body.countTheoryBatch)
            .input('countPracticalBatch', sql.Int, body.countPracticalBatch)
            .input('countTutorialBatch', sql.Int, body.countTutorialBatch)
            .input('countWorkshopBatch', sql.Int, body.countWorkshopBatch)
            .query(`INSERT INTO [bncp-mum].divisions (course_id, division, division_num, division_count, 
                count_for_theory_batch, count_for_practical_batch, count_for_tutorial_batch, count_for_workshop_batch) VAlUES (@courseId, @division,
                    @divisionNum, @divisionCount, @countTheoryBatch, @countPracticalBatch, @countTutorialBatch, @countWorkshopBatch)`)
        })
    }

    static getDivision(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id).query(`SELECT id, course_id, division, division_num, division_count, count_for_theory_batch, count_for_practical_batch, count_for_tutorial_batch, count_for_workshop_batch FROM [bncp-mum].[divisions] WHERE id = @id`)
        })
    }

    static updateDivision(body) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, body.id)
            .input('courseId', sql.Int, body.courseId)
            .input('division', sql.Char, body.division)
            .input('divisionNum', sql.Int, body.divisionNum)
            .input('divisionCount', sql.Int, body.divisionCount)
            .input('countTheoryBatch', sql.Int, body.countTheoryBatch)
            .input('countPracticalBatch', sql.Int, body.countPracticalBatch)
            .input('countTutorialBatch', sql.Int, body.countTutorialBatch)
            .input('countWorkshopBatch', sql.Int, body.countWorkshopBatch)
            .query(`UPDATE [bncp-mum].[divisions] SET course_id = @courseId, division = @division, division_num = @divisionNum, division_count = @divisionCount,
             count_for_theory_batch = @countTheoryBatch, count_for_practical_batch = @countPracticalBatch, count_for_tutorial_batch = @countTutorialBatch, count_for_workshop_batch = @countWorkshopBatch WHERE id = @id`)
        })
    }

    static search(rowcount, keyword) {
        return poolConnection.then(pool => {
            return pool.request().input('keyword', sql.NVarChar(100), '%' + keyword + '%')
            // .query(`SELECT TOP ${Number(rowcount)} d.id , cw.module_name AS course,
            // d.division, d.division_num, d.division_count, d.status1, d.count_for_theory_batch, d.count_for_practical_batch,
            // d.count_for_tutorial_batch, d.count_for_workshop_batch FROM [bncp-mum].divisions d
            // INNER JOIN [bncp-mum].initial_course_workload cw ON cw.id = d.course_id WHERE d.active = 1
            // AND cw.module_name LIKE @keyword OR d.division LIKE @keyword OR d.division_num LIKE @keyword OR d.division_count LIKE @keyword
            // OR d.count_for_theory_batch LIKE @keyword OR d.count_for_practical_batch LIKE @keyword OR d.count_for_tutorial_batch LIKE @keyword
            // OR d.count_for_workshop_batch LIKE @keyword ORDER BY d.id DESC`)
            .query(`SELECT TOP ${Number(rowcount)} d.id , cw.module_name AS course,
            d.division, d.division_num, d.division_count, d.status1,
            CASE WHEN d.count_for_theory_batch  IS NULL THEN '' ELSE d.count_for_theory_batch END as count_for_theory_batch,
            CASE WHEN d.count_for_practical_batch  IS NULL THEN '' ELSE d.count_for_practical_batch END as count_for_practical_batch,
            CASE WHEN d.count_for_tutorial_batch  IS NULL THEN '' ELSE d.count_for_tutorial_batch END as count_for_tutorial_batch,
            CASE WHEN d.count_for_workshop_batch  IS NULL THEN '' ELSE d.count_for_workshop_batch END as count_for_workshop_batch
            FROM [bncp-mum].divisions d
            INNER JOIN [bncp-mum].initial_course_workload cw ON cw.id = d.course_id WHERE d.active = 1
            AND cw.module_name LIKE @keyword OR d.division LIKE @keyword OR d.division_num LIKE @keyword OR d.division_count LIKE @keyword
            OR d.count_for_theory_batch LIKE @keyword OR d.count_for_practical_batch LIKE @keyword OR d.count_for_tutorial_batch LIKE @keyword
            OR d.count_for_workshop_batch LIKE @keyword ORDER BY d.id DESC`)
        })
    }


    static deleteDivision(id) {
        return poolConnection.then(pool => {
            return pool.request().input('id', sql.Int, id)
            .query(`UPDATE [bncp-mum].divisions SET active = 0 WHERE id = @id`)
        })
    }
}


