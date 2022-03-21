const res = require("express/lib/response")

module.exports = {
    getPage: (req, res) => {
        res.render('management/room/requests')
    }
}