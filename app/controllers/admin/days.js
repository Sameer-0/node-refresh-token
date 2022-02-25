module.exports = {
    getPage: (req, res) => {
        console.log('Req::::::::::::::::',req)
        res.render('admin/days/index')
    }
}