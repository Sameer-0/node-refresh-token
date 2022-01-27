const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

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

        return poolConnection.then(pool => {
            return pool.request().input().query(`SELECT id, username, password, f_name, l_name, employee_id, email, contact_number, role_id  FROM [bncp-mum].users WHERE active = 1`)
        })
    }

    static fetchUserById(id) {
        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, id)
            return request.query(`SELECT username, password, f_name, l_name, employee_id, email, contact_number, role_id FROM [bncp-mum].[users] WHERE id = @id`)
        })
    }

    static updateUserById(body) {
        // console.log(body)

        return poolConnection.then(pool => {
            let request = pool.request();
            request.input('id', sql.Int, body.id)
                .input('username', sql.NVarChar(50), body.username)
                .input('password', sql.NVarChar(50), body.password)
                .input('fName', sql.NVarChar(50), body.f_name)
                .input('lName', sql.NVarChar(50), body.l_name)
                .input('empId', sql.NVarChar(50), body.employee_id)
                .input('email', sql.NVarChar(50), body.email)
                .input('contactNumber', sql.NVarChar(15), body.contact)
                .input('roleId', sql.Int, body.role_id)

                .query(`UPDATE [bncp-mum].[users] SET username = @username, password = @password, f_name = @fName, l_name= @lName,
            employee_id = @empId, email = @email, contact_number = @contactNumber, role_id = @roleId WHERE id = @id`);

        })
    }


    static addUser(body) {

        return poolConnection.then(pool => {
            return pool.request().input('username', sql.NVarChar(100), body.username)
                .input('password', sql.NVarChar(500), body.password)
                .input('fName', sql.NVarChar(50), body.fName)
                .input('lName', sql.NVarChar(50), body.lName)
                .input('empId', sql.NVarChar(50), body.empId)
                .input('email', sql.NVarChar(50), body.email)
                .input('contactNumber', sql.NVarChar(15), body.contactNumber)
                .input('roleId', sql.Int, body.role)

                .query(`INSERT INTO [bncp-mum].[users] (username, password, f_name, l_name, employee_id, email,
                contact_number, role_id ) VALUES (@username, @password, @fName, @lName,
                @empId, @email, @contactNumber, @roleId)`)
        })
    }

    static deleteUser(id) {
        return poolConnection.then(pool => {
            let request = pool.request()
            request.input('id', sql.Int, id)
            return request.query(`UPDATE FROM [bncp-mum].[users] SET active = 0 WHERE id = @id`)
        })
    }


    static findUserByUsername(username) {
        return poolConnection.then(pool => {
            return pool.request().input('username', sql.NVarChar(50), username)
                .query(`SELECT f_name, l_name, employee_id, email, contact_number, role_id FROM [bncp-mum].users WHERE username = @username`)
        })
    }

    static passwordByUsername(username, slug) {
        return poolConnection.then(pool => {
            return pool.request()
            .input('username', sql.NVarChar(50), username)
           // .query(`SELECT password, username, f_name, l_name, employee_id, email, contact_number, role_id FROM [${slug}].users WHERE username = @username`)
         .query(`select u.id, u.username, u.password, u.f_name, u.l_name,u.employee_id, u.email,u.contact_number, r.name as role from [${slug}].users u join [dbo].[roles] r on u.role_id = r.id where u.active =1 and r.active = 1  and u.username =  @username`)
        })
    }




}