module.exports = {

    getPage: (req, res) => {
        res.render('admin/simulationChart/index', {
            breadcrumbs: req.breadcrumbs,
            Url: req.originalUrl
        })
    }

}