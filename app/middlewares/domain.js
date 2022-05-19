const {
    append
} = require('express/lib/response');
const {
    sql,
    poolConnection,
    execPreparedStmt
} = require('../../config/db')

module.exports = {
    verifySubdomain: (req, res, next) => {

        let checkArr = ['map', 'png', 'jpg', 'jpeg', 'css', 'js', 'ico']
        let isUrl = 1;

        let splitedDomain = req.url.split('.')

        for (let item of checkArr) {
            if (splitedDomain[splitedDomain.length - 1] == item) {
                isUrl = 0;
                break;
            }
        }

        console.log("req.url =========>", req.url);

        if (isUrl) {
            let subDomain = req.headers.host.split(".")[0];
            console.log("subdomain =========>", subDomain);

            if (subDomain === 'timetable')
                return next()

            poolConnection
                .then(pool => {
                    return pool.request()
                        .input('slugName', sql.NVarChar(50), subDomain)
                        .query(`SELECT slug_name, campus_lid, org_lid FROM [dbo].tenants WHERE slug_name = @slugName`);
                }).then(result => {
                    if (result.recordset.length === 0) {
                        return res.send('Invalid subdomain!!!')
                    }
                    res.locals.slug = result.recordset[0].slug_name
                    res.locals.organizationId = result.recordset[0].org_lid
                    res.locals.campusId = result.recordset[0].campus_lid
                    console.log('Domain:::::::', res.locals.slug)
                    next();
                })
        } else {
            next();
        }



    },
}