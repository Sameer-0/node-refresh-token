const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db.js')


module.exports = class User {

    constructor(username, password, fName, lName, empId, email, contactNumber, role) {
        this.username = username;
        this.password = password;
        this.fName = fName;
        this.lName = lName;
        this.empId = empId;
        this.email = email;
        this.contactNumber = contactNumber;
        this.role = role;
    }

    static fetchAll() {
        //return execPreparedStmt(`SELECT * FROM injection_test`)
        return poolConnection.then(pool => {
            return pool.request().input('age', sql.Int, 22).query(`SELECT * FROM injection_test WHERE age = @age;`)
        })
    }
}
